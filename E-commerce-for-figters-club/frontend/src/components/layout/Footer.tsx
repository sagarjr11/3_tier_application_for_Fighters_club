export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="text-white font-bold">ShopEase</span>
          </div>
          <p className="text-sm leading-relaxed">India's favourite e-commerce destination. Fast, reliable, and affordable.</p>
        </div>
        {[
          { title: 'Shop', links: ['New Arrivals', 'Best Sellers', 'Deals', 'Categories'] },
          { title: 'Support', links: ['Help Center', 'Track Order', 'Returns', 'Contact Us'] },
          { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press'] },
        ].map(col => (
          <div key={col.title}>
            <h4 className="text-white font-semibold mb-4">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map(link => (
                <li key={link}>
                  <a href="#" className="text-sm hover:text-orange-400 transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto border-t border-gray-800 mt-10 pt-6 text-center text-sm">
        © 2026 ShopEase. All rights reserved.
      </div>
    </footer>
  )
}
