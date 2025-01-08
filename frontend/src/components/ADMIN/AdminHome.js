import React, { useEffect, useState } from 'react';
//import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faHeart, faThumbsDown, faUserTimes } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Spinner, Alert, Button, Card } from 'react-bootstrap';
import AdminNavbar from '../COMP/AdminNavbar';


const AdminHome = () => {
  const user_id = localStorage.getItem('user_id');
  console.log(user_id);
  const username=localStorage.getItem('username');
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  const [user,setUser]= useState([]);


  
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

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:3001/home/posts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setPosts(data.posts);

    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const disablePost = async (post_id) => {
    try {
      await fetch('http://localhost:3001/api/posts/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id }),
      });
      alert('The post has been disabled.');
      fetchPosts();
    } catch (error) {
      console.error('Error disabling post:', error);
    }
  };

  const disableUser = async (user_id) => {
    try {
      await fetch('http://localhost:3001/api/users/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id }),
      });
      alert('The user has been disabled.');
      fetchPosts();
    } catch (error) {
      console.error('Error disabling user:', error);
    }
  };

  const increaseCount = (e, type, post_id) => {
    const countElement = e.currentTarget.querySelector('b');
    const count = parseInt(countElement.textContent, 10);
    countElement.textContent = count + 1;
  };


  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('roleid');
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <div className="container bg-light">
     
      <AdminNavbar 
         user={{ 
          profileImageUrl: user.profileImageUrl, 
          firstname: user.firstname, 
          lastname: user.lastname 
        }} 
    user_id={user.user_id} 
    handleLogout={handleLogout} 
    username={user.username} 
  />
    <br/><br/> <br/><br/> <br/>
      <div className="row">
        <div className="col-lg-8 col-md-12 mb-4 blog-entries">
          {posts.map((post) => (
            <div className="card mb-4" key={post.post_id}>
              <img
                src={post.image}
                className="card-img-top rounded-0 px-2"
                alt={post.title}
              />
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <img
                    src={post.profile_pic }
                    alt="User Profile"
                    className="profile-picture2 mr-2"
                  />
                  <p className="mb-0">{post.username}</p>
                  <button
                    className="btn btn-danger btn-sm ml-auto disable-user-btn"
                    onClick={() => disableUser(post.user_id)}
                  >
                    <FontAwesomeIcon icon={faUserTimes} /> Disable User
                  </button>
                </div>
                <h3 className="card-title"><b>{post.title}</b></h3>
                <h5 className="card-subtitle mb-2 text-muted">{post.category}, <span className="text-muted">{new Date(post.created_at).toLocaleDateString()}</span></h5>
                <p className="card-text blog-content">
                  {post.content}
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <button className="btn btn-outline-primary btn-sm read-more-btn">READ MORE »</button>
                  <div>
                    <button
                      className="btn btn-sm btn-outline-secondary comment-btn"
                    >
                      <FontAwesomeIcon icon={faComments} /> Comments
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary like-btn"
                      onClick={(e) => increaseCount(e, 'like', post.post_id)}
                    >
                      <FontAwesomeIcon icon={faHeart} /> <b>{post.n_likes}</b> Likes
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary dislike-btn"
                      onClick={(e) => increaseCount(e, 'dislike', post.post_id)}
                    >
                      <FontAwesomeIcon icon={faThumbsDown} /> <b>{post.n_dislikes}</b> Dislikes
                    </button>
                  </div>
                </div>
                <button
                  className="btn btn-warning btn-sm mt-2 disable-post-btn"
                  onClick={() => disablePost(post.post_id)}
                >
                  Disable Post
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="col-lg-4 col-md-12 mb-4">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title font-bold">About Me</h4>
              <p className="card-text">As the admin, I manage the platform to ensure everything runs smoothly. I handle blog posts, user activity, and make sure the community stays safe and positive. My goal is to keep the platform engaging and up-to-date for everyone.</p>
            </div>
          </div>
          <div className="mt-3" onClick={() => {
            navigate(`/admin/dashboard/${username}`);
          }}>
            <button className="btn btn-primary btn-block">Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
