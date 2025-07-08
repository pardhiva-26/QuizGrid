import React, { useState, useEffect } from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import styles from './grid.module.css';
import Timer from './Timer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const scoreReader=(array,ind)=>{
     let x=0,y=0;
     for(let i=0;i<array.length;i++)
     {
        if(array[i]=='P')
        {
          x++;
        }
        else if(array[i]=='C')
        {
          y++;
        }
     }
     if(ind=='P') return x;
     if(ind=='C') return y;
}


const Grid = ({ handleLogout }) => {
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timerStart, setTimerStart] = useState(null);
  const [timerKey, setTimerKey] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [timerActive, setTimerActive] = useState(true);
  const [isAnswered, setIsAnswered] = useState(false);
  const [cellOwnership, setCellOwnership] = useState(Array(25).fill(null)); // 'P', 'C', or null
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [firstTime, setFirstTime] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [usedCells, setUsedCells] = useState([]);
  const [currentCell, setCurrentCell] = useState(null);

  const api = 'https://the-trivia-api.com/v2/questions';


  const handleStartNewGame = async () => {
    // Reset all game states
    setCellOwnership(Array(25).fill(null));
    setUsedCells([]);
    setPlayerScore(0);
    setComputerScore(0);
    setQuizFinished(false);
    setQuizData(null);
    setCurrentCell(null);
    setTimerStart(null);
    setTimerKey((prevKey) => prevKey + 1);
    
  
    toast.success('New game started!', { position: 'top-right', autoClose: 3000 });
  
    // Save reset state to backend
    await saveGameState();
  };

  const { roomId } = useParams(); // Get roomId from the URL

// Use the roomId in `loadGameState` and `saveGameState`:
const saveGameState = async (updatedState) => {
  try {
    await fetch(`http://localhost:8000/api/save/${roomId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedState) });
    localStorage.setItem(`gameState-${roomId}`, JSON.stringify(updatedState));
    console.log("Payload to /save:", {
      roomId,
      cellOwnership,
      playerScore,
      computerScore,
      usedCells,
      quizFinished,
    });
  } catch (err) { console.error('Failed to save game state:', err); }
};

const loadGameState = async () => {
  
  if(firstTime==0)
    {
      setFirstTime(1);
      return;
    }
  try {
    const response = await fetch(`http://localhost:8000/api/game/${roomId}`);
    if (!response.ok) throw new Error('Failed to load');
    const { game } = await response.json();
    if (game) {
      setCellOwnership(game.cellOwnership || Array(25).fill(null));
      setUsedCells(game.usedCells || []);
      setPlayerScore(game.playerScore || 0);
      setComputerScore(game.computerScore || 0);
      setQuizFinished(game.quizFinished || false);
    }
  } catch { const savedState = JSON.parse(localStorage.getItem(`gameState-${roomId}`)); if (savedState) { setCellOwnership(savedState.cellOwnership); setUsedCells(savedState.usedCells); setPlayerScore(savedState.playerScore); setComputerScore(savedState.computerScore); } }
};


useEffect(() => {
  if (roomId) {
    loadGameState();
  }
}, [roomId]);


// Redirect to lobby if no roomId is found
// useEffect(() => {
//   const savedRoomId = localStorage.getItem('roomId');
//   if (!savedRoomId) {
//     navigate('/'); // Redirect to lobby if no room ID
//   } else {
//     loadGameState(savedRoomId); // Load game state using the saved room ID
//   }
// }, []);



const handleApiClick = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await fetch(api);
    if (!response.ok) throw new Error('Failed to fetch question');
    const data = await response.json();
    const singleQuestion = data[0];
    const shuffledAnswers = shuffleArray([
      singleQuestion.correctAnswer,
      ...singleQuestion.incorrectAnswers,
    ]);

    setQuizData({ ...singleQuestion, shuffledAnswers });
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setTimerActive(true);
    setIsAnswered(false);
  } catch (err) {
    setError(err);
    toast.error('Failed to fetch question. Try again.', { autoClose: 3000 });
  } finally {
    setLoading(false);
  }
};

const handleCellClick = (index) => {
  if (quizFinished) {
    toast.info('Game has already finished!', { autoClose: 2000 });
    return;
  }

  if (usedCells.includes(index)) {
    toast.warning('This cell has already been answered!', { autoClose: 2000 });
    return;
  }

  // Update the current cell and add it to used cells
  setCurrentCell(index);
  const cellColor = colorForCell(index);
  const newUsedCells = [...usedCells, index];
  setUsedCells(newUsedCells);

  // Set timers based on cell color
  if (cellColor === styles.redCell) setTimerStart(30);
  else if (cellColor === styles.blueCell) setTimerStart(45);
  else setTimerStart(60);

  setTimerKey((prevKey) => prevKey + 1);

  // Fetch a new question after updating state
  handleApiClick();
};

