// Timer.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const Timer = ({ startTime, isActive, timerKey }) => { // Add timerKey prop
  const [timeLeft, setTimeLeft] = useState(startTime);

  // Reset timer whenever startTime or timerKey changes
  useEffect(() => {
    setTimeLeft(startTime); // Reset the timer with the new start time
  }, [startTime, timerKey]); // Add timerKey to dependencies to trigger reset

  // Timer countdown logic
  useEffect(() => {
    if (timeLeft === 0) {
      toast.warning("Time's up!", { position: 'top-right', autoClose: 3000 });
      return;
    }

    if (isActive && timeLeft > 0) {
      const intervalId = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [timeLeft, isActive]);

  return (
    <div>
      <p>{timeLeft}</p>
    </div>
  );
};

export default Timer;
