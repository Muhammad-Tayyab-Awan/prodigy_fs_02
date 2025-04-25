import { useEffect, useState } from "react";
import authApi from "../api/authApi";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router";

function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: "",
    name: "",
    email: "",
    role: "",
    birthdate: "",
  });
  useEffect(() => {
    authApi.getUserData().then((response) => {
      if (!response.resStatus) {
        toast.error(response.error);
        return;
      }
      setUserData(response.userData);
    });
  }, []);
  function calculateAge(birthdate) {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  const handleDeletion = async () => {
    const response = await authApi.deleteAccount();
    if (!response.resStatus) {
      toast.error(response.error);
      return;
    }
    toast.success(response.message);
    setTimeout(() => {
      navigate("/login");
    }, 3000);
    return;
  };
  return (
    <div className="min-h-screen w-full overflow-auto bg-purple-400">
      <div className="mx-auto mt-10 h-auto w-[50%] rounded-xl bg-white p-4 shadow-md shadow-black">
        <h1 className="text-center text-xl font-medium">{userData.name}</h1>
        <h2 className="text-center text-sm font-medium text-gray-400">
          @{userData.username}
        </h2>
        <div className="my-4 flex items-center justify-center gap-3">
          <img src="/envelope-solid.svg" alt="email" className="h-5" />
          <span className="font-medium">{userData.email}</span>
        </div>
        <div className="mx-auto my-4 flex w-[50%] items-center justify-between gap-3">
          <div className="flex items-baseline justify-center gap-3">
            <span>Role :</span>
            <img
              src={
                userData.role === "user"
                  ? "/user-solid.svg"
                  : "/user-tie-solid.svg"
              }
              alt={userData.role}
              className="h-6"
            />
          </div>
          <div className="flex items-center justify-center gap-3">
            <span>Age :</span>
            <span className="font-medium">
              {calculateAge(userData.birthdate)}
            </span>
          </div>
        </div>
        <div className="mx-auto my-4 flex w-[50%] items-center justify-between gap-3">
          <div
            className="flex cursor-pointer items-center justify-center gap-2"
            onClick={handleDeletion}
          >
            <img src="/trash-solid.svg" alt="delete" className="h-4" />
            <span className="text-xs font-medium text-red-600">
              Delete Account
            </span>
          </div>
          <Link
            to="/logout"
            className="flex cursor-pointer items-center justify-center gap-2"
          >
            <img src="/logout.svg" alt="logout" className="h-4" />
            <span className="text-xs font-medium text-[#6434f4]">Logout</span>
          </Link>
        </div>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}

export default Profile;