const handleAnswerClick = (answer) => {
  if (isAnswered || quizFinished) return;

  // Check if the answer is correct
  const correct = answer === quizData.correctAnswer;
  setSelectedAnswer(answer);
  setIsAnswered(true);
  setTimerActive(false);
  setIsAnswerCorrect(correct);

  // Update cell ownership and scores
  updateCellOwnership(currentCell, correct ? 'P' : 'C', correct);

  // Check for win condition
  if (usedCells.length + 1 > 5) checkWinCondition();
};

const updateCellOwnership = (index, owner) => {
  // Ensure we create a new array for immutability
  const newOwnership = cellOwnership;
  newOwnership[index] = owner;

  // Update scores based on ownership
  let updatedPlayerScore = scoreReader(newOwnership,'P');
  console.log(updatedPlayerScore);
  let updatedComputerScore = scoreReader(newOwnership,'C');
  console.log(updatedComputerScore);


  // if (owner === 'P') {
  //   updatedPlayerScore += 1;
  // } else {
  //   updatedComputerScore += 1;
  // }

  // Update all states together to ensure consistency
  setCellOwnership(newOwnership);
  setPlayerScore(updatedPlayerScore);
  setComputerScore(updatedComputerScore);


  // Log for debugging (optional)
  console.log('Updated State:', {
    cellOwnership: newOwnership,
    usedCells: usedCells,
    playerScore: updatedPlayerScore,
    computerScore: updatedComputerScore,
  });

  
  // Save the updated game state
  saveGameState({
    roomId,
    cellOwnership: newOwnership,
    usedCells: usedCells,
    playerScore: updatedPlayerScore,
    computerScore: updatedComputerScore,
    quizFinished,
  });
};

  const checkWinCondition = () => {
    const winPatterns = [
      [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19], [20, 21, 22, 23, 24], // Rows
      [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24], // Columns
      [0, 6, 12, 18, 24], [4, 8, 12, 16, 20], // Diagonals
    ];

    for (const pattern of winPatterns) {
      if (pattern.every((i) => cellOwnership[i] === 'P')) {
        setQuizFinished(true);
        toast.success('Player wins!', { autoClose: 3000 });
        return;
      }
      if (pattern.every((i) => cellOwnership[i] === 'C')) {
        setQuizFinished(true);
        toast.error('Computer wins!', { autoClose: 3000 });
        return;
      }
    }

    if (usedCells.length === 25) {
      setQuizFinished(true);
      toast[playerScore > computerScore ? 'success' : 'error'](
        playerScore > computerScore ? 'Player wins by score!' : 'Computer wins by score!',
        { autoClose: 3000 }
      );
    }
  };


  const colorForCell = (index) => {
    const cellOwner = cellOwnership[index];
    if (cellOwner === 'P') return styles.playerCell;
    if (cellOwner === 'C') return styles.computerCell;

    const cellNumber = index + 1;
    if (cellNumber === 13) return styles.redCell;
    if ([1, 5, 7, 9, 17, 19, 21, 25].includes(cellNumber)) return styles.blueCell;
    return styles.orangeCell;
  };
  

  return (
    <>
      <div className={styles.buttonContainer}>
  <button onClick={handleLogout} className={`${styles.button} ${styles.logoutButton}`}>
    Logout
  </button>
  <button onClick={handleStartNewGame} className={`${styles.button} ${styles.newGameButton}`}>
    New Game
  </button>
</div>


<Timer startTime={timerStart} isActive={timerActive} key={timerKey} />

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      
      {!loading && !error && quizData && currentCell !== null && !quizFinished && (
        <div>
          <h2>{quizData.question.text}</h2>
          <ul className={styles.optionsContainer}>
            {quizData.shuffledAnswers.map((answer, index) => (
              <li
                key={index}
                onClick={() => handleAnswerClick(answer)}
                className={`${styles.optionBox} ${
                  selectedAnswer && answer === quizData.correctAnswer
                    ? styles.correctOption
                    : selectedAnswer === answer
                    ? styles.incorrectOption
                    : ''
                } ${isAnswered ? styles.disabledOption : ''}`}
                style={{ pointerEvents: isAnswered ? 'none' : 'auto' }}
              >
                {answer}
              </li>
            ))}
          </ul>
          {isAnswerCorrect === false && (
            <p className={styles.correctAnswerMsg}>The correct answer is: {quizData.correctAnswer}</p>
          )}
        </div>
      )}

      {quizFinished && (
        <div className={styles.endScreen}>
          <h2>Game Over!</h2>
          <p>{playerScore > computerScore ? 'Player Wins!' : 'Computer Wins!'}</p>
        </div>
      )}


      <div className={styles.gridContainer}>
        {Array.from({ length: 25 }, (_, index) => (
          <div
            className={`${styles.cell} ${colorForCell(index)}`}
            key={index}
            onClick={() => handleCellClick(index)}
          >
            {cellOwnership[index] || index + 1}
          </div>
        ))}
      </div>

      <ToastContainer />
    </>
  );
};

export default Grid;
