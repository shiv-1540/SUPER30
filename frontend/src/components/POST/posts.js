import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostModal from './PostModal';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/posts');
        setPosts(response.data);
      } catch (error) {
        setError('Error fetching posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container">
      <h5>All Posts</h5>
      {posts.length === 0 ? (
        <p>No posts found</p>
      ) : (
        posts.map(post => (
          <div key={post.post_id} className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">{post.title}</h5>
              <p className="card-text">{post.content}</p>
              {post.img && <img src={`data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(post.img)))}`} alt="Post Image" className="img-fluid" />}
              <p className="card-text"><small className="text-muted">{post.created_at}</small></p>
              <PostModal post={post} />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Posts;
