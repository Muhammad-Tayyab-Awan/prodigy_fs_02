/* eslint-disable react-hooks/exhaustive-deps */
import "./style.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { isJWT } from "validator";
import authApi from "../api/authApi";

function Verify() {
  const { authToken } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [validation, setValidation] = useState("validating");
  useEffect(() => {
    setValidation("validating");
    if (!isJWT(authToken)) {
      setValidation("not-validated");
      setError("Invalid validation request");
      return;
    }
    authApi.verifyEmail(authToken).then((response) => {
      if (!response.resStatus) {
        setValidation("not-validated");
        setError(response.error);
        return;
      }
      setValidation("validated");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    });
  }, [authToken]);
  return (
    <div className="min-h-screen w-full overflow-auto bg-purple-400">
      {validation === "validating" && (
        <div className="rotator mx-auto mt-20 h-10 w-10 rounded-full border-4 border-t-white border-r-purple-700 border-b-white border-l-purple-700"></div>
      )}
      {validation === "validated" && (
        <div className="mx-auto mt-20 p-4">
          <img
            src="/circle-check-solid.svg"
            alt="validated"
            className="mx-auto mb-4 block h-10"
          />
          <span className="block text-center font-medium">
            Email validated successfully
          </span>
        </div>
      )}
      {validation === "not-validated" && (
        <div className="mx-auto mt-20 p-4">
          <img
            src="/circle-xmark-solid.svg"
            alt="not-validated"
            className="mx-auto mb-4 block h-10"
          />
          <span className="block text-center font-medium">
            Email validation failed
          </span>
        </div>
      )}
      {error && (
        <div className="mx-auto mt-4 w-64 rounded-xl bg-white p-4">
          <h1 className="text-lg font-medium text-red-500">Error occurred</h1>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

export default Verify;
