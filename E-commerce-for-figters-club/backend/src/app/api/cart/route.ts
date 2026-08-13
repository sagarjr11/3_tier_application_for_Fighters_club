/**
 * GET    /api/cart  — get user's cart (from Redis)
 * POST   /api/cart  — add item to cart
 * DELETE /api/cart  — clear cart
 *
 * Cart lives entirely in Redis — fast, no DB needed
 * Cart data syncs to DB only when order is placed
 */
import { NextRequest, NextResponse } from 'next/server'
import { CartCache }  from '@/lib/redis'
import { requireAuth } from '@/middleware/auth'
import { connectMongo } from '@/lib/mongodb'
import Product from '@/models/Product'

interface CartItem {
  productId:  string
  name:       string
  price:      number
  image:      string
  quantity:   number
}

// ─── GET cart ─────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const cart = await CartCache.get(auth.user.id) || { items: [], total: 0 }
  return NextResponse.json({ success: true, data: cart })
}

// ─── POST — add or update item ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    await connectMongo()
    const { productId, quantity = 1 } = await req.json()

    if (!productId || quantity < 1) {
      return NextResponse.json({ success: false, error: 'Invalid product or quantity' }, { status: 400 })
    }

    // Verify product exists and has stock
    const product = await Product.findById(productId).lean()
    if (!product || !product.isActive) {
      return NextResponse.json({ success: false, error: 'Product not available' }, { status: 404 })
    }
    if (product.stock < quantity) {
      return NextResponse.json({ success: false, error: `Only ${product.stock} in stock` }, { status: 400 })
    }

    // Get current cart
    const cart = await CartCache.get(auth.user.id) || { items: [] as CartItem[] }

    // Update or add item
    const existing = cart.items.findIndex((i: CartItem) => i.productId === productId)
    if (existing >= 0) {
      cart.items[existing].quantity += quantity
    } else {
      cart.items.push({
        productId,
        name:     product.name,
        price:    product.price,
        image:    product.images[0] || '',
        quantity,
      })
    }

    // Recalculate total
    cart.total = cart.items.reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0)

    await CartCache.set(auth.user.id, cart)
    return NextResponse.json({ success: true, data: cart, message: 'Cart updated' })

  } catch (err) {
    console.error('Cart POST error:', err)
    return NextResponse.json({ success: false, error: 'Failed to update cart' }, { status: 500 })
  }
}

// ─── DELETE — clear cart ──────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth instanceof NextResponse) return auth

  await CartCache.clear(auth.user.id)
  return NextResponse.json({ success: true, message: 'Cart cleared' })
}
