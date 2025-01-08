import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DisabledPostsManager = () => {
  const [disabledPosts, setDisabledPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

   // Function to show the success message
//    const showSuccessMessage = (message) => {
//     setSuccessMessage(message);
//     // Set up a timer to clear the message after 10 seconds
//   // 10000 milliseconds = 10 seconds
// };

useEffect(() => {
  // Optional: Clean up timer if the component unmounts
  setTimeout(() => {
    setSuccessMessage('');
}, 10000); 
}, []);

  // Fetch disabled posts on component mount
  useEffect(() => {
    const fetchDisabledPosts = async () => {
      try {
        const response = await axios.get('http://localhost:3001/admin/disabledposts');
        setDisabledPosts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch disabled posts');
        setLoading(false);
      }
    };
    fetchDisabledPosts();
  }, []);

  // Function to enable post
  const handleEnablePost = async (post_id) => {
    try {
      await axios.put(`http://localhost:3001/admin/enablepost/${post_id}`);
      setDisabledPosts((prevPosts) =>
        prevPosts.filter((post) => post.post_id !== post_id)
      );
      setSuccessMessage('Post Enabled Sucessfully..!!');
    } catch (err) {
      setError('Failed to enable post');
    }
  };

  // Function to delete post
  const handleDeletePost = async (post_id) => {
    try {
      await axios.delete(`http://localhost:3001/admin/deletepost/${post_id}`);
      setDisabledPosts((prevPosts) =>
        prevPosts.filter((post) => post.post_id !== post_id)
      );
      setSuccessMessage('Post Deleted Sucessfully..!!');
      
    } catch (err) {
      setError('Failed to delete post');
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
   
      <h1 className="text-white text-2xl bg-zinc-500 p-2 font-bold mb-6">Manage Disabled Posts</h1>
      <br/> 
      {successMessage && (
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded">
            {successMessage}
        </div>
     )}
     <br/>
      {disabledPosts.length === 0 ? (
        <p>No disabled posts found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {disabledPosts.map((post) => (
            <div key={post.post_id} className="bg-white shadow-md rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={post.profile_pic || 'https://via.placeholder.com/50'}
                  alt={`${post.username}'s profile`}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="text-lg font-bold">{post.username}</p>
                  <p className="text-gray-600">{post.title}</p>
                </div>
              </div>
              <img
                src={post.image || 'https://via.placeholder.com/300x200'}
                alt="Post"
                className="w-full h-40 object-cover rounded-lg mb-2"
              />
              <div className="text-sm text-gray-700 mb-2">{post.content}</div>

              <div className="flex justify-between">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-md"
                  onClick={() =>{
                    handleEnablePost(post.post_id)
                    console.log(post.post_id)
                  } }
                >
                  Enable
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md"
                  onClick={() =>{
                    handleDeletePost(post.post_id)
                    
                  } }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisabledPostsManager;
