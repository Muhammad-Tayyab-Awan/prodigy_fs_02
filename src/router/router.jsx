import { BrowserRouter, Route, Routes } from "react-router";
import Dashboard from "../pages/dashboard/index";
import Login from "../pages/login";
import Profile from "../pages/profile";
import Register from "../pages/register";
import Logout from "../pages/logout";
import NotFound from "../pages/not-found";
import ProtectedRoutes from "../components/ProtectedRoutes";
import Verify from "../pages/verify";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoutes allowedRoles={["admin", "user"]}>
              <Profile />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoutes allowedRoles={["admin", "user"]}>
              <Dashboard />
            </ProtectedRoutes>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/logout"
          element={
            <ProtectedRoutes allowedRoles={["admin", "user"]}>
              <Logout />
            </ProtectedRoutes>
          }
        />
        <Route path="/verify/:authToken" element={<Verify />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
