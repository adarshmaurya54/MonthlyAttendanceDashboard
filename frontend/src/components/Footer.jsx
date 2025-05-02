import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-sky-50 text-gray-700 mt-10 rounded-t-3xl">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

        {/* About Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <p className="text-sm">
            DailyMark is a student attendance management system developed for IITM College, Janakpuri. Built with simplicity and efficiency in mind.
          </p>
        </div>

        {/* Contact Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Contact</h2>
          <p className="text-sm">Adarsh Maurya</p>
          <p className="text-sm">Email: <a href="mailto:adarshmaurya0022@example.com" className="text-blue-500 hover:underline">adarshmaurya0022@example.com</a></p>
        </div>

        {/* Social Media Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Connect</h2>
          <div className="flex justify-center md:justify-start gap-4 text-xl mt-2">
            <a href="https://github.com/adarshmaurya54" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500"><FaGithub /></a>
            <a href="https://linkedin.com/in/adarshmaurya54" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500"><FaLinkedin /></a>
            <a href="mailto:adarsh@example.com" className="hover:text-blue-500"><FaEnvelope /></a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-sm text-gray-500 py-4 border-t border-gray-300">
        &copy; {new Date().getFullYear()} Adarsh Maurya. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
