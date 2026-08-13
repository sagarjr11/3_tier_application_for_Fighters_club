import mongoose, { Schema, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser {
  name: string
  email: string
  password: string
  phone?: string

  role: 'user' | 'admin'

  address?: {
    street: string
    city: string
    state: string
    pincode: string
  }

  isActive: boolean

  createdAt?: Date
  updatedAt?: Date

  comparePassword(candidate: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phone: {
      type: String,
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  this.password = await bcrypt.hash(
    this.password,
    12
  )

  next()
})

// Compare password
UserSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(
    candidate,
    this.password
  )
}

// Never return password in JSON
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const result =
      ret as unknown as Record<string, unknown>

    delete result.password

    return result
  },
})

// Prevent model recompilation during Next.js hot reload
const User: Model<IUser> =
  mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema)

export default User