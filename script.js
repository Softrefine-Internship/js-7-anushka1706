//
"use strict";

const categoryMap = {
  general: 9,
  books: 10,
  film: 11,
  music: 12,
  musicals: 13,
  tv: 14,
  "video-games": 15,
  "board-games": 16,
  "science-nature": 17,
  "science-computers": 18,
  "science-math": 19,
  mythology: 20,
  sports: 21,
  geography: 22,
  history: 23,
};

const form = document.querySelector(".quiz-form");
const API = "https://opentdb.com/api.php";
let fetchedQuestions;
const state = {
  userAnswers: [],
};
const resultTop = document.querySelector(".result-top");
let currentIndex = 0;
const quizResult = document.querySelector(".quiz-result");
const nextBtn = document.querySelector(".next-question");
const exitBtn = document.querySelector(".exit-quiz");
const currentQuestion = document.querySelector(".currentQuestion");
const topicName = document.querySelector(".topic-name");
const score = document.querySelector(".scores");
const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");
const progressLabel = document.querySelector(".progress-label");
const questionConfig = document.querySelector(".question-configuration");
const questionElement = document.querySelector(".question");
const allOptions = document.querySelector(".all-options");
const playQuiz = document.querySelector(".play-quiz");
let type;
const playBtns = document.querySelector(".play-btns");
let currentScore = 0;
function submitAction(event) {
  event.preventDefault();

  const topic = document.getElementById("topic").value;
  const numQuestions = document.querySelector(".total-questions input").value;
  const difficulty = document.getElementById("difficulty").value;
  let quizType = document.querySelector("input[name='type']:checked").value;

  let errors = [];

  if (!topic) {
    errors.push("Please select a topic.");
  }

  if (!difficulty) {
    errors.push("Please select a difficulty level.");
  }

  if (
    !numQuestions ||
    numQuestions <= 0 ||
    numQuestions > 50 ||
    !Number.isInteger(Number(numQuestions))
  ) {
    errors.push("Please enter a valid number of questions.");
  }

  if (errors.length > 0) {
    alert(errors.join("\n"));
    return;
  }

  const api_request = `${API}?amount=${numQuestions}&category=${categoryMap[topic]}&difficulty=${difficulty}&type=${quizType}`;
  fetchQuestions(api_request);
}

async function fetchQuestions(api) {
  console.log(123);
  questionConfig.classList.add("hide");
  progressContainer.style.display = "flex";
  updateProgress(1);
  progressLabel.innerHTML = "Initializing quiz setup...";
  await new Promise((resolve) => setTimeout(resolve, 500));

  updateProgress(10);
  progressLabel.innerHTML = "Connecting to the quiz server...";
  await new Promise((resolve) => setTimeout(resolve, 500));

  updateProgress(30);
  progressLabel.innerHTML = "Preparing to fetch questions...";
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    let response = await fetch(api);
    updateProgress(60);
    progressLabel.innerHTML = "Receiving data from server...";
    await new Promise((resolve) => setTimeout(resolve, 500));

    let data = await response.json();
    updateProgress(100);

    if (data.response_code === 0) {
      progressLabel.innerHTML = "Quiz ready! Start your game.";
      await new Promise((resolve) => setTimeout(resolve, 500));

      progressContainer.style.display = "none";
      questionConfig.style.display = "none";
      fetchedQuestions = data.results;
      displayQuestions(fetchedQuestions);
    } else {
      progressLabel.innerHTML = "No questions found. Try different settings.";
      progressContainer.style.display = "none";
      questionConfig.classList.remove("hide");
      console.error("API Error: No results found.", data.response_code);
      alert("No quiz questions found. Try changing the settings.");
    }
  } catch (error) {
    updateProgress(100);
    progressLabel.innerHTML = "Failed to fetch questions. Please retry.";
    console.error("Error fetching quiz:", error);
    alert("Failed to load quiz. Please try again.");
    progressContainer.style.display = "none";
    questionConfig.classList.remove("hide");
  }
}

function updateProgress(value) {
  let progress = 0;
  progress = value;
  progressBar.style.width = progress + "%";
  progressBar.innerText = progress + "%";
}

