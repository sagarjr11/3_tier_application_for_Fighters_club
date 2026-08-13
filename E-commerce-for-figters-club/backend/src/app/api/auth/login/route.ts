/**
 * POST /api/auth/login
 */
import { NextRequest, NextResponse } from 'next/server'
import { connectMongo }   from '@/lib/mongodb'
import User               from '@/models/User'
import { generateToken }  from '@/middleware/auth'
import { SessionCache }   from '@/lib/redis'
import { z } from 'zod'

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    await connectMongo()
    const body = await req.json()

    const parsed = LoginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password format' },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    // Find user — include password for comparison
    const user = await User.findOne({ email, isActive: true }).select('+password')
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = generateToken({
      id: user._id.toString(), email: user.email, name: user.name, role: user.role
    })

    // Store session in Redis
    await SessionCache.set(token, user._id.toString())

    return NextResponse.json({
      success: true,
      data: { token, user },
      message: 'Login successful'
    })

  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
