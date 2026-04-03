
# LudoStore Admin

Admin dashboard for LudoStore - Manage products, orders, customers, and store operations.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router DOM** - Routing
- **Framer Motion** - Animations
- **Axios** - API calls
- **Recharts** - Dashboard charts
- **Lucide React** - Icons

## Project Structure

```
ludostore-admin/
├── src/
│   ├── api/              
│   ├── assets/           
│   ├── components/       
│   │   ├── loaders/     
│   │   ├── modals/   
│   ├── layouts/          
│   ├── pages/            
│   ├── store/           
│   ├── types/          
│   ├── utils/            
│   │   └── axios.ts
│   ├── routes/           
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Features

### Authentication
- Admin login with JWT
- Protected routes
- Session management

### Dashboard
- KPI statistics cards
- Revenue chart with period selection
- Order status distribution
- Recent orders and customers

### Products
- Product listing with pagination
- Search and filters (category, status, low stock)
- Stock management (inline editing)
- Create/Edit/Delete products
- Product image upload

### Categories
- Category management (CRUD)
- Search functionality

### Orders
- Order listing with pagination
- Search and status filters
- Order details view
- Status update with admin notes

### Customers
- Customer listing with pagination
- Role and status filters
- Change user role (operator/customer)
- Block/Activate users

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/GordenArcher/ludostore.git

# Navigate to admin directory
cd ludostore/ludostore-admin

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

This admin panel expects a Django backend with the following endpoints:

- `/api/v1/operator/auth/` - Authentication
- `/api/v1/operator/dashboard/` - Dashboard stats
- `/api/v1/operator/products/` - Product management
- `/api/v1/operator/orders/` - Order management
- `/api/v1/operator/users/` - User management
- `/api/v1/operator/categories/` - Category management

## Design System

- **Colors**: Black and white theme with gray accents
- **Background**: `#000000` (black)
- **Cards**: `#000000` with `#1f1f1f` borders
- **Buttons**: Yellow (`#eab308`) for primary actions
- **Status Colors**: Red, Green, Yellow, Blue with opacity

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
