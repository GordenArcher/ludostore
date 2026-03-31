import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/home";
import Login from "../pages/auth/login";
import Register from "../pages/auth/Register";
import VerifyAccount from "../pages/auth/VerifyAccount";
import Products from "../pages/products/products";
import ProductDetail from "../pages/products/ProductDetail";
import Wishlist from "../pages/wishlist";
import { ProtectedRoute } from "../components/ProtectedRoute";
import Cart from "../pages/cart/Cart";
import Checkout from "../pages/checkout/checkout";
import Orders from "../pages/orders/Orders";
import OrderDetail from "../pages/orders/OrderDetail";
import Verification from "../pages/payments/verification";
import Profile from "../pages/profile/profile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "products",
        children: [
          {
            index: true,
            element: <Products />,
          },
          {
            path: ":productId",
            element: <ProductDetail />,
          },
        ],
      },
      {
        path: "/wishlist",
        element: (
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        ),
      },
      {
        path: "/cart",
        element: <Cart />,
      },

      {
        path: "/checkout",
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },

      {
        path: "/orders",
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            ),
          },
          {
            path: "summary/:orderId",
            element: (
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            ),
          },
        ],
      },

      {
        path: "payment/verify",
        element: <Verification />,
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
    ],
  },

  {
    path: "/auth",
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "verify-account",
        element: <VerifyAccount />,
      },
    ],
  },
]);
