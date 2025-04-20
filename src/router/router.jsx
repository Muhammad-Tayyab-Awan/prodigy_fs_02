import { BrowserRouter, Route, Routes } from "react-router";
import Dashboard from "../pages/dashboard/index";
import Login from "../pages/login";
import Profile from "../pages/profile/index";
import Register from "../pages/register";
import Logout from "../pages/logout";
import NotFound from "../pages/not-found";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
