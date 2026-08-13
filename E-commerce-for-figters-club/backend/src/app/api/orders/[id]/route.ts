/**
 * GET /api/orders/:id  — get single order
 * PUT /api/orders/:id  — update order status (admin)
 */
import { NextRequest, NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongodb'
import Order            from '@/models/Order'
import { requireAuth, requireAdmin } from '@/middleware/auth'

type Params = { params: { id: string } }

export async function GET(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    await connectMongo()
    const order = await Order.findById(params.id).lean()

    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })

    // Users can only see their own orders
    if (order.userId !== auth.user.id && auth.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = requireAdmin(req)
  if (auth instanceof NextResponse) return auth

  try {
    await connectMongo()
    const { status, paymentStatus } = await req.json()

    const order = await Order.findByIdAndUpdate(
      params.id,
      { ...(status && { status }), ...(paymentStatus && { paymentStatus }) },
      { new: true }
    )

    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: order, message: 'Order updated' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 })
  }
}
