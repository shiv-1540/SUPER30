import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import "./login.css";

function SignUp() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirm_password: ''
    });
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const signUpHandler = async (event) => {
        event.preventDefault();
        console.log(formData);

        if (formData.password !== formData.confirm_password) {
            alert('Passwords do not match!');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: formData.username,
                    firstname: formData.firstname,
                    lastname: formData.lastname,
                    email: formData.email,
                    password: formData.password
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('User registered:', data);
                // alert('Registration successful!');
                setSuccessMessage('Registration successful!');

                // Store session information in localStorage
                localStorage.setItem('session', JSON.stringify(data));


                navigate(`/login`);
                // Navigate to the appropriate page based on the user's role
                // if (data.roleid === 1) {
                //     navigate(`/admin/home`);
                // } else {
                //     navigate(`/home/${formData.username}`);
                // }
            } else {
                const error = await response.json();
                console.error('Registration error:', error.message);
                alert(error.message || 'Registration failed!');
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Network error! Please try again later.');
        }
    };

    return (
        <div>
            {/* Sign Up */}
            <section>
                <div className="flex justify-center items-center bg-gray-100 h-screen " >
                    <div className="w-full max-w-md p-8 bg-white  space-y-8 shadow-lg rounded-lg">
                        <h2 className="text-2xl font-bold text-center text-gray-900">Sign Up</h2>
                        {successMessage && (
                            <div className='bg-green-100 text-green-800 px-4 py-2 rounded'
                            >
                            {successMessage}
                            </div>
                        )}
                        <form className="mt-6" onSubmit={signUpHandler}>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                     className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    name="firstname"
                                    placeholder="First Name"
                                     className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                                    required
                                    value={formData.firstname}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    name="lastname"
                                    placeholder="Last Name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                                    required
                                    value={formData.lastname}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-4">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="E-mail"
                                     className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-4">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Create Password"
                                     className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-4">
                                <input
                                    type="password"
                                    name="confirm_password"
                                    placeholder="Confirm Password"
                                     className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                                    required
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="inputBox">
                                <input type="submit" value="Sign up"  className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"/>
                            </div>
                        </form>
                        <div className="links">
                            <span className="text-sm text-indigo-600 hover:underline"><a href="#" onClick={() => navigate('/login')}>Back to Login</a></span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default SignUp;
