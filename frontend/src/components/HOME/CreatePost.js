import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);

  const user=useParams();
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data={
      title,
      content,
      image,
      category
    }

    try {
      
      console.log(user.user_id);
      const response = await axios.post(`http://localhost:3001/profile/createpost/${user.user_id}`,data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status === 200) {
        alert('Post created successfully.');
        // Clear the form after successful submission
        setTitle('');
        setContent('');
        setCategory('');
        setImage(null);
      } else {
        alert('Failed to create post.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('An error occurred while creating the post.');
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <br />
      <div>
        <label htmlFor="content">Content:</label>
        <textarea
          id="content"
          name="content"
          rows="4"
          cols="50"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <br />
      <div>
        <label htmlFor="category">Category:</label>
        <input
          type="text"
          id="category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
      </div>
      <br />
      <div>
        <label htmlFor="image">Upload Image:</label>
        <input
          type="file"
          id="image"
          name="image"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </div>
      <br />
      <button type="submit">Create Post</button>
    </form>
  );
};

export default CreatePost;
