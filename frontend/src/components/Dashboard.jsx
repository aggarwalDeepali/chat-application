import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Alert,
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap';
import { FaSignOutAlt } from 'react-icons/fa';
import Chat from './Chat';

// import Chat from './Chat'; // Assuming Chat.js is in the same directory

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You are not logged in!');
      setLoading(false);
      navigate('/login');
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <Container className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <div className="d-flex min-vh-100 dashboard-container">
      {/* Sidebar */}
      <div className="sidebar bg-light p-4">
        <h4 className="mb-4 text-center">Chat Dashboard</h4>
        <Nav vertical pills>
          <NavItem className="mb-2">
            <NavLink
              href="#"
              onClick={handleLogout}
              className="d-flex align-items-center text-danger"
            >
              <FaSignOutAlt className="me-2" /> Logout
            </NavLink>
          </NavItem>
        </Nav>
      </div>

      {/* Main Content: Chat Component */}
      <div className="main-content flex-grow-1 bg-white">
        {error && <Alert color="danger">{error}</Alert>}
        <Chat />
      </div>
    </div>
  );
};

export default Dashboard;