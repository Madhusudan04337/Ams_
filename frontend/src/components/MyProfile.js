import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import 'bootstrap/dist/css/bootstrap.min.css';

const MyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError("Unauthorized access. Please log in first.");
                    return;
                }

                const res = await axios.get('http://localhost:3000/myprofile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                // Correctly access the nested user object from the API response
                setProfile(res.data.user);

            } catch (err) {
                console.error('Failed to fetch profile:', err);
                // This logic is great for automatically logging out the user if the token is bad
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    localStorage.removeItem('token');
                }
                setError(err.response?.data?.message || 'Failed to fetch profile data.');
            }
        };

        fetchProfile();
    }, []);

    if (error) {
        return (
            <div className='container mt-5'>
                <div className='row justify-content-center'>
                    <div className='col-11 col-md-8 col-lg-6'>
                        <div className='alert alert-danger'>{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className='container mt-5 text-center'>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className='container mt-5'>
            <div className='row justify-content-center'>
                <div className='col-11 col-md-8 col-lg-6'>
                    <div className='card'>
                        <div className='card-header'>
                            <h2>My Profile</h2>
                        </div>
                        <div className='card-body'>
                            <h5 className='card-title'>Welcome, {profile.username}!</h5>
                            <p className='card-text'><strong>Email:</strong> {profile.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyProfile;
