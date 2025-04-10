import React from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
  return (
    <div className="flex items-center justify-between px-4 py-3 shadow-md dark:bg-gray-800">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Monthly Attendance Dashboard
      </h1>
      <div className="flex items-center space-x-4">
        {/* Navigation buttons */}
        <div className="flex items-center space-x-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg font-medium ${
                isActive
                  ? "bg-indigo-800 text-white"
                  : "hover:bg-indigo-100  text-black dark:text-blue-300"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/students"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg font-medium ${
                isActive
                  ? "bg-indigo-800 text-white"
                  : "hover:bg-indigo-100  text-black dark:text-blue-300"
              }`
            }
          >
            Students
          </NavLink>
          <NavLink
            to="/mark-attendance"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg font-medium ${
                isActive
                  ? "bg-indigo-800 text-white"
                  : "hover:bg-indigo-100  text-black dark:text-blue-300"
              }`
            }
          >
            Mark Attendance
          </NavLink>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-400 dark:bg-gray-600 mx-2"></div>

        {/* Login Button */}
        <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
          Login
        </button>
      </div>
    </div>
  );
};

export default Header;
