import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import OtherPosts from './otherposts';
import OtherNavbar from '../COMP/OtherNavbar';
import axios from 'axios';

const OtherProfile = () => {
  const { user_id } = useParams(); // Get user_id from URL parameters
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [user, setUser] = useState({});
  const [ProfileImage, setProfileImage] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const user_id1 = localStorage.getItem('user_id');
      const response = await axios.get(`http://localhost:3001/profile/${user_id1}`);
      const { username, bio, lastname, firstname, profile_pic } = response.data;

      setProfileImage(profile_pic); // Assuming you want to display the current profile image
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedProfilePic = localStorage.getItem('profile_pic'); // Retrieve profile_pic from localStorage
        if (storedProfilePic) {
          setUser(prevUser => ({
            ...prevUser,
            profileImageUrl: storedProfilePic, // Set the stored profile picture in the state
          }));
        }

        const response = await fetch(`http://localhost:3001/profile/${user_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const data = await response.json();

        const base64String = btoa(
          new Uint8Array(data.profile_pic.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );

        const profileImageUrl = `data:image/jpeg;base64,${base64String}`;

        setUser({
          ...data,
          profileImageUrl, // Update the profile image with the one fetched from the server
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user_id]); // Ensure the effect runs when user_id changes

  const handleLogout = () => {
    localStorage.clear(); // Clears all localStorage
    navigate('/login');
  };

  return (
    <div className="container mx-auto">
      <OtherNavbar
        user={{ profileImageUrl: ProfileImage }}
        profilePic={{ ProfileImage }}
        user_id={user.user_id}
        handleLogout={handleLogout}
        username={user.username}
      />
      <br/><br/> <br/><br/> <br/><br/>
    
      <div className="mt-30 px-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <img
              src={user.profileImageUrl || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="rounded-full object-cover"
              style={{ height: '150px', width: '180px' }}
            />
            <div className="text-gray-800">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold">{user.username}</h3>
                <p className="text-lg text-gray-600">
                  {user.firstname} {user.lastname}
                </p>
              </div>
              <p className="mt-3 text-gray-500 max-w-lg">{user.bio}</p>
            </div>
          </div>
        </div>

        {/* Include OtherPosts component and pass user_id as a prop */}
        <div className="mt-8">
          <OtherPosts userId={user_id} />
        </div>
      </div>
    </div>
  );
};

export default OtherProfile;
