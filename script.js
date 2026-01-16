// ====================
// 1. НАСТРОЙКА И ПЕРЕМЕННЫЕ
// ====================

// Наши слова для игры
const words = [
    { english: "APPLE", russian: "яблоко", transcription: "[ˈæp.əl]" },
    { english: "HOUSE", russian: "дом", transcription: "[haʊs]" },
    { english: "BOOK", russian: "книга", transcription: "[bʊk]" },
    { english: "WATER", russian: "вода", transcription: "[ˈwɔː.tər]" },
    { english: "DOG", russian: "собака", transcription: "[dɒɡ]" }
];

// Переменные игры
let currentWordIndex = 0;
let score = 0;
let streak = 0;
let isRecording = false; // ТОЛЬКО ОДИН РАЗ ЗДЕСЬ!
let recognition = null;

// ====================
// 2. ПОЛУЧАЕМ ЭЛЕМЕНТЫ СТРАНИЦЫ
// ====================

// Экраны
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');

// Элементы игры
const currentWordElement = document.getElementById('current-word');
const transcriptionElement = document.getElementById('transcription');
const scoreElement = document.getElementById('score');
const streakElement = document.getElementById('streak');
const voiceIndicator = document.getElementById('voice-indicator');
const speakButton = document.getElementById('speak-btn');
const resultElement = document.getElementById('result');
const resultIcon = document.getElementById('result-icon');
const resultText = document.getElementById('result-text');
const correctAnswerElement = document.getElementById('correct-answer');
const hintElement = document.getElementById('hint');

// Кнопки
const startButton = document.getElementById('start-btn');
const skipButton = document.getElementById('skip-btn');
const hintButton = document.getElementById('hint-btn');
const restartButton = document.getElementById('restart-btn');

// Звуки
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');
const winSound = document.getElementById('win-sound');

// ====================
// 3. КНОПКА "НАЧАТЬ ИГРУ"
// ====================

startButton.addEventListener('click', function() {
    console.log("Игра начинается!");
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    showCurrentWord();
});

// ====================
// 4. РАСПОЗНАВАНИЕ РЕЧИ (ИСПРАВЛЕННАЯ ВЕРСИЯ)
// ====================

// Инициализация распознавания речи
function initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        console.warn("Браузер не поддерживает распознавание речи");
        return false;
    }
    
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    recognition = new SpeechRecognition();
    
    // Настройки
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    // События
    recognition.onstart = function() {
        console.log("Начало записи");
        isRecording = true;
        if (voiceIndicator) voiceIndicator.classList.add('active');
        if (hintElement) hintElement.textContent = "Говорите сейчас...";
    };
    
    recognition.onresult = function(event) {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        console.log("Вы сказали:", spokenText);
        checkAnswer(spokenText);
    };
    
    recognition.onerror = function(event) {
        console.log("Ошибка:", event.error);
        isRecording = false;
        if (voiceIndicator) voiceIndicator.classList.remove('active');
        if (hintElement) hintElement.textContent = "Ошибка. Нажмите 'ГОВОРИТЬ' снова";
    };
    
    recognition.onend = function() {
        console.log("Запись завершена");
        isRecording = false;
        if (voiceIndicator) voiceIndicator.classList.remove('active');
        // Не меняем hint здесь - он меняется в checkAnswer
    };
    
    return true;
}

// Запуск распознавания
function startRecording() {
    if (isRecording) {
        console.log("Уже записываем");
        return;
    }
    
    // Инициализируем при первом запуске
    if (!recognition) {
        if (!initSpeechRecognition()) {
            alert("Используйте Safari на iOS для лучшей работы");
            return;
        }
    }
    
    try {
        recognition.start();
    } catch (error) {
        console.log("Ошибка при старте:", error);
        // Пробуем перезапустить
        setTimeout(() => {
            recognition.stop();
            setTimeout(() => {
                recognition.start();
            }, 300);
        }, 100);
    }
}

