export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 py-16 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">

        {/* Left */}
        <div className="flex-1 text-center md:text-left">
          <span className="inline-block bg-orange-100 text-orange-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            🛍️ New Arrivals Every Day
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Shop Smart,<br />
            <span className="text-orange-500">Live Better</span>
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-md">
            Discover thousands of products at unbeatable prices. Fast delivery, easy returns, and real customer support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <button className="btn-primary">
              Shop Now →
            </button>
            <button className="btn-outline">
              View Deals
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex gap-6 mt-10 justify-center md:justify-start">
            {[
              { icon: '🚚', label: 'Free Delivery', sub: 'On orders ₹499+' },
              { icon: '↩️', label: 'Easy Returns', sub: '7-day policy' },
              { icon: '🔒', label: 'Secure Pay', sub: '100% safe' },
            ].map(b => (
              <div key={b.label} className="text-center">
                <div className="text-2xl mb-1">{b.icon}</div>
                <div className="text-xs font-semibold text-gray-700">{b.label}</div>
                <div className="text-xs text-gray-400">{b.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — placeholder visual */}
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <div className="w-80 h-80 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl shadow-2xl flex items-center justify-center">
              <span className="text-8xl">🛒</span>
            </div>
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-white shadow-lg rounded-2xl px-4 py-2 text-center">
              <div className="text-2xl font-bold text-orange-500">50K+</div>
              <div className="text-xs text-gray-500">Products</div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white shadow-lg rounded-2xl px-4 py-2 text-center">
              <div className="text-2xl font-bold text-green-500">4.8★</div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
