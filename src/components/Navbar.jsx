// src/components/Navbar.jsx
import React from 'react';
import { Route, useNavigate } from 'react-router-dom';


const Navbar = () => {
    const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900 text-white px-6 py-4 flex justify-between items-center z-50 ">
      <h1 className="text-2xl font-bold">BioSpecies Tracker</h1>
      <button
        className="bg-gray-400 text-black px-4 py-2 rounded hover:bg-gray-500 transition duration-300"
        onClick={() => navigate("/admin-login")}
      >
        Admin Login
      </button>
    </nav>
  );
};

export default Navbar;
