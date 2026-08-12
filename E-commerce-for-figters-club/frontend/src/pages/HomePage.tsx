import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/features/hero/Hero'
import ProductCard from '@/components/features/product/ProductCard'

// Mock products — will be replaced with real API call later
const MOCK_PRODUCTS = [
  { id: 1, name: 'Wireless Noise Cancelling Headphones Pro', price: 2499, originalPrice: 4999, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', category: 'Electronics', rating: 5, reviews: 128 },
  { id: 2, name: 'Premium Running Shoes - Lightweight & Breathable', price: 1899, originalPrice: 2999, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop', category: 'Footwear', rating: 4, reviews: 89 },
  { id: 3, name: 'Smart Watch Series 8 - Health & Fitness Tracker', price: 3299, originalPrice: 5499, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', category: 'Wearables', rating: 4, reviews: 214 },
  { id: 4, name: 'Organic Cotton T-Shirt Pack of 3', price: 799, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop', category: 'Clothing', rating: 4, reviews: 56 },
  { id: 5, name: 'Stainless Steel Water Bottle 1L Insulated', price: 599, originalPrice: 999, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop', category: 'Kitchen', rating: 5, reviews: 302 },
  { id: 6, name: 'Mechanical Keyboard RGB Backlit TKL', price: 2199, originalPrice: 3499, image: 'https://images.unsplash.com/photo-1595044778657-18d79c16e3db?w=400&h=300&fit=crop', category: 'Electronics', rating: 4, reviews: 78 },
  { id: 7, name: 'Yoga Mat Non-Slip Extra Thick 6mm', price: 899, originalPrice: 1499, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop', category: 'Fitness', rating: 5, reviews: 445 },
  { id: 8, name: 'Portable Bluetooth Speaker Waterproof', price: 1499, originalPrice: 2499, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop', category: 'Electronics', rating: 4, reviews: 167 },
]

const CATEGORIES = [
  { name: 'Electronics', icon: '💻', count: '2.4k items' },
  { name: 'Clothing', icon: '👕', count: '8.1k items' },
  { name: 'Footwear', icon: '👟', count: '1.2k items' },
  { name: 'Kitchen', icon: '🍳', count: '3.5k items' },
  { name: 'Fitness', icon: '🏋️', count: '980 items' },
  { name: 'Wearables', icon: '⌚', count: '640 items' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <Hero />

        {/* Categories */}
        <section className="max-w-7xl mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900">Shop by Category</h2>
              <p className="text-gray-400 text-sm mt-1">Find what you're looking for</p>
            </div>
            <a href="#" className="text-orange-500 text-sm font-semibold hover:underline">View all →</a>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {CATEGORIES.map(cat => (
              <div key={cat.name} className="card p-4 text-center cursor-pointer hover:border-orange-200 hover:border group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">{cat.icon}</div>
                <div className="font-semibold text-gray-800 text-sm">{cat.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{cat.count}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="max-w-7xl mx-auto px-4 py-6 pb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-gray-400 text-sm mt-1">Handpicked deals just for you</p>
            </div>
            <a href="#" className="text-orange-500 text-sm font-semibold hover:underline">View all →</a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {MOCK_PRODUCTS.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Banner CTA */}
        <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-14 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold text-white mb-3">Get 20% Off Your First Order</h2>
            <p className="text-orange-100 mb-8">Sign up and unlock exclusive deals, early access to sales, and more.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl text-gray-800 outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-orange-600 font-semibold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors">
                Get Offer
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
