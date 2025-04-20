import React, { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import attendance from "../assets/attendance.png"
import { getCurrentUser } from "../redux/features/auth/authAction";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/features/auth/authSlice";
import toast from "react-hot-toast";

const Header = () => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getCurrentUser()); // Dispatch action directly
    // navigate('/library/liked-songs')
  }, [dispatch]);
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    dispatch(logout()); // Dispatch logout action to set user to null
    toast.success("Logout successful");
  };
  return (
    <div className="flex items-center justify-between px-4 shadow-md dark:bg-gray-800">
      <h1 className="md:text-3xl flex items-center gap-3 font-bold text-gray-800 dark:text-white">
        <img src={attendance} className="w-20 h-20 object-contain" alt="" />
        DailyMark
      </h1>
      <div className="hidden md:flex items-center space-x-4">
        {/* Navigation buttons */}
        <div className="flex items-center space-x-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg font-medium ${isActive
                ? "bg-sky-400 text-white"
                : "hover:bg-sky-100  text-black dark:text-blue-300"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/students"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg font-medium ${isActive
                ? "bg-sky-400 text-white"
                : "hover:bg-sky-100  text-black dark:text-blue-300"
              }`
            }
          >
            Students
          </NavLink>
          <NavLink
            to="/mark-attendance"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg font-medium ${isActive
                ? "bg-sky-400 text-white"
                : "hover:bg-sky-100  text-black dark:text-blue-300"
              }`
            }
          >
            Mark Attendance
          </NavLink>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-400 dark:bg-gray-600 mx-2"></div>

        {/* Login Button */}
        {!user && <Link to="/login" className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium">
          Login
        </Link>}
        {user && <div onClick={() => handleLogout()} className="px-4 cursor-pointer py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium">
          Logout
        </div>}
      </div>
    </div>
  );
};

export default Header;
