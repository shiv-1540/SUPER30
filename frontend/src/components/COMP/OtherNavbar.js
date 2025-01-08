import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function OtherNavbar({ user, user_id, handleLogout }) {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Fetch profile data from localStorage when the component mounts
    const storedUsername = localStorage.getItem('username');
    const storedProfilePic = localStorage.getItem('profile_pic');
    
    if (storedUsername) {
      setUsername(storedUsername);
    }
    if (storedProfilePic) {
      setProfilePic(storedProfilePic);
    }
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-lg z-10">
      <div className="flex justify-between items-center px-6 py-4">
        
        {/* Logo and Tagline */}
        <div className="flex flex-col">
          <b className="text-red-500 text-2xl font-bold">LITARC-PAGES</b>
          <p className="text-gray-400 text-sm">BRINGING WORDS TO LIFE</p>
        </div>

        {/* Profile and Logout */}
        <div className="flex items-center space-x-4">

          {/* Profile Section */}
          <button 
            className="flex items-center space-x-2"
            onClick={() => navigate(`/profile/${user_id}`)}>
            {/* <img
            //   src={profilePic || "https://via.placeholder.com/150"} // Fallback image if profilePic is null
            //   alt="Profile Picture"
            //   className="w-10 h-10 rounded-full object-cover"
            // />*/}
            <p className="text-black-500 ml-2">{username}</p>
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

export default OtherNavbar;
