import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserPosts from './usersposts';
import Navbar from '../COMP/Navbar';

const Profile = () => {


  //  // Define categories
  //  const categories = [
  //   'Technology', 'Health', 'Travel', 'Food', 'Lifestyle', 'Education',
  //   'Finance', 'Entertainment', 'Sports', 'Science', 'Politics', 'Business',
  //   'Art', 'Books', 'Music', 'Movies', 'Gaming', 'Environment', 'Fashion', 'History',
  //   'Personal Development', 'Fitness', 'Gardening', 'Parenting', 'Home Improvement',
  //   'Automotive', 'Photography', 'Crafts', 'Web Development', 'Social Issues',
  //   'Mental Health', 'Architecture', 'Philosophy', 'Cryptocurrency', 'Cooking',
  //   'Hobbies', 'Adventure', 'Writing', 'Travel Tips', 'Pets'
  // ];
     // Define categories
     const categories = [
      'All','Technology', 'Love','Social','Comedy','Health'
    ];

  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [user, setUser] = useState({});
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '',
    image: null,
  });
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [lastname, setLastname] = useState('');
  const [firstname, setFirstname] = useState('');
  const [profileImage, setProfileImage] = useState(null);

 

  const navigate = useNavigate();

  // Fetch profile data when the edit profile modal is shown
  useEffect(() => {
    if (showEditProfileModal) {
      fetchProfileData();
    }
  }, [showEditProfileModal]);

  const fetchProfileData = async () => {
    try {
      const user_id=localStorage.getItem('user_id');
      const response = await axios.get(`http://localhost:3001/profile/${user_id}`);
      const { username, bio, lastname, firstname, profile_pic } = response.data;

      setUsername(username);
      setBio(bio);
      setLastname(lastname);
      setFirstname(firstname);
      setProfileImage(profile_pic); // Assuming you want to display the current profile image
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Retrieve user_id from localStorage
        const user_id = localStorage.getItem('user_id');
        if (!user_id) {
          navigate('/login');
          return;
        }

        // Fetch user data
        const response = await fetch(`http://localhost:3001/profile/${user_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const data = await response.json();
        setUser(data);
        console.log("Data",data);
         // Convert Buffer data to Base64 string
         const base64String = btoa(
          new Uint8Array(data.profile_pic.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        
        setUser({
          ...data,
          profileImageUrl: `data:image/jpeg;base64,${base64String}`, // Adjust MIME type if necessary
        });

      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('roleid');
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  const handleCreatePost = async () => {
    const formData = new FormData();
    formData.append('title', newPost.title);
    formData.append('content', newPost.content);
    formData.append('category', newPost.category);
    if (newPost.image) formData.append('image', newPost.image);

    try {
      const user_id = localStorage.getItem('user_id');
      const response = await fetch(`http://localhost:3001/profile/createpost/${user_id}`, {
        method: 'POST',
        body: formData,
        credentials: 'include', // Ensure session data (like cookies) is sent with the request
      });

      if (response.status === 200) {
        alert('Post created successfully.');
        setNewPost({ title: '', content: '', category: '', image: null });
      } else {
        alert('Failed to create post.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('An error occurred while creating the post.');
    }
  };

  const handleSaveProfile = async () => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('bio', bio);
    formData.append('lastname', lastname);
    formData.append('firstname', firstname);
    if (profileImage) {
      formData.append('image', profileImage);
    }

    try {
      const user_id=localStorage.getItem('user_id');
      const response = await axios.post(`http://localhost:3001/edit-profile/${user_id}`, formData);
      if (response.status === 200) {
        console.log('Profile updated successfully');
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error:', error);
    }

    setShowEditProfileModal(false);
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      // Redirect to login page or show login prompt
      navigate('/login');
    }
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar Component */}
      <Navbar
        user={{ profileImageUrl: user.profileImageUrl }}
        user_id={user.user_id}
        handleLogout={handleLogout}
        username={user.username}
      />

      <br /><br /> <br /><br />
      {/* Profile Header */}
      <div className="profile-header flex flex-col items-start md:flex-col  justify-between bg-white-900 p-6 rounded-lg ml-10  ">
        <div className="flex items-center space-x-6">
          {/* Profile Picture */}
          <img
            src={user.profileImageUrl}
            alt="Profile Picture"
            className="rounded-full border-4 border-gray-700"
            style={{ height: '150px', width: '150px' }}
          />
  
          {/* User Information */}
          <div className="text-black text-center md:text-left">
            <h3 className="text-2xl font-bold">{user.username}</h3>
            <p className="text-black-400">{user.firstname} {user.lastname}</p>
          </div>
          <button
          className="bg-white-500 hover:bg-white-600 text-black font-bold py-2 px-4 rounded-lg transition shadow-lg ease-in-out"
          onClick={() => setShowEditProfileModal(true)}
        >
          <i className="fas fa-edit"></i> Edit Profile
        </button>

        </div>
  
        {/* Profile Buttons */}
        <div className="flex flex-col w-1/2 md:flex-col space-y-4  space-x-4 md:space-y-0 md:space-x-6 mt-4 md:mt-0">
        <p className="mt-2 text-black-300  "><h2 className='font-bold'>Bio:</h2> {user.bio}</p>
          <button
            className="bg-white-500 hover:bg-green-600 text-black py-2 mt-4 px-4 shadow-lg font-bold rounded-lg transition ease-in-out w-1/4"
            onClick={() => setShowCreatePostModal(true)}
          >
            <i className="fas fa-plus"></i> Create Post
          </button>
        </div>
      </div>
  
      {/* Create Post Modal */}
      <Modal show={showCreatePostModal} onHide={() => setShowCreatePostModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="postTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter post title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="postContent">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter post content"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="postCategory">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                as="select"
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
              >
                <option value="">Select a category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="postImage">
              <Form.Label>Upload Image</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setNewPost({ ...newPost, image: e.target.files[0] })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <button className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg" onClick={() => setShowCreatePostModal(false)}>Close</button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg" onClick={handleCreatePost}>Save Post</button>
        </Modal.Footer>
      </Modal>
  
      {/* Edit Profile Modal */}
      <Modal show={showEditProfileModal} onHide={() => setShowEditProfileModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="firstname">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter first name"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="lastname">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter last name"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="bio">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="profileImage">
              <Form.Label>Upload Image</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setProfileImage(e.target.files[0])}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <button className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg" onClick={() => setShowEditProfileModal(false)}>Close</button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg" onClick={handleSaveProfile}>Save Profile</button>
        </Modal.Footer>
      </Modal>
     
    <UserPosts />
 
    </div>
  );
  
};

export default Profile;
