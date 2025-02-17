import React, { useState, useEffect } from "react";
import "./App.css";
import backgroundImage from "./assets/bkg.jpg"; // Import background image

function App() {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState("+");
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [difficulty, setDifficulty] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10); // Timer set to 10 seconds

  useEffect(() => {
    let timer;
    if (gameStarted && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimeOut();
    }
    return () => clearTimeout(timer);
  }, [gameStarted, timeLeft]);

  const playSound = (type) => {
    const sounds = {
      correct: new Audio("/sounds/correct-6033.mp3"),
      wrong: new Audio("/sounds/wrong-47985.mp3"),
      timeout: new Audio("/sounds/timeout-90320.mp3"),
    };

    if (sounds[type]) {
      sounds[type].play();
    }
  };

  const generateProblem = () => {
    if (questionCount >= 5) {
      setGameStarted(false); // End the round after 5 questions
      return;
    }

    const operators = ["+", "-", "*"];
    if (difficulty !== "easy") {
      operators.push("/"); // Include division only for medium & difficult levels
    }
    
    const randomOperator = operators[Math.floor(Math.random() * operators.length)];

    let maxNumber;
    switch (difficulty) {
      case "easy":
        maxNumber = 10;
        break;
      case "medium":
        maxNumber = 20;
        break;
      case "difficult":
        maxNumber = 50;
        break;
      default:
        maxNumber = 10;
    }

    let randomNum1 = Math.floor(Math.random() * maxNumber) + 1;
    let randomNum2 = Math.floor(Math.random() * maxNumber) + 1;

    if (randomOperator === "-") {
      // Ensure num1 is always greater than num2 for easy subtraction
      if (randomNum1 < randomNum2) {
        [randomNum1, randomNum2] = [randomNum2, randomNum1];
      }
    } else if (randomOperator === "/") {
      // Ensure division results in whole numbers
      randomNum1 = randomNum1 * randomNum2;
    }

    setNum1(randomNum1);
    setNum2(randomNum2);
    setOperator(randomOperator);
    setUserAnswer("");
    setFeedback("");
    setTimeLeft(10); // Reset timer for each question
    setQuestionCount(questionCount + 1);
  };

  const checkAnswer = () => {
    let correctAnswer;
    switch (operator) {
      case "+":
        correctAnswer = num1 + num2;
        break;
      case "-":
        correctAnswer = num1 - num2;
        break;
      case "*":
        correctAnswer = num1 * num2;
        break;
      case "/":
        correctAnswer = (num1 / num2).toFixed(2);
        break;
      default:
        correctAnswer = 0;
    }

    if (parseFloat(userAnswer) === parseFloat(correctAnswer)) {
      setScore(score + 1);
      setFeedback("Correct! 🎉");
      playSound("correct"); // Play correct answer sound
    } else {
      setFeedback(`Incorrect. The correct answer is ${correctAnswer}.`);
      playSound("wrong"); // Play wrong answer sound
    }

    setTimeout(() => {
      generateProblem();
    }, 1500);
  };

  const handleTimeOut = () => {
    setFeedback("Time's up! Moving to the next question.");
    playSound("timeout"); // Play timeout sound

    setTimeout(() => {
      generateProblem();
    }, 1000);
  };

  const handleInputChange = (e) => {
    setUserAnswer(e.target.value);
  };

  const handleDifficultySelect = (level) => {
    setDifficulty(level);
    setGameStarted(true);
    setQuestionCount(0); // Reset question count
    setScore(0); // Reset score
    generateProblem();
  };

  if (!gameStarted) {
    return (
      <div className="App">
        <h1>Welcome to the Math Game</h1>
        <h2>Let's Start!</h2>
        <h3>Select Your Level</h3>
        <button onClick={() => handleDifficultySelect("easy")}>Easy</button>
        <button onClick={() => handleDifficultySelect("medium")}>Medium</button>
        <button onClick={() => handleDifficultySelect("difficult")}>Difficult</button>
        {questionCount >= 5 && <h2>Game Over! Your score: {score}/5</h2>}
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Math Game</h1>
      <h2>Time Left: {timeLeft}s</h2>
      <h2>Question {questionCount} / 5</h2>
      <h2>
        {num1} {operator} {num2} = ?
      </h2>
      <input type="text" value={userAnswer} onChange={handleInputChange} placeholder="Your answer" />
      <button onClick={checkAnswer}>Submit</button>
      <p>{feedback}</p>
      <h3>Score: {score}</h3>
    </div>
  );
}

export default App;
