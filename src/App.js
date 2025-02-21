import React, { useState, useEffect } from "react";
import { Layout, Menu, Breadcrumb, Table, Input, Button, Progress, Typography, message } from "antd";
import "antd/dist/reset.css";
import "./App.css";

const { Title, Text } = Typography;
const { Header, Content, Footer } = Layout;

// Load sound files
const correctSound = new Audio("/sounds/correct-6033.mp3");
const wrongSound = new Audio("/sounds/wrong-47985.mp3");
const timeoutSound = new Audio("/sounds/timeout-90320.mp3");

function App() {
  const [userName, setUserName] = useState(""); // Added state for user's name
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState("+");
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [difficulty, setDifficulty] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    let timer;
    if (gameStarted && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      handleTimeOut();
    }
    return () => clearTimeout(timer);
  }, [gameStarted, timeLeft]);

  const generateProblem = () => {
    if (questionCount >= 5) {
      setGameStarted(false);
      setScores((prevScores) => [
        ...prevScores.slice(-2),
        { key: Date.now(), user: userName, game: `Game ${prevScores.length + 1}`, score },
      ]);
      return;
    }

    const operators = ["+", "-", "*"];
    if (difficulty !== "easy") {
      operators.push("/");
    }

    const randomOperator = operators[Math.floor(Math.random() * operators.length)];
    let maxNumber = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 50;

    let randomNum1 = Math.floor(Math.random() * maxNumber) + 1;
    let randomNum2 = Math.floor(Math.random() * maxNumber) + 1;

    if (randomOperator === "-") {
      if (randomNum1 < randomNum2) [randomNum1, randomNum2] = [randomNum2, randomNum1];
    } else if (randomOperator === "/") {
      randomNum1 = randomNum1 * randomNum2;
    }

    setNum1(randomNum1);
    setNum2(randomNum2);
    setOperator(randomOperator);
    setUserAnswer("");
    setFeedback("");
    setTimeLeft(10);
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
      message.success("Correct Answer!");
      correctSound.play();
    } else {
      setFeedback(`Incorrect ❌. The correct answer is ${correctAnswer}.`);
      message.error("Wrong Answer! ");
      wrongSound.play();
    }

    setTimeout(() => {
      generateProblem();
    }, 1500);
  };

  const handleTimeOut = () => {
    setFeedback("Time's up ⏳! Moving to the next question.");
    message.warning("Time's up! ");
    timeoutSound.play();

    setTimeout(() => {
      generateProblem();
    }, 1000);
  };

  const handleDifficultySelect = (level) => {
    if (!userName.trim()) {
      message.warning("Please enter your name before starting!");
      return;
    }

    setDifficulty(level);
    setGameStarted(true);
    setQuestionCount(0);
    setScore(0);
    generateProblem();
  };

  return (
    <Layout className="layout">
      <Header className="header">
        <Menu theme="dark" mode="horizontal">
          <Menu.Item key="1">Home</Menu.Item>
          <Menu.Item key="2">Profile</Menu.Item>
          <Menu.Item key="3">Games</Menu.Item>
        </Menu>
      </Header>

      <Content style={{ padding: "20px 50px" }}>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>Math Game</Breadcrumb.Item>
        </Breadcrumb>

        <div className="site-layout-content">
          {!gameStarted ? (
            <>
              <Title level={1}>Welcome to Mathlicious</Title>
              <Input
                size="large"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={{ marginBottom: "10px", width: "50%", textAlign: "center" }}
              />

              <Title level={3}>Select Your Level</Title>

              <div className="button-group">
                <Button type="primary" size="large" onClick={() => handleDifficultySelect("easy")}>
                  Easy
                </Button>
                <Button type="default" size="large" onClick={() => handleDifficultySelect("medium")}>
                  Medium
                </Button>
                <Button type="dashed" size="large" onClick={() => handleDifficultySelect("difficult")}>
                  Difficult
                </Button>
              </div>

              <div className="scores-section">
                <Title level={3}>Last 3 Game Scores</Title>
              </div>
            </>
          ) : (
            <>
              <Title level={1}>Math Game</Title>
              <Title level={2}>Player: {userName}</Title>
              <Title level={2}>⏳ Time Left: {timeLeft}s</Title>

              <Title level={2}>Question {questionCount} / 5</Title>
              <Title level={2}>
                {num1} {operator} {num2} = ?
              </Title>

              <div className="centered-input">
                <Input
                  size="large"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Your answer"
                  style={{ textAlign: "center" }}
                />
              </div>

              <Button type="primary" size="large" onClick={checkAnswer} style={{ marginTop: "10px" }}>
                Submit
              </Button>
              <Text strong>{feedback}</Text>
              <Title level={3}>Score: {score}</Title>
            </>
          )}

          <Table
            columns={[
              { title: "Player", dataIndex: "user", key: "user" },
              { title: "Game", dataIndex: "game", key: "game" },
              { title: "Score", dataIndex: "score", key: "score" },
            ]}
            dataSource={scores}
            pagination={false}
          />

          <h3>Overall Performance</h3>
          <Progress percent={score * 20} status="active" />
        </div>
      </Content>

      <Footer className="footer">Mathlicious ©2025 Created with Ant Design</Footer>
    </Layout>
  );
}

export default App;
