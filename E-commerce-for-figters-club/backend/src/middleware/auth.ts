import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { AuthUser } from '@/types'

const JWT_SECRET =
  process.env.JWT_SECRET || 'change_this_in_production'

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn:
        (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
    }
  )
}

export function verifyToken(token: string): AuthUser {
  return jwt.verify(token, JWT_SECRET) as AuthUser
}

/** Extract and verify JWT from Authorization header */
export function getAuthUser(
  req: NextRequest
): AuthUser | null {
  try {
    const authHeader = req.headers.get('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.split(' ')[1]

    return verifyToken(token)
  } catch {
    return null
  }
}

/** Route guard — returns user or 401 response */
export function requireAuth(
  req: NextRequest
): { user: AuthUser } | NextResponse {
  const user = getAuthUser(req)

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized — please login',
      },
      {
        status: 401,
      }
    )
  }

  return { user }
}

/** Admin only guard */
export function requireAdmin(
  req: NextRequest
): { user: AuthUser } | NextResponse {
  const result = requireAuth(req)

  if (result instanceof NextResponse) {
    return result
  }

  if (result.user.role !== 'admin') {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden — admin only',
      },
      {
        status: 403,
      }
    )
  }

  return result
}