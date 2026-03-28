import { createBrowserRouter } from 'react-router-dom';// src/routes.jsx
import Admin from '../pages/admin/Admin'
import Blog from '../pages/blog/Blog';
import Applayout from '../pages/main/Applayout'
import ErrorPage from '../pages/errorpage/ErrorPage'
const router = createBrowserRouter([
  {
    path: "/",
    element: <Applayout />,
    children: [
      {
        path: "profile",
        element: <div>User Profile Component</div>,
      },
      {
        path: "settings",
        element: <div>User Settings Component</div>,
      },
    ],
    errorElement: <ErrorPage />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/blog",
    element: <Blog />
  },
]);

export default router;