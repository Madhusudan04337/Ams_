import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = ({ setToken }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { username, password } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const res = await axios.post('http://localhost:4000/login', formData);
            const receivedToken = res.data.token;

            localStorage.setItem('token', receivedToken);
            setToken(receivedToken);
            setSuccess('Login successful! Redirecting...');

            setTimeout(() => {
                navigate('/myprofile');
            }, 1000);

        } catch (err) {
            if (err.response && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Login failed. Please try again.');
            }
        }
    };

    return (
        <div className='container mt-5'>
            <div className='row justify-content-center'>
                <div className='col-11 col-md-8 col-lg-6'>
                    <div className='card'>
                        <div className='card-body'>
                            <h2 className='card-title text-center mb-4'>Login</h2>
                            <form onSubmit={handleSubmit}>
                                {error && <div className="alert alert-danger">{error}</div>}
                                {success && <div className="alert alert-success">{success}</div>}

                                <div className='mb-3'>
                                    <label htmlFor='username' className='form-label'>Username</label>
                                    <input type="text" className='form-control' id="username" name="username" value={username} onChange={handleChange} required />
                                </div>

                                <div className='mb-3'>
                                    <label htmlFor='password' className='form-label'>Password</label>
                                    <input type="password" className='form-control' id="password" name="password" value={password} onChange={handleChange} required />
                                </div>

                                <button type='submit' className='btn btn-primary w-100'>
                                    Login
                                </button>

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
