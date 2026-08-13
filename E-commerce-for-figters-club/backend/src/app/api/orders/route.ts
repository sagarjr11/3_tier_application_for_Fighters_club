/**
 * GET  /api/orders — user's orders
 * POST /api/orders — place new order
 *
 * Flow: cart (Redis) → order (MongoDB) → transaction (MySQL) → queue (RabbitMQ)
 */
import { NextRequest, NextResponse } from 'next/server'
import { connectMongo }         from '@/lib/mongodb'
import Order                    from '@/models/Order'
import { CartCache }            from '@/lib/redis'
import { queryDB }              from '@/lib/mysql'
import { OrderPublisher, NotificationPublisher, InventoryPublisher } from '@/lib/rabbitmq'
import { requireAuth }          from '@/middleware/auth'
import { v4 as uuidv4 }        from 'uuid'

// ─── GET user orders ──────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    await connectMongo()
    const { searchParams } = new URL(req.url)
    const page  = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const orders = await Order.find({ userId: auth.user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await Order.countDocuments({ userId: auth.user.id })

    return NextResponse.json({
      success: true,
      data: { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// ─── POST place order ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    await connectMongo()
    const { address, paymentMethod, notes } = await req.json()

    if (!address || !paymentMethod) {
      return NextResponse.json({ success: false, error: 'Address and payment method required' }, { status: 400 })
    }

    // Get cart from Redis
    const cart = await CartCache.get(auth.user.id)
    if (!cart || !cart.items?.length) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 })
    }

    const deliveryCharge = cart.total >= 499 ? 0 : 49
    const total = cart.total + deliveryCharge

    // 1. Create order in MongoDB
    const order = await Order.create({
      userId:         auth.user.id,
      items:          cart.items,
      subtotal:       cart.total,
      discount:       0,
      deliveryCharge,
      total,
      status:         'pending',
      paymentStatus:  'pending',
      paymentMethod,
      address,
      notes,
    })

    // 2. Create transaction record in Percona MySQL (ACID)
    const txnId = uuidv4()
    await queryDB(
      `INSERT INTO transactions (id, order_id, user_id, amount, payment_method)
       VALUES (?, ?, ?, ?, ?)`,
      [txnId, order._id.toString(), auth.user.id, total, paymentMethod]
    )

    // 3. Clear cart from Redis
    await CartCache.clear(auth.user.id)

    // 4. Publish to RabbitMQ queues (async — don't block response)
    const orderId = order._id.toString()
    Promise.allSettled([
      OrderPublisher.newOrder({ orderId, userId: auth.user.id, items: cart.items, total }),
      InventoryPublisher.decrementStock(cart.items.map((i: { productId: string; quantity: number }) => ({
        productId: i.productId, quantity: i.quantity
      }))),
      NotificationPublisher.sendEmail({
        to:       auth.user.email,
        subject:  `Order #${orderId.slice(-8).toUpperCase()} confirmed!`,
        template: 'order_confirmation',
        data:     { order, user: auth.user }
      }),
    ]).catch(console.error)

    return NextResponse.json({
      success: true,
      data:    { order, transactionId: txnId },
      message: 'Order placed successfully'
    }, { status: 201 })

  } catch (err) {
    console.error('Order POST error:', err)
    return NextResponse.json({ success: false, error: 'Failed to place order' }, { status: 500 })
  }
}
