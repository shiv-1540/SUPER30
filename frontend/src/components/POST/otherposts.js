import React, { useState, useEffect } from 'react';
import './userposts.css'; // Assuming this is used for additional styles

const OtherPosts = ({ userId }) => { 
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`http://localhost:3001/user-posts/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.posts) {
          setPosts(data.posts);
        } else {
          setError('Unexpected response format');
        }
      } catch (error) {
        setError('Error fetching user posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId]); 

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-col p-4">
      <h2 className="text-white font-bold text-gray-800 mb-4">User Posts</h2>
      {posts.length === 0 ? (
        <p className="text-center text-gray-600">No posts found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {posts.map(post => (
            <div key={post.id} className="flex flex-col bg-white shadow-md rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <img 
                  src={post.profile_pic || 'https://via.placeholder.com/50'} 
                  alt={`${post.username}'s profile`} 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <p className="text-base font-semibold">{post.username}</p>
              </div>
              <img 
                src={post.image || 'https://via.placeholder.com/300x200'} 
                alt="Post" 
                className="w-full h-auto rounded-lg mb-2"
              />
              <h3 className="text-lg font-bold text-gray-900 mb-1">{post.title}</h3>
              <p className="text-gray-700 text-sm">{post.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OtherPosts;
