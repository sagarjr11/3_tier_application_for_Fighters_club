/**
 * MongoDB Connection (Mongoose)
 * Used for: Products, Users, Orders
 * Why MongoDB? Flexible schema — products can have different attributes
 * Electronics have specs, clothing has sizes/colors etc.
 */
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in .env.local')
}

// Global cache prevents multiple connections in dev (Next.js hot reload)
declare global {
  var mongooseCache: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

let cached = global.mongooseCache
if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null }
}

export async function connectMongo() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
  }

  try {
    cached.conn = await cached.promise
    console.log('✅ MongoDB connected')
    return cached.conn
  } catch (err) {
    cached.promise = null
    console.error('❌ MongoDB connection failed:', err)
    throw err
  }
}
