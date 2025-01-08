import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Alert, Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../COMP/Navbar';
//import './Home.css'; // Import custom CSS for proper styling
const BlogCard = ({ user1_id, post_id, title, content, imgSrc, userProfile, username, date, initialLikes, initialDislikes, onShowComments }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [commentText, setCommentText] = useState(""); // Comment text state
  const [comments, setComments] = useState([]); // State to hold fetched comments
  const [loadingComments, setLoadingComments] = useState(false); // Loading state for comments
  const navigate = useNavigate();

  // Fetch comments when the modal is opened
  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await fetch(`http://localhost:3001/comments/${post_id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments); // Assuming 'comments' contains the comment data
        setLoadingComments(false);
      } else {
        alert("Failed to fetch comments");
        setLoadingComments(false);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      setLoadingComments(false);
    }
  };

  const handleShowModal = () => {
    setIsModalOpen(true);
    fetchComments(); // Fetch comments when the modal opens
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitComment = async () => {
    const user_id = localStorage.getItem('user_id');
    if (commentText.trim() === "") {
      alert("Comment cannot be empty");
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/post/${post_id}/acomment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          comment_txt: commentText,
        }),
      });
      if (response.ok) {
        alert("Comment added successfully");
        setCommentText(""); // Clear the comment input
        fetchComments(); // Fetch updated comments after submission
        setIsModalOpen(false); // Close the modal
      } else {
        alert("Failed to add comment");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleLike = async () => {
    const user_id = localStorage.getItem('user_id');
    if (user_id) {
      try {
        const response = await fetch(`http://localhost:3001/post/${post_id}/like/${user_id}`, { method: 'POST' });
        if (response.ok) {
          setLikes(prevLikes => prevLikes + 1);
          setHasLiked(true);
          if (hasDisliked) {
            setDislikes(prevDislikes => prevDislikes - 1);
            setHasDisliked(false);
          }
        } else {
          throw new Error("Failed to like post");
        }
      } catch (error) {
        console.error('Error liking post:', error);
      }
    }
  };

  const handleDislike = async () => {
    const user_id = localStorage.getItem('user_id');
    if (user_id) {
      try {
        const response = await fetch(`http://localhost:3001/post/${post_id}/dislike/${user_id}`, { method: 'POST' });
        if (response.ok) {
          setDislikes(prevDislikes => prevDislikes + 1);
          setHasDisliked(true);
          if (hasLiked) {
            setLikes(prevLikes => prevLikes - 1);
            setHasLiked(false);
          }
        } else {
          throw new Error("Failed to dislike post");
        }
      } catch (error) {
        console.error('Error disliking post:', error);
      }
    }
  };

  return (
    <div className="bg-white shadow-lg w-full h-fit rounded-lg overflow-hidden mb-4 mx-4">
      {imgSrc && (
        <img src={imgSrc} alt="Card image" className="w-full h-[300px] rounded-t-lg" />
      )}
      <div className="p-3">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-700 mb-3">{content}</p>

        <div className="flex justify-between items-center mb-2">
          <button
            className="text-blue-500 hover:underline flex items-center"
            onClick={handleShowModal} // Open modal on click
          >
            <i className="fas fa-comments mr-1"></i> Comments
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-gray-800">{username}</span>
            <button
              className="bg-gray-200 rounded-full p-2"
              onClick={() => navigate(`/otherprofile/${user1_id}`)}
            >
              <img src={userProfile} alt={username} className="w-8 h-8 rounded-full" />
            </button>
           
          </div>
        </div>

        <div className="flex justify-between items-start">
          <button
            className={`flex items-center space-x-1 py-1 px-3 rounded ${
              hasLiked ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-500 border border-blue-500'
            }`}
            onClick={handleLike}
            disabled={hasLiked}
          >
            <i className="fas fa-thumbs-up"></i> <span>{likes}</span>
          </button>
          <button
            className={`flex items-center space-x-1 py-1 px-3 rounded ${
              hasDisliked ? 'bg-red-500 text-white' : 'bg-red-100 text-red-500 border border-red-500'
            }`}
            onClick={handleDislike}
            disabled={hasDisliked}
          >
            <i className="fas fa-thumbs-down"></i> <span>{dislikes}</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-100 p-3 text-sm text-gray-600">
        Posted on {date}
      </div>

      {/* Comment Modal */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto ">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-lg shadow-lg p-6 w-1/3">
              <h2 className="text-lg font-semibold mb-4">Comments</h2>

              {/* Display loading state */}
              {loadingComments ? (
                <p>Loading comments...</p>
              ) : (
                // Display fetched comments
                <div className="max-h-64 overflow-y-auto mb-4">
                  {comments.length > 0 ? (
                    comments.map((comment, index) => (
                      <div key={index} className="mb-4 flex items-center">
                        <img src={comment.profile_pic} alt={comment.username} className="w-8 h-8 rounded-full mr-3" />
                        <div>
                          <p className="font-semibold">{comment.username}</p>
                          <p className="text-gray-600">{comment.comment_txt}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No comments yet.</p>
                  )}
                </div>
              )}

              {/* Add a comment */}
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 mb-4"
                rows="4"
                placeholder="Write your comment here..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              ></textarea>
              <div className="flex justify-end space-x-2">
                <button
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  onClick={handleSubmitComment}
                >
                  Submit Comment
                </button>
              </div>
            </div>
          </div>
          <div className="inset-0 z-50 bg-black opacity-50"></div>
        </div>
      )}
    </div>
  );
};

