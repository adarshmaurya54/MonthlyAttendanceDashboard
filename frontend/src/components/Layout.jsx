import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import Header from "./Header"; // Assuming you have a Header component

const Layout = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Set scrolled to true if window scrollY is greater than 10
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header */}
      <header className={`transition-all duration-300 fixed top-0 left-0 right-0 z-10 ${scrolled && "p-3"}`}>
        <div
          className={`duration-300 overflow-hidden ${
            scrolled ?
            " border-gray-400/20 dark:border-gray-500 rounded-3xl bg-dark/70 border-2 backdrop-blur-md" : "bg-white "
          }`}
        >
          <Header />
        </div>
      </header>
            
      {/* Main Content */}
      <main className="">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
