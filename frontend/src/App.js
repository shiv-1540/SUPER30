import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';


import Login from './components/LOGIN/login.js';
import SignUp from './components/LOGIN/signup.js';
import Home from './components/HOME/Home.js';
import Profile from './components/POST/profile.js';
import Posts from './components/POST/posts.js';
//import MainProfile from './components/POST/mainprofile.js';
import "./components/POST/style.css";
import OtherProfile from './components/POST/otherprofile.js';

import AdminDashboard from './components/ADMIN/AdminDashboard .js';
import ProfilePage from './components/ADMIN/AdminProfile.js';

//import CreatePost from './components/POST /createPost.js';
import EditProfile from './components/POST/EditProfile.js';

// import App1 from './components/POST/profile';
import CreatePost from './components/HOME/CreatePost.js';
import AdminHome from './components/ADMIN/AdminHome.js';
import OtherPosts from './components/POST/otherposts.js';

function App() {
  return (
    <div className="App  bg-white" style={{width:"100vw"}}>
      <Router>
        <Routes>
         <Route path="/" element={<Navigate to={"/login"} />} />
            <Route  path="/home" element={<Home/>}/>
            <Route path="/profile/:user_id" element={<Profile/>}/>
            <Route path="/otherprofile/:user_id" element={<OtherProfile/>}/>
            <Route path="/otherposts/:user_id" element={<OtherPosts/>}/>

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            <Route path="/admin/home/:username" element={<AdminHome/>}/>
            <Route path="/admin/dashboard/:username" element={<AdminDashboard/>}/>
            <Route path="/admin/profile/:username" element={<ProfilePage/>}/>
            
           
            <Route  path="profile/createpost" element={<CreatePost/>}/>
            
            
            <Route path="/" element={<AdminHome />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
