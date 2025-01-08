import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminImage from './userlogin.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
//import './login.css'; // Remove this line if you're not using custom CSS anymore

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const navigate = useNavigate();

    const loginHandler = async (event) => {
        event.preventDefault();

        if (!username || !password) {
            alert('Username and password are required!');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setSuccessMessage('Login successful! Redirecting...');
                
                // Store session information in localStorage
             // Save session information in localStorage
      localStorage.setItem('user_id', data.user.user_id);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('roleid', data.user.roleid);
      
      localStorage.setItem('isLoggedIn', true);


           // Convert base64 string to image URL
     const base64String = data.user.profile_pic;
     const profileImageUrl = `data:image/jpeg;base64,${base64String}`;
     localStorage.setItem('profile_pic', profileImageUrl);


                localStorage.setItem('isLoggedIn', true);

                // Navigate based on user role after a short delay for message
                setTimeout(() => {
                    if (data.user.roleid === 1) {
                        navigate(`/admin/home/${username}`);
                    } else {
                        navigate('/home');
                    }
                }, 2000);
            } else {
                const error = await response.json();
                alert(error.message || 'Login failed!');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed!');
        }
    };

    return (
        <div className="flex flex-col md:flex-row justify-center items-center w-screen h-screen overflow-hidden bg-gray-100 p-4 gap-8">
        {/* Left side with the image */}
        <div className="w-full h-96 max-w-md p-2 bg-white shadow-lg rounded-lg flex justify-start items-center">
        <img 
            src={adminImage} 
            alt="Admin login" 
            className="rounded-lg object-cover object-center w-full p-8 bg-zinc-100" 
        />
    </div>
    

        {/* Right side with the login form */}
        <div className="w-full md:w-1/2 max-w-md p-8 space-y-8 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold text-center text-gray-900">User Login</h2>
             
            {successMessage && (
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded">
                    {successMessage}
                </div>
            )}

            <form className="mt-6" onSubmit={loginHandler}>
                {/* Username with email icon */}
            <div className="mb-4 relative">
           
             <input
                type="text"
                name="username"
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Email"
            />
            <span
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 cursor-pointer"
          
        >
        <FontAwesomeIcon icon={faEnvelope} />
        </span>
        </div>

        {/* Password with eye icon */}
        <div className="mb-4 relative">
          
            <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <span
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 cursor-pointer"
                onClick={togglePasswordVisibility}
            >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
        </div>
                <div className="flex justify-between items-center mb-6">
                    <a href="#" className="text-sm text-indigo-600 hover:underline">Forgot Password?</a>
                    <a href="#" onClick={() => navigate('/signup')} className="text-sm text-indigo-600 hover:underline">Signup</a>
                </div>
                <button
                    type="submit"
                    className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
                >
                    Login
                </button>
            </form>
        </div>
    </div>
    );
    
}

export default Login;
