import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import { cloneElement, useEffect } from "react";
import Loading from "./Loading";

function ProtectedRoutes({ children, allowedRoles }) {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading, role } = useAuth();
  useEffect(() => {
    if (isLoggedIn === false) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);
  if (isLoading) {
    return <Loading />;
  }
  if (isLoggedIn === true) {
    if (allowedRoles && !allowedRoles.includes(role)) {
      navigate("/unauthorized");
      return null;
    }
    return cloneElement(children, { role });
  }
}

export default ProtectedRoutes;
