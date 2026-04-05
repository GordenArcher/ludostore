import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import AdminLayout from "../layouts/AdminLayout";
import { ProtectedRoute } from "../components/protectedRoute";
import Login from "../pages/auth/login";
import Dashboard from "../pages/dashboard";
import Products from "../pages/product/products";
import Orders from "../pages/orders/orders";
import Customers from "../pages/customers";
import Settings from "../pages/settings";
import OrderDetail from "../pages/orders/orderDetail";
import Categories from "../pages/categories";
import ProductDetail from "../pages/product/productDetail";

export const router = createBrowserRouter([
  {
    path: "/admin",
    element: <App />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                index: true,
                element: <Navigate to="/admin/dashboard" replace />,
              },
              {
                path: "dashboard",
                element: <Dashboard />,
              },
              {
                path: "products",
                element: <Products />,
              },
              {
                path: "products/:id",
                element: <ProductDetail />,
              },
              {
                path: "orders",
                element: <Orders />,
              },
              {
                path: "orders/:id",
                element: <OrderDetail />,
              },
              {
                path: "categories",
                element: <Categories />,
              },
              {
                path: "customers",
                element: <Customers />,
              },

              {
                path: "settings",
                element: <Settings />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/admin/auth",
    children: [
      {
        path: "login",
        element: <Login />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/admin/dashboard" replace />,
  },
]);
