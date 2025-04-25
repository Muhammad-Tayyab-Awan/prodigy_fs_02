import "./style.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import Loading from "../components/Loading";
import authApi from "../api/authApi";
import toast, { Toaster } from "react-hot-toast";

function Login() {
  const navigate = useNavigate();
  const [formField, setFormField] = useState("email");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState({ email: null, password: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoggedIn, isLoading } = useAuth();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern =
    /^(?=(?:.*[a-z]){3,})(?=(?:.*[A-Z]){2,})(?=(?:.*\d){2,})(?=(?:.*[^A-Za-z0-9]){1,})[A-Za-z\d\S]{8,18}$/;
  useEffect(() => {
    if (isLoggedIn === true) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);
  if (isLoading) {
    return <Loading />;
  }
  if (isLoggedIn === false) {
    const checkFormValidation = () => {
      if (formData.email.trim().length === 0) {
        setError({ ...error, email: "Email is required" });
        return false;
      }
      if (!emailPattern.test(formData.email.trim())) {
        setError({ ...error, email: "Please enter correct email address" });
        return false;
      }
      if (formField !== "email") {
        if (formData.password.trim().length === 0) {
          setError({ ...error, password: "Password is required" });
          return false;
        }
        if (!passwordPattern.test(formData.password.trim())) {
          setError({ ...error, password: "Please enter strong password" });
          return false;
        }
      }
      setError({ password: null, email: null });
      return true;
    };
    const handleFormField = (e) => {
      e.preventDefault();
      checkFormValidation() &&
        setFormField(formField === "email" ? "password" : "email");
    };
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!checkFormValidation()) {
        if (error.email) {
          setFormField("email");
        }
        return;
      }
      setIsSubmitting(true);
      const response = await authApi.login(formData);
      setIsSubmitting(false);
      if (!response.resStatus) {
        toast.error(
          Array.isArray(response.error)
            ? response.error.map((err) => err.message).join(", ")
            : response.error,
        );
        setFormField("email");
        setFormData({ password: "", email: "" });
        return;
      }
      setFormData({ password: "", email: "" });
      toast.success(response.message);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    };
    const handleFill = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    return (
      <div className="min-h-screen w-full bg-purple-400 pt-40">
        <Toaster position="top-right" />
        <form
          className="relative mx-auto h-auto w-[400px] rounded-xl rounded-tl-none bg-white shadow-md shadow-black"
          autoComplete="off"
          autoCorrect="off"
          method="POST"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="login-heading absolute bottom-[100%] rounded-xl rounded-b-none bg-white p-2 text-base font-medium text-purple-600">
            Login Now
          </div>
          <div
            className={`flex flex-col items-center justify-center p-4 ${error.email || error.password ? "gap-2" : "gap-5"}`}
          >
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFill}
              autoComplete="username"
              placeholder="john@mail.com"
              className={`w-full rounded-lg bg-purple-400 p-2 text-center text-white shadow-md shadow-black focus-visible:outline-hidden ${formField === "email" ? "block" : "hidden"}`}
              autoFocus
              required
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleFill}
              autoComplete="current-password"
              placeholder="*********"
              className={`w-full rounded-lg bg-purple-400 p-2 text-center text-white shadow-md shadow-black focus-visible:outline-hidden ${formField === "password" ? "block" : "hidden"}`}
              autoFocus
              required
            />
            {error.email && (
              <div className="w-full pl-4 text-left text-xs font-medium text-red-500">
                {error.email}
              </div>
            )}
            {error.password && (
              <div className="w-full pl-4 text-left text-xs font-medium text-red-500">
                {error.password}
              </div>
            )}
            <div className="flex w-full items-center justify-between">
              {formField === "email" ? (
                <>
                  <Link
                    to="/register"
                    className="cursor-pointer rounded-sm bg-purple-500 px-2 py-1 text-sm font-medium text-white shadow-sm shadow-black transition-shadow duration-200 ease-in-out hover:shadow-md"
                  >
                    Register
                  </Link>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFormField}
                    className="cursor-pointer rounded-sm bg-purple-500 px-2 py-1 text-sm font-medium text-white shadow-sm shadow-black transition-shadow duration-200 ease-in-out hover:shadow-md focus-visible:outline-hidden disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFormField}
                    className="cursor-pointer rounded-sm bg-purple-500 px-2 py-1 text-sm font-medium text-white shadow-sm shadow-black transition-shadow duration-200 ease-in-out hover:shadow-md focus-visible:outline-hidden disabled:cursor-not-allowed"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="cursor-pointer rounded-sm bg-purple-500 px-2 py-1 text-sm font-medium text-white shadow-sm shadow-black transition-shadow duration-200 ease-in-out hover:shadow-md focus-visible:outline-hidden disabled:cursor-not-allowed"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default Login;
