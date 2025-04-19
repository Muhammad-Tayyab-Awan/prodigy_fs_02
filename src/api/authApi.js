const apiUri = import.meta.VITE_API_URI;

const getLoginStatus = async () => {
  const jsonResponse = await fetch(`${apiUri}api/auth/loginStatus`, {
    method: "GET",
    credentials: "include",
  });
  const response = await jsonResponse.json();
  return response;
};

const authApi = { getLoginStatus };

export default authApi;
