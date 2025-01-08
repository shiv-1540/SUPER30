import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DisabledPostsManager from './DisablePostManager';
import AdminNavbar from '../COMP/AdminNavbar';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectname, setSelectedname] = useState([]);
    const [selectedRole, setSelectedRole] = useState('1'); // Default to Admin role
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('users'); // Default tab is 'users'

    const user_id = localStorage.getItem('user_id');
    const username = localStorage.getItem('username');

    const navigate = useNavigate();
    const [user, setUser] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user_id = localStorage.getItem('user_id');
                if (!user_id) {
                    navigate('/login');
                    return;
                }

                const response = await fetch(`http://localhost:3001/profile/${user_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                const data = await response.json();
                setUser(data);
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
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [navigate]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get('http://localhost:3001/admin/roles');
                setRoles(response.data);
            } catch (error) {
                setError('Error fetching roles');
                console.error('Error fetching roles:', error);
            }
        };

        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:3001/admin/users/role/${selectedRole}`);
                setUsers(response.data);
            } catch (error) {
                setError('Error fetching users');
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
        fetchUsers();
    }, [selectedRole]);

    const handleStatusChange = async (userId, newStatus) => {
        try {
            const response = await axios.put(`http://localhost:3001/admin/users/status/${userId}`, { disabled_admin: newStatus });
            if (response.status === 200) {
                setUsers(users.map(user =>
                    user.user_id === userId ? { ...user, disabled_admin: newStatus } : user
                ));
            } else {
                setError('Failed to update status. Please try again.');
            }
        } catch (error) {
            setError('Error updating user status');
            console.error('Error updating user status:', error);
        }
    };

    const handleRoleChange = async (userId, newRoleId) => {
        try {
            const response = await fetch(`http://localhost:3001/admin/users/role/${userId}/${newRoleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                setUsers(users.map(user =>
                    user.user_id === userId ? { ...user, roleid: newRoleId } : user
                ));
            } else {
                setError('Failed to update user role');
            }
        } catch (error) {
            setError('Error updating user role');
            console.error('Error updating user role:', error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="bg-white-800 min-h-screen">
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
            <br /><br /><br /><br /><br />
            <h1 className="text-black text-3xl font-bold px-4 mb-2">Admin Dashboard</h1>

            <div className="container bg-black flex flex-row mx-auto px-8 py-8 mt-8 gap-6">
                {/* Admin Actions */}
                <div className="bg-white-800 w-1/6 flex flex-col gap-4 mb-6">
                    <button
                        className={`py-2 rounded-md ${activeTab === 'users' ? 'bg-blue-600' : 'bg-blue-500'} text-white hover:bg-blue-600`}
                        onClick={() => setActiveTab('users')}
                    >
                        Manage Users
                    </button>
                    <button
                        className={`py-2 px-4 rounded-md ${activeTab === 'posts' ? 'bg-green-600' : 'bg-green-500'} text-white hover:bg-green-600`}
                        onClick={() => setActiveTab('posts')}
                    >
                        Manage Posts
                    </button>
                </div>

                {/* Dynamic Content Based on Active Tab */}
                <div className="bg-white-800 w-5/6 flex flex-col gap-4 mb-6">
               
                    {error && <div className="bg-red-500 text-white p-4 rounded-md mb-6">{error}</div>}

                    {activeTab === 'users' && (
                        <>
                        <h1 className="text-white text-2xl bg-zinc-500 p-2 font-bold mb-6">Manage Users</h1>
                            {/* Role Filter */}
                            <div className="mb-6">
                                <label htmlFor="roleSelect" className="block text-gray-300 text-sm font-medium mb-2">Filter by Role:</label>
                                <select
                                    id="roleSelect"
                                    value={selectname}
                                    onChange={(e) => {
                                        const selectedRole = e.target.value === "Admin" ? 1 :
                                            e.target.value === "Author" ? 2 :
                                                e.target.value === "Publisher" ? 3 : 4;
                                        setSelectedRole(selectedRole);
                                        setSelectedname(e.currentTarget.value);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                    {roles.map((role) => (
                                        <option key={role.role_id} value={role.role_name}>
                                            {role.role_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Users Table */}
                            {loading ? (
                                <div className="flex justify-center">
                                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                                        <thead>
                                            <tr className="bg-gray-200 text-gray-700 text-left">
                                                <th className="p-3">ID</th>
                                                <th className="p-3">Username</th>
                                                <th className="p-3">Email</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3">Role</th>
                                                <th className="p-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.user_id} className="border-b">
                                                    <td className="p-3">{user.user_id}</td>
                                                    <td className="p-3">{user.username}</td>
                                                    <td className="p-3">{user.email}</td>
                                                    <td className="p-3">{user.disabled_admin === 0 ? 'Enabled' : 'Disabled'}</td>
                                                    <td className="p-3">
                                                        <select
                                                            value={user.roleid}
                                                            onChange={(e) => {
                                                                const newRoleId = e.target.value === "Admin" ? 1 :
                                                                    e.target.value === "Author" ? 2 :
                                                                        e.target.value === "Publisher" ? 3 : 4;
                                                                handleRoleChange(user.user_id, newRoleId);
                                                            }}
                                                            className="p-2 border border-gray-300 rounded-md"
                                                        >
                                                            {roles.map((role) => (
                                                                <option key={role.role_id} value={role.role_name}>
                                                                    {role.role_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-3">
                                                        <button
                                                            className={`py-1 px-3 rounded-md ${user.disabled_admin === 0 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'} hover:opacity-80`}
                                                            onClick={() => handleStatusChange(user.user_id, user.disabled_admin === 0 ? 1 : 0)}
                                                        >
                                                            {user.disabled_admin === 0 ? 'Disable' : 'Enable'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'posts' && (
                        <div>
                            {/* Placeholder for Manage Posts */}
                            <DisabledPostsManager />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
