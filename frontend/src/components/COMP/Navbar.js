import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ user, user_id, handleLogout, username }) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-lg z-10">
      <div className="flex justify-between items-center px-6 py-4">
        
        {/* Logo and Tagline */}
        <div className="flex flex-col">
          <b className="text-black-500 text-3xl font-bold">LITARC-PAGES</b>
          <p className="text-gray-400 text-sm">BRINGING WORDS TO LIFE</p>
        </div>

     

        {/* Profile and Logout */}
        <div className="flex items-center space-x-4">

       
          {/* Profile Section */}
          <button 
            className="flex items-center space-x-2"
            onClick={() => navigate(`/profile/${user_id}`)}>
            <img
              src={user.profileImageUrl}
              alt="Profile Picture"
              className="w-10 h-10 rounded-full object-cover"
            />
            <p className="text-black ml-2">{username}</p>
          </button>
          <button 
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-300 ease-in-out"
          onClick={() => navigate(`/home`)}>
          Home
        </button>
          {/* Logout Button */}
          <button 
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition duration-300 ease-in-out"
            onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
