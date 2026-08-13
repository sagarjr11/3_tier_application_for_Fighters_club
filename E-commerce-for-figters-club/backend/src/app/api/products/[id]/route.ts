/**
 * GET    /api/products/:id
 * PUT    /api/products/:id  (admin)
 * DELETE /api/products/:id  (admin)
 */
import { NextRequest, NextResponse } from 'next/server'
import { connectMongo }        from '@/lib/mongodb'
import Product                 from '@/models/Product'
import { getCache, setCache, deleteCache, deleteCachePattern } from '@/lib/redis'
import { requireAdmin }        from '@/middleware/auth'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectMongo()
    const cacheKey = `product:${params.id}`

    const cached = await getCache(cacheKey)
    if (cached) return NextResponse.json({ success: true, data: cached, fromCache: true })

    const product = await Product.findById(params.id).lean()
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    await setCache(cacheKey, product, 600) // cache 10 min
    return NextResponse.json({ success: true, data: product })
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
    const body    = await req.json()
    const product = await Product.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })
    if (!product) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })

    await deleteCache(`product:${params.id}`)
    await deleteCachePattern('products:*')

    return NextResponse.json({ success: true, data: product, message: 'Product updated' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = requireAdmin(req)
  if (auth instanceof NextResponse) return auth

  try {
    await connectMongo()
    // Soft delete — just mark inactive
    await Product.findByIdAndUpdate(params.id, { isActive: false })

    await deleteCache(`product:${params.id}`)
    await deleteCachePattern('products:*')

    return NextResponse.json({ success: true, message: 'Product deleted' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 })
  }
}