// Кнопка "ГОВОРИТЬ"
speakButton.addEventListener('click', startRecording);

// ====================
// 5. ПРОВЕРКА ОТВЕТА
// ====================

function checkAnswer(spokenText) {
    const currentWord = words[currentWordIndex];
    const correctAnswer = currentWord.russian.toLowerCase();
    
    // Показываем результат
    resultElement.classList.remove('hidden');
    
    // Простая проверка
    if (spokenText.includes(correctAnswer) || correctAnswer.includes(spokenText)) {
        handleCorrectAnswer();
    } else {
        handleWrongAnswer(correctAnswer);
    }
}

function handleCorrectAnswer() {
    // Иконка и текст
    resultIcon.className = 'fas fa-check-circle';
    resultText.textContent = `Правильно! +10 очков`;
    resultText.style.color = '#4CAF50';
    correctAnswerElement.textContent = '';
    
    // Счёт
    score += 10;
    scoreElement.textContent = score;
    
    // Серия
    streak++;
    streakElement.textContent = streak;
    
    // Бонус за серию
    if (streak % 3 === 0) {
        resultText.textContent = `СЕРИЯ ${streak}! +30 очков`;
        score += 20;
        scoreElement.textContent = score;
        showConfetti();
        playSound(winSound);
    } else {
        playSound(correctSound);
    }
    
    // Следующее слово через 1.5 сек
    setTimeout(nextWord, 1500);
}

function handleWrongAnswer(correctAnswer) {
    // Иконка и текст
    resultIcon.className = 'fas fa-times-circle';
    resultText.textContent = 'Не совсем...';
    resultText.style.color = '#FF416C';
    correctAnswerElement.textContent = `Правильно: ${correctAnswer}`;
    
    // Сброс серии
    streak = 0;
    streakElement.textContent = streak;
    
    // Звук ошибки
    playSound(wrongSound);
    
    // Следующее слово через 2 сек
    setTimeout(nextWord, 2000);
}

// ====================
// 6. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ====================

function nextWord() {
    currentWordIndex = (currentWordIndex + 1) % words.length;
    showCurrentWord();
    resultElement.classList.add('hidden');
    hintElement.textContent = "Нажмите 'ГОВОРИТЬ' и скажите перевод";
}

function showCurrentWord() {
    const word = words[currentWordIndex];
    currentWordElement.textContent = word.english;
    transcriptionElement.textContent = word.transcription;
}

function playSound(soundElement) {
    try {
        soundElement.currentTime = 0;
        soundElement.play();
    } catch (e) {
        console.log("Ошибка звука (игнорируем):", e);
    }
}

// ====================
// 7. КОНФЕТТИ
// ====================

function showConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 10 + 5,
            speed: Math.random() * 3 + 1,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`
        });
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let p of particles) {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            p.y += p.speed;
            
            if (p.y > canvas.height) {
                p.y = -10;
                p.x = Math.random() * canvas.width;
            }
        }
        
        requestAnimationFrame(draw);
        setTimeout(() => {
            cancelAnimationFrame(draw);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 3000);
    }
    
    draw();
}

// ====================
// 8. ДРУГИЕ КНОПКИ
// ====================

skipButton.addEventListener('click', nextWord);

hintButton.addEventListener('click', function() {
    const word = words[currentWordIndex];
    hintElement.textContent = `Начинается на "${word.russian[0]}"`;
    setTimeout(() => {
        hintElement.textContent = "Нажмите 'ГОВОРИТЬ' и скажите перевод";
    }, 3000);
});

restartButton.addEventListener('click', function() {
    score = 0;
    streak = 0;
    currentWordIndex = 0;
    scoreElement.textContent = score;
    streakElement.textContent = streak;
    showCurrentWord();
    resultElement.classList.add('hidden');
});

// ====================
// 9. ЗАПУСК
// ====================

// Инициализация при загрузке
window.addEventListener('load', function() {
    showCurrentWord();
    console.log("Игра готова!");
});
