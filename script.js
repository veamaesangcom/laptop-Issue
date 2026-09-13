const questions = [
  { id: "powers_on", text: "Does the laptop power on?" },
  { id: "charger_connected", text: "Is the charger connected?" },
  { id: "battery_light", text: "Does the battery LED light up?" },
  { id: "screen_blank", text: "Is the screen blank?" },
  { id: "fan_loud", text: "Is the fan unusually loud?" },
  { id: "overheating", text: "Does the laptop feel overheated?" },
  { id: "ram_issue", text: "Have you recently changed or upgraded RAM?" },
  { id: "os_starts", text: "Does the operating system start normally?" },
  { id: "blue_screen", text: "Do you see a blue screen error?" },
  { id: "dusty", text: "Has the laptop been used in a dusty environment?" },
  { id: "wifi_issue", text: "Is the Wi-Fi connection failing?" }
];

const rules = [
  {
    name: "Power adapter issue",
    when: { powers_on: "no", charger_connected: "yes", battery_light: "no" },
    conclusion: "Power adapter or charging port problem",
    explanation:
      "The laptop does not turn on even with the charger connected and the battery light is off."
  },
  {
    name: "No charger connected",
    when: { powers_on: "no", charger_connected: "no" },
    conclusion: "Power source issue",
    explanation:
      "The laptop is not starting because no power source is connected."
  },
  {
    name: "Display problem",
    when: { powers_on: "yes", screen_blank: "yes", os_starts: "no" },
    conclusion: "Possible screen or display cable issue",
    explanation:
      "The laptop powers on but the screen remains blank and the system does not start normally."
  },
  {
    name: "Overheating due to dust",
    when: { overheating: "yes", fan_loud: "yes", dusty: "yes" },
    conclusion: "Dust clogging or cooling system issue",
    explanation:
      "The laptop overheats, the fan is loud, and it has been used in a dusty environment."
  },
  {
    name: "Fan failure",
    when: { overheating: "yes", fan_loud: "yes", dusty: "no" },
    conclusion: "Fan or cooling system failure",
    explanation:
      "The system is overheating and the fan is loud even without dust-related symptoms."
  },
  {
    name: "RAM problem",
    when: { powers_on: "yes", screen_blank: "yes", ram_issue: "yes" },
    conclusion: "Possible RAM or motherboard issue",
    explanation:
      "The laptop powers on but stays blank after a recent RAM upgrade or change."
  },
  {
    name: "Windows startup fault",
    when: { os_starts: "no", blue_screen: "yes" },
    conclusion: "Operating system or driver problem",
    explanation:
      "The computer shows a blue screen and does not start normally, often indicating OS or driver issues."
  },
  {
    name: "Network issue",
    when: { wifi_issue: "yes" },
    conclusion: "Wi-Fi connectivity problem",
    explanation:
      "The device is working, but the wireless connection is failing."
  }
];

const state = {
  currentIndex: 0,
  answers: {}
};

const questionScreen = document.getElementById("questionScreen");
const resultScreen = document.getElementById("resultScreen");
const questionBox = document.getElementById("questionBox");
const diagnosisEl = document.getElementById("diagnosis");
const explanationEl = document.getElementById("explanation");
const ruleListEl = document.getElementById("ruleList");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");

function updateProgress() {
  const progress = ((state.currentIndex + 1) / questions.length) * 100;
  progressBar.style.width = `${progress}%`;
  progressText.textContent = `${Math.round(progress)}%`;
}

function renderQuestion() {
  const question = questions[state.currentIndex];
  questionBox.innerHTML = "";

  const text = document.createElement("div");
  text.className = "question-text";
  text.textContent = question.text;

  const options = document.createElement("div");
  options.className = "options";

  ["yes", "no"].forEach((value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-btn " + (value === "yes" ? "" : "secondary");
    button.textContent = value === "yes" ? "Yes" : "No";

    button.addEventListener("click", () => {
      state.answers[question.id] = value;

      if (state.currentIndex < questions.length - 1) {
        state.currentIndex++;
        renderQuestion();
      } else {
        showResults();
      }
    });

    options.appendChild(button);
  });

  questionBox.appendChild(text);
  questionBox.appendChild(options);

  backBtn.disabled = state.currentIndex === 0;
  nextBtn.style.display = "none";
  updateProgress();
  questionScreen.classList.add("active");
  resultScreen.classList.remove("active");
}

function showResults() {
  const matches = [];

  for (const rule of rules) {
    const allMatch = Object.entries(rule.when).every(([key, expected]) => {
      return state.answers[key] === expected;
    });

    if (allMatch) {
      matches.push(rule);
    }
  }

  questionScreen.classList.remove("active");
  resultScreen.classList.add("active");
  progressBar.style.width = "100%";

  if (matches.length === 0) {
    diagnosisEl.textContent = "No matching rule found";
    explanationEl.textContent =
      "The provided answers do not match any known troubleshooting rule. Please consult a technician for a deeper diagnosis.";
    ruleListEl.innerHTML = "";
    return;
  }

  const chosen = matches[0];
  diagnosisEl.textContent = chosen.conclusion;
  explanationEl.textContent = chosen.explanation;

  ruleListEl.innerHTML = "";
  matches.forEach((rule) => {
    const item = document.createElement("li");
    item.textContent = `${rule.name}: ${rule.conclusion}`;
    ruleListEl.appendChild(item);
  });
}

backBtn.addEventListener("click", () => {
  if (state.currentIndex > 0) {
    state.currentIndex--;
    renderQuestion();
  }
});

restartBtn.addEventListener("click", () => {
  state.currentIndex = 0;
  state.answers = {};
  progressBar.style.width = "0%";
  progressText.textContent = "0%";
  renderQuestion();
});

renderQuestion();