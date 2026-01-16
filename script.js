let currentWordIndex = 0;
let score = 0;
let streak = 0;
let isRecording = false;
let recognition = null;

const words = [
    { english: "APPLE", russian: "яблоко", transcription: "[ˈæp.əl]" },
    { english: "HOUSE", russian: "дом", transcription: "[haʊs]" },
    { english: "BOOK", russian: "книга", transcription: "[bʊk]" },
    { english: "WATER", russian: "вода", transcription: "[ˈwɔː.tər]" },
    { english: "DOG", russian: "собака", transcription: "[дɒɡ]" }
];

const wordCard = document.getElementById('word-card');
const currentWordElement = document.getElementById('current-word');
const transcriptionElement = document.getElementById('transcription');
const scoreElement = document.getElementById('score');
const streakElement = document.getElementById('streak');
const voiceIndicator = document.getElementById('voice-indicator');
const hintElement = document.getElementById('hint');

function startVoiceRecording() {
    if (isRecording) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Браузер не поддерживает голос");

    recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;

    recognition.onstart = () => {
        isRecording = true;
        voiceIndicator.classList.add('active');
        hintElement.textContent = "СЛУШАЮ...";
    };

    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        checkAnswer(spokenText);
    };

    recognition.onend = () => {
        isRecording = false;
        voiceIndicator.classList.remove('active');
        hintElement.textContent = "Нажми и говори";
        recognition = null; // Очистка для iOS
    };

    recognition.start();
}

function checkAnswer(spokenText) {
    const correct = words[currentWordIndex].russian.toLowerCase();
    
    if (spokenText.includes(correct) || correct.includes(spokenText)) {
        // УСПЕХ
        score += 10;
        streak++;
        wordCard.classList.add('correct-anim');
        document.getElementById('correct-sound').play();
        
        if (streak % 3 === 0) {
            showConfetti();
            document.getElementById('win-sound').play();
        }
    } else {
        // ОШИБКА
        streak = 0;
        wordCard.classList.add('wrong-anim');
        document.getElementById('wrong-sound').play();
    }

    // Обновляем UI и готовим следующее слово
    scoreElement.textContent = score;
    streakElement.textContent = streak;

    setTimeout(() => {
        wordCard.classList.remove('correct-anim', 'wrong-anim');
        nextWord();
    }, 800);
}

function nextWord() {
    currentWordIndex = (currentWordIndex + 1) % words.length;
    currentWordElement.textContent = words[currentWordIndex].english;
    transcriptionElement.textContent = words[currentWordIndex].transcription;
}

// Кнопки
document.getElementById('speak-btn').addEventListener('click', startVoiceRecording);
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
});
