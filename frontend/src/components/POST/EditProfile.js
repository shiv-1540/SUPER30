import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const EditProfile = () => {
  const [show, setShow] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/profile'); // Update this endpoint as necessary
        const userData = response.data;
        setUsername(userData.username);
        setEmail(userData.email);
        // Handle setting the profile image URL if available
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveProfile = async () => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    if (profileImage) formData.append('image', profileImage);

    try {
      const response = await axios.post('/api/profile/edit', formData);
      if (response.status === 200) {
        console.log('Profile updated successfully');
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    handleClose();
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Edit Profile
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="profileUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="profileEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveProfile}>
            Save Profile
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EditProfile;
