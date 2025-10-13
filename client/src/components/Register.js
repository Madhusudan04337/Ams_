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
    const { username, email, password, role } = formData;
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/register', formData);
            alert(res.data.message)
            navigate('/login');

        } catch (err) {
            if (err.response && err.response.data.message) {
                alert(err.response.data.message);
            } else {
                alert('Registration failed. Please try again.');
            }
        }
    };


    return (
        <div className='container mt-5'>
            <div className='row jusify-content-center'>
                <div className='col-lg-6 col-md-12'>
                    <div className='card'>
                        <div className='card-body'>
                            <h2 className='card-title text-center mb-4'>Register</h2>
                            <form onSubmit={handleSubmit}>
                                <div className='mb-3'>
                                    <label htmlFor='username' className='form-label'>Username</label>
                                    <input type="text" className='form-control' id="username" name="username" value={username} onChange={handleChange} required />
                                </div>
                                <div className='mb-3'>
                                    <label htmlFor='email' className='form-label'>Email</label>
                                    <input type="email" className='form-control' id="email" name="email" value={email} onChange={handleChange} required />
                                </div>
                                <div className='mb-3'>
                                    <label htmlFor='pswd_input' className='form-label'>Password</label>
                                    <input type="password" className='form-control' id="pswd_input" name="password" value={password} onChange={handleChange} required />
                                </div>
                                <div className='mb-3'>
                                    <label htmlFor='role' className='form-label'>Role</label>
                                    <select className='form-select' id='role' name='role' value={role} onChange={handleChange}>
                                        <option value='employee'>Employee</option>
                                        <option value='manager'>Manager</option>
                                        <option value='admin'>Admin</option>
                                    </select>
                                </div>
                                <button type='submit' className='btn btn-primary w-100'>Register</button>
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
