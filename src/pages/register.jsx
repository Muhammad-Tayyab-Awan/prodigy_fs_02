import "./style.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import Loading from "../components/Loading";
import authApi from "../api/authApi";
import toast, { Toaster } from "react-hot-toast";
import {
  isEmail,
  isISO8601,
  isLength,
  isStrongPassword,
  matches,
} from "validator";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    gender: "",
    birthdate: "",
  });
  const [error, setError] = useState({
    name: null,
    username: null,
    email: null,
    password: null,
    gender: null,
    birthdate: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoggedIn, isLoading } = useAuth();
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
      const newError = {
        name: !formData.name.trim()
          ? "Name is required"
          : !matches(formData.name, /[A-Za-z ]{6,25}$/)
            ? "Please enter correct name"
            : null,
        username: !formData.username.trim()
          ? "Username is required"
          : !matches(formData.username, /^(?=.*[a-z])(?=.*\d)[a-z\d]+$/)
            ? "Please enter correct username"
            : null,
        email: !formData.email.trim()
          ? "Email is required"
          : !isEmail(formData.email)
            ? "Please enter correct email address"
            : null,
        password: !formData.password.trim()
          ? "Password is required"
          : isLength(formData.password, { max: 18 }) &&
              isStrongPassword(formData.password, {
                minLength: 8,
                minLowercase: 3,
                minNumbers: 2,
                minUppercase: 2,
                minSymbols: 1,
              })
            ? null
            : "Please enter strong password",
        gender: formData.gender ? null : "Gender is required",
        birthdate: !formData.birthdate
          ? "Birthdate is required"
          : !isISO8601(formData.birthdate, {
                strict: true,
                strictSeparator: true,
              })
            ? "Please enter correct date"
            : null,
      };
      setError(newError);
      return Object.values(newError).every((err) => err === null);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!checkFormValidation()) {
        for (const err in error) {
          if (error[err]) {
            e.target.querySelector(`input[name='${err}']`).focus();
            break;
          }
        }
        return;
      }
      setIsSubmitting(true);
      const response = await authApi.register(formData);
      setIsSubmitting(false);
      if (!response.resStatus) {
        toast.error(
          Array.isArray(response.error)
            ? response.error.map((err) => err.msg).join(", ")
            : response.error,
        );
        setFormData({
          name: "",
          username: "",
          email: "",
          password: "",
          gender: "",
          birthdate: "",
        });
        e.target.querySelector("input[name='name']").focus();
        return;
      }
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        gender: "",
        birthdate: "",
      });
      toast.success(response.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    };
    const handleFill = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleFocus = (e) => {
      e.target.type = "date";
    };
    const handleBlur = (e) => {
      e.target.type = "text";
    };
    return (
      <div className="min-h-screen w-full overflow-auto bg-purple-400">
        <Toaster position="top-right" />
        <form
          className="relative mx-auto mt-20 h-auto w-[400px] rounded-xl rounded-tl-none bg-white shadow-md shadow-black"
          autoComplete="off"
          autoCorrect="off"
          method="POST"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="login-heading absolute bottom-[100%] rounded-xl rounded-b-none bg-white p-2 text-base font-medium text-purple-600">
            Register Now
          </div>
          <div
            className={`flex flex-col items-center justify-center ${error.name || error.username || error.email || error.password || error.gender || error.birthdate ? "gap-2" : "gap-4"} p-4`}
          >
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFill}
              autoComplete="additional-name"
              placeholder="Full name"
              className="relative w-full rounded-lg bg-purple-400 p-2 text-center text-white shadow-md shadow-black focus-visible:outline-hidden"
              autoFocus
              required
            />
            {error.name && (
              <div className="w-full pl-4 text-left text-xs font-medium text-red-500">
                {error.name}
              </div>
            )}
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleFill}
              autoComplete="username"
              placeholder="Username here"
              className="relative w-full rounded-lg bg-purple-400 p-2 text-center text-white shadow-md shadow-black focus-visible:outline-hidden"
            />
            {error.username && (
              <div className="w-full gap-y-1 pl-4 text-left text-xs font-medium text-red-500">
                {error.username}
              </div>
            )}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFill}
              autoComplete="email"
              placeholder="john@mail.com"
              className="relative w-full rounded-lg bg-purple-400 p-2 text-center text-white shadow-md shadow-black focus-visible:outline-hidden"
            />
            {error.email && (
              <div className="w-full pl-4 text-left text-xs font-medium text-red-500">
                {error.email}
              </div>
            )}
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleFill}
              autoComplete="new-password"
              placeholder="*********"
              className="relative w-full rounded-lg bg-purple-400 p-2 text-center text-white shadow-md shadow-black focus-visible:outline-hidden"
            />
            {error.password && (
              <div className="w-full pl-4 text-left text-xs font-medium text-red-500">
                {error.password}
              </div>
            )}
            <input
              type="text"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleFill}
              className="relative w-full rounded-lg bg-purple-400 p-2 text-center text-white shadow-md shadow-black focus-visible:outline-hidden"
              placeholder="Enter birthdate here"
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            {error.birthdate && (
              <div className="w-full pl-4 text-left text-xs font-medium text-red-500">
                {error.birthdate}
              </div>
            )}
            <div className="flex w-1/2 items-center justify-evenly font-medium">
              <input
                type="radio"
                name="gender"
                id="male"
                value="male"
                onChange={handleFill}
                className="focus-visible:outline-hidden"
              />
              <label htmlFor="male">Male</label>
              <input
                type="radio"
                name="gender"
                id="female"
                value="female"
                onChange={handleFill}
                className="focus-visible:outline-hidden"
              />
              <label htmlFor="female">Female</label>
            </div>
            {error.gender && (
              <div className="w-full pl-4 text-left text-xs font-medium text-red-500">
                {error.gender}
              </div>
            )}
            <div className="flex w-full items-center justify-between">
              <Link
                to="/login"
                className="cursor-pointer rounded-sm bg-purple-500 px-2 py-1 text-sm font-medium text-white shadow-sm shadow-black transition-shadow duration-200 ease-in-out hover:shadow-md"
              >
                Login
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer rounded-sm bg-purple-500 px-2 py-1 text-sm font-medium text-white shadow-sm shadow-black transition-shadow duration-200 ease-in-out hover:shadow-md focus-visible:outline-hidden disabled:cursor-not-allowed"
              >
                Register
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default Register;
