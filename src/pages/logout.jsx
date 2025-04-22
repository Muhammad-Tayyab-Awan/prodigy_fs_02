import { useState } from "react";
import { useNavigate } from "react-router";
import authApi from "../api/authApi.js";

function Logout() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const toggleModal = () => {
    setModal(!modal);
  };
  const handleLogout = async () => {
    const response = await authApi.logout();
    if (response.resStatus) {
      navigate("/login");
      return;
    }
  };
  return (
    <div className="min-h-screen w-full bg-purple-400 pt-20">
      <button
        onClick={toggleModal}
        className="mx-auto block cursor-pointer rounded-sm bg-white px-3 py-2 font-medium text-purple-600 ring-1 focus-visible:outline-hidden"
      >
        Logout Now
      </button>
      <div
        className={`logout-modal fixed top-36 left-[calc((100vw-300px)/2)] h-auto w-[300px] rounded-xl p-4 ${modal ? "block" : "hidden"} bg-white shadow-md shadow-black`}
      >
        <p className="mb-4 w-full text-center font-medium text-shadow-purple-400 text-shadow-sm">
          Are sure you wan't to logout
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            className="cursor-pointer rounded-md bg-red-600 px-2 py-0.5 text-sm font-medium text-white focus-visible:outline-hidden"
            onClick={handleLogout}
          >
            Yes
          </button>
          <button
            className="cursor-pointer rounded-md bg-green-600 px-2 py-0.5 text-sm font-medium text-white focus-visible:outline-hidden"
            onClick={toggleModal}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}

export default Logout;
