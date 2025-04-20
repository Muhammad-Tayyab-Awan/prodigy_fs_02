import { useState } from "react";
import { useEffect } from "react";
import authApi from "../api/authApi";

const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState({ loggedIn: null, role: null });
  useEffect(() => {
    authApi.getLoginStatus().then((response) => {
      setIsLoggedIn(response);
    });
  }, []);
  if (isLoggedIn.loggedIn === null) {
    return { isLoading: true };
  }
  if (isLoggedIn.loggedIn === false) {
    return { isLoggedIn: false };
  } else {
    return { isLoggedIn: true, role: isLoggedIn.role };
  }
};

export default useAuth;