function setupEventListeners() {
  document.addEventListener("DOMContentLoaded", () => {
    form.addEventListener("submit", submitAction);
  });
}
function displayQuestions(data, index = 0) {
  switchView("playQuiz");
  topicName.textContent = data[index].category;
  type = data[0].difficulty;
  currentQuestion.textContent = `${index + 1} / ${data.length}`;
  questionElement.textContent = `Q : ${decodeHtml(data[index].question)}`;
  const correctAnswer = decodeHtml(data[index].correct_answer);
  const firstOptions = [correctAnswer, ...data[index].incorrect_answers];
  firstOptions.sort(() => Math.random() - 0.5);

  if (!state.userAnswers[index]) {
    state.userAnswers[index] = {
      question: decodeHtml(data[index].question),
      userAnswer: "Not answered",
      correctAnswer: correctAnswer,
      isCorrect: false,
    };
  }

  allOptions.innerHTML = "";

  firstOptions.forEach((option, i) => {
    const optionWrapper = document.createElement("div");
    optionWrapper.className = "option-wrapper";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "quizOption";
    input.value = option;
    input.className = "radio-play";
    input.id = `option${i}-${index}`;
    const label = document.createElement("label");
    label.htmlFor = `option${i}-${index}`;
    label.className = "options";
    label.innerHTML = `<p class="option-value">${i + 1}) ${option}</p>`;

    optionWrapper.appendChild(input);
    optionWrapper.appendChild(label);
    allOptions.appendChild(optionWrapper);

    input.disabled = false;
    label.style.backgroundColor = "";

    input.addEventListener("change", (event) => {
      console.log("Option selected:", event.target.value);
      document.querySelectorAll(".radio-play").forEach((btn) => {
        btn.disabled = true;
      });

      if (event.target.value === correctAnswer) {
        console.log("Correct answer selected!");
        label.style.backgroundColor = "lightgreen";
        updateScores(index);
      } else {
        console.log("Incorrect answer selected!");
        label.style.backgroundColor = "lightcoral";
        document.querySelector(
          `input[value="${correctAnswer}"]`
        ).nextElementSibling.style.backgroundColor = "lightgreen";
      }
      const userAnswer = event.target.value;
      const isCorrect = userAnswer === correctAnswer;
      state.userAnswers[index] = {
        question: data[index].question,
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
      };
    });
  });
}
function decodeHtml(html) {
  console.log("decode");
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}
function updateScores(index) {
  console.log("score");
  switch (fetchedQuestions[index].difficulty) {
    case "hard":
      currentScore += 15;
      break;

    case "medium":
      currentScore += 10;
      break;

    case "easy":
      currentScore += 5;
      break;
  }
  const scoreIcon = document.querySelector(".score-icon");
  scoreIcon.classList.add("bounce");
  setTimeout(() => {
    scoreIcon.classList.remove("bounce");
  }, 500);
  score.textContent = currentScore;
}
nextBtn.addEventListener("click", () => {
  console.log(currentIndex, fetchedQuestions.length);

  if (currentIndex < fetchedQuestions.length - 1) {
    currentIndex += 1;
    displayQuestions(fetchedQuestions, currentIndex);
  }

  if (currentIndex === fetchedQuestions.length - 1) {
    exitBtn.style.display = "none";
    nextBtn.style.display = "none";

    let resultBtn = document.querySelector(".last-question");
    if (!resultBtn) {
      resultBtn = document.createElement("button");
      resultBtn.className = "last-question";
      resultBtn.textContent = "See Result";
      playBtns.appendChild(resultBtn);
      resultBtn.addEventListener("click", () => {
        switchView("quizResult");
        updateBadge();
      });
    }
    resultBtn.style.display = "block";
  }
});

