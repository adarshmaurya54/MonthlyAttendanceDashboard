import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import attendance from "../assets/attendance.png";
import { getCurrentUser } from "../redux/features/auth/authAction";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/features/auth/authSlice";
import toast from "react-hot-toast";
import { RxHamburgerMenu } from "react-icons/rx";
import { LiaTimesSolid } from "react-icons/lia";

const Header = () => {
  const [hambOpen, setHambOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [hoverStyle, setHoverStyle] = useState({ left: 0, top: 0, width: 0, height: 0, opacity: 0 });
  const navContainerRef = useRef();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    toast.success("Logout successful");
  };

  const handleMouseEnter = (e) => {
    const rect = e.target.getBoundingClientRect();
    const containerRect = navContainerRef.current.getBoundingClientRect();
    setHoverStyle({
      left: rect.left - containerRect.left,
      top: rect.top - containerRect.top,
      width: rect.width,
      height: rect.height,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setHoverStyle(prev => ({ ...prev, opacity: 0 }));
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/students", label: "Students" },
    { to: "/mark-attendance", label: "Mark Attendance" },
    { to: "/attendance-analytics", label: "Attendance Analytics" },
  ];

  return (
    <div className="flex md:flex-row py-3 flex-col md:items-center justify-between px-4 dark:bg-gray-800 relative">
      <div className="flex items-center justify-between">
        <h1 className="md:text-3xl flex items-center gap-3 font-bold text-gray-800 dark:text-white">
          <img src={attendance} className="md:w-14 md:h-14 w-10 h-10 object-contain" alt="" />
          DailyMark
        </h1>
        <span onClick={() => setHambOpen(!hambOpen)} className="md:hidden flex text-3xl cursor-pointer">
          {!hambOpen && <RxHamburgerMenu />}
          {hambOpen && <LiaTimesSolid />}
        </span>
      </div>

      <div className={`md:flex-row md:py-0 py-4 flex-col md:items-center gap-4 ${hambOpen ? 'flex' : 'md:flex hidden'}`}>
        <div className="relative" ref={navContainerRef}>
          <div
            className="absolute bg-black/10 dark:bg-blue-900 rounded-lg z-0 transition-all duration-300"
            style={{
              ...hoverStyle,
              position: 'absolute',
              pointerEvents: 'none',
            }}
          />
          <div className="flex md:flex-row flex-col md:items-center gap-2 relative z-10">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setHambOpen(false)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-medium relative transition-all duration-300 ${
                    isActive
                      ? "bg-sky-400 text-white"
                      : "hover:text-black hover:dark:text-blue-300 text-black dark:text-blue-300"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="md:h-6 h-px md:w-px bg-gray-400 dark:bg-gray-600 mx-2"></div>

        {/* Auth Buttons */}
        {!user ? (
          <Link to="/login" className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium">
            Login
          </Link>
        ) : (
          <div
            onClick={handleLogout}
            className="px-4 cursor-pointer py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium"
          >
            Logout
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
