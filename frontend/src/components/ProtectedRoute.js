import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, component }) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return component;
};

export default ProtectedRoute;
