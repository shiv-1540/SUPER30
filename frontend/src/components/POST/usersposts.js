import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './userposts.css'; // Import the CSS file

const UserPosts = () => {
    const userId = localStorage.getItem('user_id');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect(() => {
    //     const fetchPosts = async () => {
    //         try {
    //             const response = await axios.get(`http://localhost:3001/user-posts/${userId}`);
    //             setPosts(response.data.posts);
    //             console.log("users posts: "+response.data.posts);
    //         } catch (err) {
    //             setError('Error fetching posts');
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchPosts();
    // }, [userId]);


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
             console.log(data.posts);
            if (data.posts) {
              setPosts(data.posts);
              //console.log("Likes: ",data.posts[0].n_likes);
            } 
            else {
              setError('Unexpected response format');
            }
          } 
          catch (error) {
            setError('Error fetching user posts');
          } 
          finally {
            setLoading(false);
          }
        };
        fetchPosts();
      }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
     
      <div className="container mx-auto p-4" id="container">
    {/*  <h2 className="text-white text-2xl font-semibold mb-4">User Posts</h2>*/}
      <div>
        {posts.length === 0 ? (
          <p className="text-gray-400">No posts found.</p>
        ) : (
          <div className="flex flex-wrap gap-8 justify-center">
            {posts.map(post => (
              <div 
              key={post.id} 
              className="bg-white shadow-xl rounded-lg overflow-hidden mb-2 w-96 flex-shrink-0 transform hover:scale-105 transition-transform duration-300 ease-in-out"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <img 
                    src={post.profile_pic} 
                    alt={`${post.username}'s profile`} 
                    className="w-12 h-12 rounded-full object-cover shadow-md"
                  />
                  <p className="text-gray-900 text-lg font-bold">{post.username}</p>
                </div>
              </div>
            
              {/* Post Image */}
              {post.image && (
                <div className="overflow-hidden">
                  <img 
                    src={post.image} 
                    alt="Post" 
                    className="w-full h-48 object-cover transition-transform duration-300 ease-in-out hover:scale-110"
                  />
                </div>
              )}
            
              {/* Post Body */}
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.content}</p>
                <hr className="border-gray-300"/>
              </div>
            </div>            

            ))}
          </div>
        )}
      </div>
    </div>
    
    );
};

export default UserPosts;
