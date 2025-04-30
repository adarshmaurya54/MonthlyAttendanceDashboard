import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white p-2 text-gray-400 py-4 mt-10">
      <div className="container border-t-[1px] border-black/30 pt-3 mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} Adarsh Maurya. All rights reserved.</p>
        <p>Developed for IITM College, Janakpuri</p>
      </div>
    </footer>
  );
}

export default Footer;
