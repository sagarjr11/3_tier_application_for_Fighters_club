/**
 * GET  /api/products  — list products (cached in Redis)
 * POST /api/products  — create product (admin only)
 */
import { NextRequest, NextResponse } from 'next/server'
import { connectMongo }   from '@/lib/mongodb'
import Product            from '@/models/Product'
import { getCache, setCache } from '@/lib/redis'
import { requireAdmin }   from '@/middleware/auth'

// ─── GET all products ─────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await connectMongo()

    const { searchParams } = new URL(req.url)
    const page     = parseInt(searchParams.get('page')     || '1')
    const limit    = parseInt(searchParams.get('limit')    || '12')
    const category =            searchParams.get('category') || ''
    const search   =            searchParams.get('search')   || ''
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')

    // Cache key includes all filters
    const cacheKey = `products:${page}:${limit}:${category}:${search}:${minPrice}:${maxPrice}`
    const cached   = await getCache(cacheKey)
    if (cached) {
      return NextResponse.json({ success: true, data: cached, fromCache: true })
    }

    // Build query
    const query: Record<string, unknown> = {
      isActive: true,
      price: { $gte: minPrice, $lte: maxPrice },
    }
    if (category) query.category = category
    if (search)   query.$text = { $search: search }

    const skip  = (page - 1) * limit
    const total = await Product.countDocuments(query)
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const result = {
      products,
      pagination: {
        page, limit, total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      }
    }

    // Cache for 5 minutes
    await setCache(cacheKey, result, 300)

    return NextResponse.json({ success: true, data: result })

  } catch (err) {
    console.error('Products GET error:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// ─── POST create product (admin only) ────────────────────────────────────────
export async function POST(req: NextRequest) {
  const auth = requireAdmin(req)
  if (auth instanceof NextResponse) return auth

  try {
    await connectMongo()
    const body = await req.json()

    // Auto-generate slug
    if (!body.slug) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    const product = await Product.create(body)

    // Bust product cache
    const { deleteCachePattern } = await import('@/lib/redis')
    await deleteCachePattern('products:*')

    return NextResponse.json(
      { success: true, data: product, message: 'Product created' },
      { status: 201 }
    )
  } catch (err: unknown) {
    const e = err as { code?: number; message?: string }
    if (e.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Product slug already exists' },
        { status: 409 }
      )
    }
    console.error('Product POST error:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
