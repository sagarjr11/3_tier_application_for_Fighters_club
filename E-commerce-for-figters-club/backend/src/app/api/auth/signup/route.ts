/**
 * POST /api/auth/signup
 */
import { NextRequest, NextResponse } from 'next/server'
import { connectMongo }   from '@/lib/mongodb'
import User               from '@/models/User'
import { generateToken }  from '@/middleware/auth'
import { NotificationPublisher } from '@/lib/rabbitmq'
import { z } from 'zod'

const SignupSchema = z.object({
  name:     z.string().min(2).max(50),
  email:    z.string().email(),
  password: z.string().min(6),
  phone:    z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    await connectMongo()
    const body = await req.json()

    // Validate input
    const parsed = SignupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, phone } = parsed.data

    // Check duplicate
    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      )
    }

    const user = await User.create({ name, email, password, phone })

    const token = generateToken({
      id: user._id.toString(), email: user.email, name: user.name, role: user.role
    })

    // Queue welcome email via RabbitMQ (non-blocking)
    NotificationPublisher.sendEmail({
      to: email,
      subject: 'Welcome to ShopEase!',
      template: 'welcome',
      data: { name }
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      data:    { token, user },
      message: 'Account created successfully'
    }, { status: 201 })

  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
