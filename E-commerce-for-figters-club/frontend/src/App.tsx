import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'

// Future pages go here — just uncomment when ready
// import LoginPage from './pages/LoginPage'
// import ProductsPage from './pages/ProductsPage'
// import CartPage from './pages/CartPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* <Route path="/login" element={<LoginPage />} /> */}
      {/* <Route path="/products" element={<ProductsPage />} /> */}
      {/* <Route path="/cart" element={<CartPage />} /> */}
    </Routes>
  )
}