const Home = () => {
  const user_id = localStorage.getItem('user_id');
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Technology', 'Love', 'Social', 'Comedy', 'Health'];

  // Fetch posts with optional category filter
  useEffect(() => {
    const fetchPosts = async (category) => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/home/posts?category=${category}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();

        if (data.posts) {
          setPosts(data.posts);
        } else {
          setError('Unexpected response format');
        }
      } catch (error) {
        setError('Error fetching posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts(selectedCategory);
  }, [selectedCategory]);

  // Fetch popular posts
  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        const response = await fetch('http://localhost:3001/home/popular', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();

        if (data.popularPosts) {
          setPopularPosts(data.popularPosts);
        } else {
          setError('Unexpected response format');
        }
      } catch (error) {
        setError('Error fetching popular posts');
      }
    };

    fetchPopularPosts();
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user_id) {
          navigate('/login');
          return;
        }

        const response = await fetch(`http://localhost:3001/profile/${user_id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const data = await response.json();

        if (data.profile_pic && data.profile_pic.data) {
          const base64String = btoa(
            new Uint8Array(data.profile_pic.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          );
          setUser({
            ...data,
            profileImageUrl: `data:image/jpeg;base64,${base64String}`,
          });
        } else {
          setUser(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user_id, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      // Redirect to login page or show login prompt
      navigate('/login');
    }
  }, []);
  
  return (
    <div className="flex flex-col h-screen" id="Home">
      {/* Navbar */}
      <Navbar
        user={{ profileImageUrl: user.profileImageUrl }}
        user_id={user.user_id}
        handleLogout={handleLogout}
        username={user.username}
      />
      <br /><br /> <br /><br /> <br />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/5 flex flex-col h-full space-y-6 pr-4">
          <div className="bg-white-800 p-4 rounded-lg shadow-md flex-1 overflow-hidden">
            <h3 className="text-black font-semibold mb-4">Filter Categories</h3>
            <div className="flex flex-col space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`py-2 px-4 rounded-lg ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  } hover:bg-blue-600`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="w-3/5 overflow-hidden">
          <div className="flex flex-wrap  gap-4 h-full overflow-auto">
            {loading ? (
              <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <p>Loading posts...</p>
              </div>
            ) : error ? (
              <Alert variant="danger" className="text-center">
                {error}
              </Alert>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <BlogCard
                  key={post.post_id}
                  user1_id={post.user_id}
                  post_id={post.post_id}
                  title={post.title}
                  content={post.content}
                  imgSrc={post.image}
                  userProfile={
                    post.profile_pic ||
                    'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                  }
                  username={post.username}
                  date={new Date(post.created_at).toLocaleDateString()}
                  initialLikes={post.n_likes}
                  initialDislikes={post.n_dislikes}
                />
              ))
            ) : (
              <p className="text-center">No posts available</p>
            )}
          </div>
        </div>
           {/* Popular Posts Section */}
          <div className="bg-white-500 shadow-lg w-full h-fit rounded-lg p-4 rounded-lg shadow-md flex-1 overflow-hidden">
           <h3 className="text-black font-semibold mb-4">Popular Posts</h3>
           <ul className="space-y-4">
        {popularPosts.length > 0 ? (
       popularPosts.map((post) => (
         <li key={post.post_id} className="flex items-center space-x-4">
           <img
             className="w-16 h-16 object-cover rounded-md"
             src={post.profile_pic || 'https://via.placeholder.com/150'}
             alt="User Profile"
           />
           <div>
             <h4 className="text-black font-semibold">{post.title}</h4>
             <p className="text-sm text-black">{post.username}</p>
           </div>
         </li>
       ))
     ) : (
       <p className="text-center">No popular posts available</p>
     )}
   </ul>
 </div>
      </div>
      
    </div>
  );
};

export default Home;

