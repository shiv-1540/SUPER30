import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminNavbar({ user, user_id, handleLogout, username }) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 shadow-lg z-10">
      <div className="flex justify-between items-center px-6 py-4">
        
        {/* Logo and Tagline */}
        <div className="flex flex-col">
          <b className="text-red-500 text-2xl font-bold">LITARC-PAGES</b>
          <p className="text-gray-400 text-sm">BRINGING WORDS TO LIFE</p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-4">
          {/* Home Button */}
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-300 ease-in-out"
            onClick={() => navigate(`/admin/home/${username}`)}>
            Home
          </button>

          {/* Dashboard Button */}
          <button 
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition duration-300 ease-in-out"
            onClick={() => navigate(`/admin/dashboard/${username}`)}>
            Dashboard
          </button>

          {/* Logout Button */}
          <button 
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition duration-300 ease-in-out"
            onClick={handleLogout}>
            Logout
          </button>

          {/* Profile Section */}
          <button 
            className="flex items-center space-x-2"
            onClick={() => navigate(`/profile/${user_id}`)}>
            <img
              src={user.profileImageUrl || "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
              alt="Profile Picture"
              className="w-10 h-10 rounded-full object-cover"
            />
            <p className="text-white ml-2">{username}</p>
          </button>
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;
