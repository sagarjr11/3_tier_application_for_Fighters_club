import { NextRequest } from 'next/server'

export interface AuthUser {
  id:    string
  email: string
  name:  string
  role:  'user' | 'admin'
}

export interface AuthNextRequest extends NextRequest {
  user?: AuthUser
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?:   T
  message?: string
  error?:  string
}

export function ok<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, message }
}

export function fail(error: string): ApiResponse {
  return { success: false, error }
}
