import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import styles from './grid.module.css';

const Lobby = ({ handleLogout }) => {
  const navigate = useNavigate();
  
  // Retrieve user data from localStorage
  const user = JSON.parse(localStorage.getItem('quizgrid-user')); // Use consistent key

  // If user is not found, redirect to login
  if (!user) {
    navigate('/login');
    return null;  // Prevent rendering until redirect completes
  }


  // Handle room creation
  const handleCreateGame = () => {
    const newRoomId = uuidv4();
    localStorage.setItem('roomId', newRoomId); // Save the roomId
    navigate(`/room/${newRoomId}`);
  };
  
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome, {user.username}!</h1>
      <br />
       <div className={styles.buttonContainer}>
      <button onClick={handleCreateGame}className={`${styles.button} ${styles.createRoomButton}`}>Create Game</button>
      <br /><br />
      <button onClick={handleLogout} className={`${styles.button} ${styles.logoutButton}`}>
        Logout
      </button>
      </div>
    </div>
  );
};

export default Lobby;
