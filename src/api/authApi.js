const apiUri = import.meta.env.VITE_API_URI;

const getLoginStatus = async () => {
  const jsonResponse = await fetch(`${apiUri}api/auth/login-status`, {
    method: "GET",
    credentials: "include",
  });
  const response = await jsonResponse.json();
  return response;
};

async function login(credentials) {
  const jsonResponse = await fetch(`${apiUri}api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...credentials }),
  });
  const response = await jsonResponse.json();
  return response;
}

async function register(credentials) {
  const jsonResponse = await fetch(`${apiUri}api/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...credentials }),
  });
  const response = await jsonResponse.json();
  return response;
}

const authApi = { getLoginStatus, login, register };

export default authApi;
