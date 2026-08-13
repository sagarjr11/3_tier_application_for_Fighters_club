import mongoose, { Schema, Model } from 'mongoose'

export interface IOrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface IOrder {
  userId: string
  items: IOrderItem[]
  total: number

  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'

  paymentStatus:
    | 'pending'
    | 'paid'
    | 'failed'
    | 'refunded'

  paymentMethod?: string
  transactionId?: string

  shippingAddress?: {
    name?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    pincode?: string
    country?: string
  }

  createdAt?: Date
  updatedAt?: Date
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    image: {
      type: String,
    },
  },
  { _id: false }
)

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    items: {
      type: [OrderItemSchema],
      required: true,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    paymentMethod: {
      type: String,
    },

    transactionId: {
      type: String,
    },

    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
  },
  {
    timestamps: true,
  }
)

OrderSchema.index({ userId: 1, createdAt: -1 })
OrderSchema.index({ status: 1 })

const Order: Model<IOrder> =
  mongoose.models.Order ||
  mongoose.model<IOrder>('Order', OrderSchema)

export default Order