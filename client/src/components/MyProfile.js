import React , {useState, useEffect} from 'react'
import axios from 'axios';

const MyProfile = ()=>{
    const [profile, setProfile] = useState(null);
    const [error,setError] = useState('');
    useEffect(() => {
        const fetchProfile = async() =>{
            try{
                const token = localStorage.getItem('token');
                if (!token){
                    setError("Unauthorized access. Please log in first");
                    return;
                }
                const res = await axios.get('/myprofile',{
                    headers:{'Authorization':`Bearer ${token}`}
                });
                setProfile(res.data)
            }catch(err){
                console.error('Failed to fetch profile:',err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)){
                    localStorage.removeItem('token')
                }
                setError(err.response?.data?.message || 'Failed to fetch profile data.');
            }
        };
        fetchProfile();
    },[]);
    if(error){
        return<div className='container mt-5'><div className='alert alert-danger'>{error}</div></div>
    }
    if(!profile){
        return <div className='container mt-5'>Loading profile...</div>;
    }
    return (
        <div className='container mt-5'>
            <div className='card'>
                <div className='card-header'>
                    <h2>My profile</h2>
                </div>
                <div className='card-body'>
                    <h5 className='card-title'>Welcome, {profile.username}!</h5>
                    <p className='card-text'><strong>Email:</strong>{profile.email}</p>
                </div>
            </div>
        </div>
    )
}
export default MyProfile;
