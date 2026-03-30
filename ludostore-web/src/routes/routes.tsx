import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/auth/login";
import Register from "../pages/auth/Register";
import VerifyAccount from "../pages/auth/VerifyAccount";

export const router = createBrowserRouter([
  {
    path: "/",
    index: true,
    element: <App />,
  },
  {
    path: "auth",
    children: [
      {
        path: "login",
        index: true,
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
