# ShopEase — Frontend

React.js e-commerce frontend built with Vite + TypeScript + Tailwind CSS.

## Tech Stack
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (routing)
- Zustand (state — added when cart/auth is built)
- Axios (API calls — added when backend is ready)

## Getting Started

### Prerequisites
- Node.js 20+
- npm or pnpm

### Setup
```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env.local

# Start dev server
npm run dev
```
Open http://localhost:3000

### Build for production
```bash
npm run build
```

### Run with Docker
```bash
docker build -t ecommerce-frontend .
docker run -p 8080:80 ecommerce-frontend
```
Open http://localhost:8080

## Branch Strategy
- `main` — production
- `develop` — active development
- `feature/*` — new features
- `hotfix/*` — emergency fixes

## Roadmap
- [x] Homepage with hero, categories, products
- [ ] Login / Signup page
- [ ] Product detail page
- [ ] Cart functionality
- [ ] Checkout flow
- [ ] Order tracking
