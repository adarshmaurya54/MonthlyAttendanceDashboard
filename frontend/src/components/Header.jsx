import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import attendance from "../assets/attendance.png"
import { getCurrentUser } from "../redux/features/auth/authAction";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/features/auth/authSlice";
import toast from "react-hot-toast";
import { RxHamburgerMenu } from "react-icons/rx";
import { LiaTimesSolid } from "react-icons/lia";


const Header = () => {
  const [hambOpen, setHambOpen] = useState(false)
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
    <div className="flex md:flex-row  md:py-0 py-2 flex-col md:items-center justify-between px-4 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <h1 className="md:text-3xl flex items-center gap-3 font-bold text-gray-800 dark:text-white">
          <img src={attendance} className="md:w-20 md:h-20 w-10 h-10 object-contain" alt="" />
          DailyMark
        </h1>
        <span  onClick={() => setHambOpen(!hambOpen)}  className="md:hidden flex text-3xl cursor-pointer">
          {!hambOpen && <RxHamburgerMenu/>}
          {hambOpen && <LiaTimesSolid />}
        </span>
      </div>
      <div className={`md:flex-row md:py-0 py-4 flex-col md:items-center gap-4 ${hambOpen ? 'flex' : 'md:flex hidden'}`}>
        {/* Navigation buttons */}
        <div className="flex md:flex-row flex-col md:items-center gap-2">
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
        <div className="md:h-6 h-px md:w-px bg-gray-400 dark:bg-gray-600 mx-2"></div>

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
