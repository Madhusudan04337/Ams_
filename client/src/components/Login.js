import React, {useState} from 'react';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = ({setToken}) =>{
    const navigate = useNavigate();
    const [formData,setFormData] = useState({username:'', password:''});
    const {username, password}= formData;

    const handleChange =(e) =>{
        setFormData({...formData,[e.target.name]:e.target.value});
    };

    const handleSubmit = async(e) =>{
        e.preventDefault();
        try{
            const res = await axios.post('/login',formData);
            const receivedToken = res.data.token;

            localStorage.setItem('token',receivedToken);
            setToken(receivedToken);
            alert("Login successful !");
            navigate('/myprofile');
        }catch(err){
            console.error('Login failed:',err);
            if(err.response && err.response.data.message){
                alert(err.response.data.message);
            }else{
                alert('Login failed. Please try again.');
            }
        }
    };
    return (
        <div className='container mt-5'>
            <div className='row justify-content-center'>
                <div className='col-md-6'>
                    <div className='card'>
                        <div className='card-body'>
                            <h2 className='card-title text-center mb-4'>Login</h2>
                            <form onSubmit={handleSubmit}>
                                <div className='mb-3'>
                                    <label htmlFor='username' className='form-label'>Username</label>
                                    <input type="text" className='form-control' id="username" name="username" value={username} onChange={handleChange} required />
                                </div>
                                <div className='mb-3'>
                                    <label htmlFor='password_input' className='form-label'>Password</label>
                                    <input type="password" className='form-control' id="password_input" name="password" value={password} onChange={handleChange} required />
                                </div>
                                <button type='submit' className='btn btn-primary w-100'>Login</button>

                                <p className='mt-3 text-center'>
                                    Don't have an account? <Link to="/register">Register</Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Login;
