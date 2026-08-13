import mongoose, { Schema, Model } from 'mongoose'

export interface IProduct {
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  category: string
  images: string[]
  stock: number
  rating: number
  reviews: number
  tags: string[]
  isActive: boolean
  attributes: Record<string, unknown>
  createdAt?: Date
  updatedAt?: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    originalPrice: {
      type: Number,
      min: 0,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    images: [
      {
        type: String,
      },
    ],

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    tags: [
      {
        type: String,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
ProductSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
})

ProductSchema.index({
  price: 1,
})

ProductSchema.index({
  category: 1,
  isActive: 1,
})

const Product: Model<IProduct> =
  mongoose.models.Product ||
  mongoose.model<IProduct>('Product', ProductSchema)

export default Product