exitBtn.addEventListener("click", function () {
  updateBadge();
  switchView("quizResult");
});
function updateScores(index) {
  switch (fetchedQuestions[index].difficulty) {
    case "hard":
      currentScore += 15;
      break;
    case "medium":
      currentScore += 10;
      break;
    case "easy":
      currentScore += 5;
      break;
  }

  const scoreIcon = document.querySelector(".score-icon");
  scoreIcon.classList.add("bounce");
  setTimeout(() => {
    scoreIcon.classList.remove("bounce");
  }, 500);

  score.textContent = currentScore;
}
function getTitle() {
  let maxScorePerQuestion;
  console.log(type);
  switch (type) {
    case "hard":
      maxScorePerQuestion = 15;
      break;
    case "medium":
      maxScorePerQuestion = 10;
      break;
    case "easy":
      maxScorePerQuestion = 5;
      break;
  }

  let totalScore = maxScorePerQuestion * fetchedQuestions.length;
  let percent = (currentScore / totalScore) * 100;

  const resultScore = document.querySelector(".result-score");
  resultScore.textContent = `${currentScore} / ${totalScore}`;
  if (percent >= 90) return "Champion";
  if (percent >= 80) return "Mastermind";
  if (percent >= 70) return "Knowledge Seeker";
  if (percent >= 40) return "Rising Learner";
  if (percent >= 20) return "Beigning Explorer";
  if (percent >= 0) return "Aspiring Learner";
}

function updateBadge() {
  const newQuiz = document.querySelector(".new-quiz");

  newQuiz.addEventListener("click", () => {
    switchView("questionConfig");
    questionConfig.classList.remove("hide");
    resetQuizForm();
  });

  const title = document.querySelector(".score-title");
  title.textContent = getTitle();

  document.querySelectorAll(".badge-container div").forEach((div) => {
    div.style.display = "none";
  });

  document.querySelector(
    `.${title.textContent.toLowerCase().replace(" ", "-")}`
  ).style.display = "block";
  const summaryList = document.querySelector(".allAnswers");
  summaryList.innerHTML = "";

  fetchedQuestions.forEach((question, id) => {
    if (!state.userAnswers[id]) {
      state.userAnswers[id] = {
        question: question.question,
        userAnswer: "Not answered",
        correctAnswer: question.correct_answer,
        isCorrect: false,
      };
    }
    const answer = state.userAnswers[id];
    const questionDiv = document.createElement("div");
    questionDiv.className = "summary-question";
    questionDiv.innerHTML = `<p>Question ${id + 1}: ${answer.question}</p>`;

    const userAnswerDiv = document.createElement("p");
    userAnswerDiv.className = "user-answer";
    userAnswerDiv.innerHTML = `Your Answer: ${answer.userAnswer}`;
    if (answer.isCorrect) {
      userAnswerDiv.style.color = "green";
    } else {
      userAnswerDiv.style.color = "#fa5252";
    }

    const correctAnswerDiv = document.createElement("p");
    correctAnswerDiv.className = "correct-answer";
    correctAnswerDiv.innerHTML = `<strong>Correct Answer:</strong> ${answer.correctAnswer}`;
    correctAnswerDiv.style.color = "green";

    questionDiv.appendChild(userAnswerDiv);
    questionDiv.appendChild(correctAnswerDiv);
    summaryList.appendChild(questionDiv);
  });
}

function switchView(view) {
  quizResult.style.display = "none";
  playQuiz.style.display = "none";
  questionConfig.style.display = "none";
  switch (view) {
    case "quizResult":
      quizResult.style.display = "flex";
      break;
    case "playQuiz":
      playQuiz.style.display = "flex";
      break;
    case "questionConfig":
      questionConfig.style.display = "flex";
      break;
    default:
      console.error("Invalid view specified:", view);
  }
}
function resetQuizForm() {
  form.reset();

  currentScore = 0;
  currentIndex = 0;
  state.userAnswers = [];
  fetchedQuestions = null;

  score.textContent = "0";
  allOptions.innerHTML = "";
  questionElement.textContent = "";
  topicName.textContent = "";
  currentQuestion.textContent = "";
  exitBtn.style.display = "block";
  nextBtn.style.display = "block";
  const resultBtn = document.querySelector(".last-question");
  if (resultBtn) resultBtn.style.display = "none";
  const title = document.querySelector(".score-title");
  console.log(title, "555");
  document.querySelector(
    `.${title.textContent.trim().toLowerCase().replace(" ", "-")}`
  ).style.display = "none";
}

setupEventListeners();
