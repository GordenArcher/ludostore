
# LudoStore Web - Frontend

Modern e-commerce frontend for Ludo, a premium Ludo board games store built with React, TypeScript, and Tailwind CSS.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Zustand** - State management
- **React Router DOM** - Routing
- **Framer Motion** - Animations
- **Axios** - API calls
- **Lucide React** - Icons

## Project Structure

```
ludostore-web/
├── src/
│   ├── api/              # API service layer
│   ├── assets/           # Static assets (images, videos)
│   ├── components/       # Reusable components
│   │   ├── loading/      # Skeleton loaders
│   │   └── modals/       # Modal components
│   ├── pages/            # Page components
│   │   └── auth/         # Authentication pages
│   ├── store/            # Zustand state stores
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   │   └── cart/         # Guest cart utilities
│   ├── routes/           # Route configuration
│   ├── global/           # Global styles
│   ├── App.tsx
│   └── main.tsx
├── public/               # Public assets
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Features

### Authentication
- Login/Register with JWT
- Password reset
- Email verification
- Guest cart sync on login

### Products
- Product listing with pagination
- Advanced filtering (category, price range, stock, featured)
- Sorting (newest, price, name)
- Search functionality
- Product detail with image gallery
- Wishlist management with notes

### Cart
- Guest cart (localStorage)
- Authenticated cart (API)
- Cart sync on login
- Quantity updates with modal
- Cart count badge

### Checkout
- Address selection modal
- Multiple payment methods (Cash on Delivery, Paystack)
- Order notes
- Paystack payment integration
- Order confirmation

### Orders
- Order history with pagination
- Order details with print/PDF download
- Order status tracking
- Cancel pending orders
- Payment status indicators

### User Profile
- Personal information management
- Password change
- Address book (CRUD)
- Default address setting

### Support
- FAQ section
- Shipping information
- Returns policy
- Payment methods guide
- Contact form

### Legal Pages
- Privacy Policy
- Terms of Service
- Cookie Policy

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/GordenArcher/ludostore.git

# Navigate to frontend directory
cd ludostore/ludostore-web

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Backend Integration

This frontend expects a Django backend with the following endpoints:

- `/api/v1/accounts/` - Authentication endpoints
- `/api/v1/products/` - Product management
- `/api/v1/cart/` - Cart operations
- `/api/v1/orders/` - Order management
- `/api/v1/wishlist/` - Wishlist operations
- `/api/v1/addresses/` - Address management

## Key Features Implementation

### Guest Cart
- Unauthenticated users have cart stored in localStorage
- Cart syncs automatically when user logs in
- Prevents data loss during login/logout

### Video Carousel
- Hero section with video carousel
- Add videos to `assets/video/` folder
- Update `heroVideos` array in Home page

### Print Order
- Order details page includes print-friendly styles
- PDF download via browser print

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

MIT
