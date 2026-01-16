// Переменные игры
let currentWordIndex = 0;
let score = 0;
let streak = 0;
let isRecording = false;
let recognition = null; // Будем создавать при каждом нажатии

const words = [
    { english: "APPLE", russian: "яблоко", transcription: "[ˈæp.əl]" },
    { english: "HOUSE", russian: "дом", transcription: "[haʊs]" },
    { english: "BOOK", russian: "книга", transcription: "[bʊk]" },
    { english: "WATER", russian: "вода", transcription: "[ˈwɔː.tər]" },
    { english: "DOG", russian: "собака", transcription: "[дɒɡ]" },
    { english: "CAT", russian: "кошка", transcription: "[kæt]" },
    { english: "SUN", russian: "солнце", transcription: "[sʌn]" },
    { english: "MOON", russian: "луна", transcription: "[muːn]" },
    { english: "TREE", russian: "дерево", transcription: "[triː]" },
    { english: "CAR", russian: "машина", transcription: "[kɑːr]" }
];

// Элементы (те же, что у тебя в HTML)
const currentWordElement = document.getElementById('current-word');
const transcriptionElement = document.getElementById('transcription');
const scoreElement = document.getElementById('score');
const streakElement = document.getElementById('streak');
const voiceIndicator = document.getElementById('voice-indicator');
const speakButton = document.getElementById('speak-btn');
const resultElement = document.getElementById('result');
const hintElement = document.getElementById('hint');

// Инициализация распознавания (создаем новый объект каждый раз для iOS)
function startVoiceRecording() {
    if (isRecording) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Safari/Chrome не поддерживается на этом устройстве");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.continuous = false; // Важно для iPhone

    recognition.onstart = () => {
        isRecording = true;
        voiceIndicator.classList.add('active');
        hintElement.textContent = "Слушаю...";
    };

    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        console.log("Сказано:", spokenText);
        checkAnswer(spokenText);
    };

    recognition.onerror = (err) => {
        console.error("Ошибка:", err.error);
        stopRecordingUI();
    };

    recognition.onend = () => {
        stopRecordingUI();
    };

    try {
        recognition.start();
    } catch (e) {
        console.log("Ошибка старта:", e);
    }
}

function stopRecordingUI() {
    isRecording = false;
    voiceIndicator.classList.remove('active');
    hintElement.textContent = "Нажми и говори";
}

function checkAnswer(spokenText) {
    const currentWord = words[currentWordIndex];
    const correctAnswer = currentWord.russian.toLowerCase();

    // Логика проверки (содержит ли сказанное правильное слово)
    if (spokenText.includes(correctAnswer) || correctAnswer.includes(spokenText)) {
        handleCorrect();
    } else {
        handleWrong(correctAnswer);
    }
}

function handleCorrect() {
    score += 10;
    streak++;
    updateUI();
    
    // Визуальный эффект успеха
    currentWordElement.style.color = "#4CAF50";
    currentWordElement.classList.add('success-pop');
    
    if (streak % 3 === 0) {
        showConfetti();
        document.getElementById('win-sound').play().catch(e => {});
    } else {
        document.getElementById('correct-sound').play().catch(e => {});
    }

    setTimeout(() => {
        currentWordElement.style.color = "";
        currentWordElement.classList.remove('success-pop');
        nextWord();
    }, 1000);
}

function handleWrong(correct) {
    streak = 0;
    updateUI();
    currentWordElement.classList.add('shake');
    document.getElementById('wrong-sound').play().catch(e => {});
    
    setTimeout(() => {
        currentWordElement.classList.remove('shake');
        nextWord();
    }, 1200);
}

function nextWord() {
    currentWordIndex = (currentWordIndex + 1) % words.length;
    showCurrentWord();
}

function showCurrentWord() {
    const word = words[currentWordIndex];
    currentWordElement.textContent = word.english;
    transcriptionElement.textContent = word.transcription;
}

function updateUI() {
    scoreElement.textContent = score;
    streakElement.textContent = streak;
}

// Привязка кнопок
speakButton.addEventListener('click', startVoiceRecording);
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    showCurrentWord();
});
