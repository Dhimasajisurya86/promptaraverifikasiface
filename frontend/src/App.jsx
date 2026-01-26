import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EmployeeRegistration from './pages/EmployeeRegistration';
import CheckIn from './pages/CheckIn';
import './index.css';

/**
 * Main App Component
 * Setup routing untuk aplikasi
 */
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<EmployeeRegistration />} />
                <Route path="/checkin" element={<CheckIn />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
