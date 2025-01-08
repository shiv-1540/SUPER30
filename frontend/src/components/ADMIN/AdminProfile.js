import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Form, Button, Card } from 'react-bootstrap';

const ProfilePage = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    img: null,
  });
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/profile/${username}`);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [username]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/posts/${user?.user_id}`);
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      }
    };

    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const handlePostChange = (e) => {
    const { name, value, files } = e.target;
    setNewPost(prevState => ({
      ...prevState,
      [name]: files ? files[0] : value,
    }));
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', newPost.title);
    formData.append('content', newPost.content);
    if (newPost.img) {
      formData.append('img', newPost.img);
    }

    try {
      await axios.post('http://localhost:3001/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Post created successfully!');
      // Optionally, refresh posts
      setNewPost({ title: '', content: '', img: null });
      const response = await axios.get(`http://localhost:3001/posts/${user.user_id}`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <h2>{user.username}'s Profile</h2>
      <div className="profile-info">
        <img src={user.profilePicture || 'https://via.placeholder.com/150'} alt="Profile" />
        <p><strong>Bio:</strong> {user.bio}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>First Name:</strong> {user.firstName}</p>
        <p><strong>Last Name:</strong> {user.lastName}</p>
      </div>
      
      <h3>Create New Post</h3>
      <Form onSubmit={handlePostSubmit}>
        <Form.Group controlId="postTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control 
            type="text" 
            name="title" 
            value={newPost.title} 
            onChange={handlePostChange} 
            required 
          />
        </Form.Group>
        <Form.Group controlId="postContent">
          <Form.Label>Content</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            name="content" 
            value={newPost.content} 
            onChange={handlePostChange} 
            required 
          />
        </Form.Group>
        <Form.Group controlId="postImage">
          <Form.Label>Upload Image</Form.Label>
          <Form.Control 
            type="file" 
            name="img" 
            onChange={handlePostChange} 
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Create Post
        </Button>
      </Form>

      <h3>My Posts</h3>
      {posts.length ? (
        posts.map(post => (
          <Card key={post.post_id} className="mb-3">
            <Card.Img variant="top" src={`data:image/jpeg;base64,${post.img}`} />
            <Card.Body>
              <Card.Title>{post.title}</Card.Title>
              <Card.Text>{post.content}</Card.Text>
              <Card.Text><small className="text-muted">Created at: {new Date(post.created_at).toLocaleDateString()}</small></Card.Text>
            </Card.Body>
          </Card>
        ))
      ) : (
        <p>No posts available.</p>
      )}
    </Container>
  );
};

export default ProfilePage;
