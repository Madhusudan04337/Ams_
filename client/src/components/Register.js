import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'employee'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { username, email, password, role } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const res = await axios.post('http://localhost:4000/register', formData);
            setSuccess(res.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            if (err.response && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Registration failed. Please try again.');
            }
        }
    };

    return (
        <div className='container mt-5'>
            <div className='row justify-content-center'>
                <div className='col-11 col-md-8 col-lg-6'>
                    <div className='card'>
                        <div className='card-body'>
                            <h2 className='card-title text-center mb-4'>Register</h2>
                            <form onSubmit={handleSubmit}>
                                {error && <div className="alert alert-danger">{error}</div>}
                                {success && <div className="alert alert-success">{success}</div>}
                                
                                <div className='mb-3'>
                                    <label htmlFor='username' className='form-label'>Username</label>
                                    <input type="text" className='form-control' id="username" name="username" value={username} onChange={handleChange} required />
                                </div>

                                <div className='mb-3'>
                                    <label htmlFor='email' className='form-label'>Email</label>
                                    <input type="email" className='form-control' id="email" name="email" value={email} onChange={handleChange} required />
                                </div>

                                <div className='mb-3'>
                                    <label htmlFor='password' className='form-label'>Password</label>
                                    <input type="password" className='form-control' id="password" name="password" value={password} onChange={handleChange} required />
                                </div>

                                <div className='mb-3'>
                                    <label htmlFor='role' className='form-label'>Role</label>
                                    <select className='form-select' id='role' name='role' value={role} onChange={handleChange}>
                                        <option value='employee'>Employee</option>
                                        <option value='manager'>Manager</option>
                                        <option value='admin'>Admin</option>
                                    </select>
                                </div>

                                <button type='submit' className='btn btn-primary w-100'>
                                    Register
                                </button>
                                
                                <p className="mt-3 text-center">
                                    Already have an account? <Link to="/login">Login</Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
