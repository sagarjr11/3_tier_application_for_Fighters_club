/**
 * GET /api/health
 * Checks all DB connections — used by Kubernetes liveness/readiness probes
 */
import { NextResponse } from 'next/server'
import { connectMongo }   from '@/lib/mongodb'
import redis              from '@/lib/redis'
import pool               from '@/lib/mysql'

export async function GET() {
  const status: Record<string, string> = {
    api:      'ok',
    mongodb:  'unknown',
    mysql:    'unknown',
    redis:    'unknown',
    rabbitmq: 'unknown',
  }

  // MongoDB
  try {
    await connectMongo()
    status.mongodb = 'ok'
  } catch {
    status.mongodb = 'error'
  }

  // MySQL
  try {
    const conn = await pool.getConnection()
    await conn.query('SELECT 1')
    conn.release()
    status.mysql = 'ok'
  } catch {
    status.mysql = 'error'
  }

  // Redis
  try {
    await redis.ping()
    status.redis = 'ok'
  } catch {
    status.redis = 'error'
  }

  // RabbitMQ — simple check
  try {
    const { connectRabbitMQ } = await import('@/lib/rabbitmq')
    await connectRabbitMQ()
    status.rabbitmq = 'ok'
  } catch {
    status.rabbitmq = 'error'
  }

  const allOk = Object.values(status).every(s => s === 'ok')

  return NextResponse.json(
    { success: allOk, status, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 503 }
  )
}
