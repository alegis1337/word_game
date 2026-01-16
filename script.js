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

// Переменные игры - ВСЕ ПЕРЕМЕННЫЕ ЗДЕСЬ!
let currentWordIndex = 0;
let score = 0;
let streak = 0;
let isRecording = false;
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
// 4. ПОКАЗАТЬ СЛОВО
// ====================

function showCurrentWord() {
    const word = words[currentWordIndex];
    currentWordElement.textContent = word.english;
    transcriptionElement.textContent = word.transcription;
}

// ====================
// 5. РАСПОЗНАВАНИЕ РЕЧИ (ИСПРАВЛЕНО ДЛЯ IOS)
// ====================

function initRecognition() {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
        return null;
    }
    
    const rec = new SpeechRecognition();
    rec.lang = 'ru-RU';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    // Важно для iOS: continuous должен быть false, чтобы сессия закрывалась сама
    rec.continuous = false; 
    
    rec.onstart = function() {
        console.log("Запись началась");
        isRecording = true;
        if (voiceIndicator) voiceIndicator.classList.add('active');
        if (hintElement) hintElement.textContent = "Говорите сейчас...";
    };
    
    rec.onresult = function(event) {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        console.log("Распознано:", spokenText);
        
        // Сразу останавливаем после получения результата
        rec.stop(); 
        checkAnswer(spokenText);
    };
    
    rec.onerror = function(event) {
        console.log("Ошибка распознавания:", event.error);
        isRecording = false;
        if (voiceIndicator) voiceIndicator.classList.remove('active');
        // Если ошибка "not-allowed", значит нет прав на микрофон
        if (event.error === 'not-allowed') alert("Разрешите доступ к микрофону в настройках Safari");
    };
    
    rec.onend = function() {
        console.log("Запись завершена");
        isRecording = false;
        if (voiceIndicator) voiceIndicator.classList.remove('active');
        // Уничтожаем объект после использования, чтобы создать чистый в следующий раз
        recognition = null; 
    };
    
    return rec;
}

// Запуск записи
function startVoiceRecording() {
    // Если уже идет запись — останавливаем её (повторное нажатие как стоп)
    if (isRecording) {
        if (recognition) recognition.stop();
        return;
    }
    
    // На iOS лучше создавать новый объект при каждом нажатии кнопки
    recognition = initRecognition();
    
    if (!recognition) {
        alert("Ваш браузер не поддерживает распознавание речи. Пожалуйста, используйте Safari на iPhone.");
        return;
    }
    
    try {
        recognition.start();
    } catch (error) {
        console.log("Ошибка при старте:", error);
        // Если объект еще "занят", пробуем сбросить его
        recognition = null;
    }
}

// Кнопка "ГОВОРИТЬ"
speakButton.addEventListener('click', startVoiceRecording);

// ====================
// 6. ПРОВЕРКА ОТВЕТА
// ====================

function checkAnswer(spokenText) {
    const currentWord = words[currentWordIndex];
    const correctAnswer = currentWord.russian.toLowerCase();
    
    resultElement.classList.remove('hidden');
    
    if (spokenText.includes(correctAnswer) || correctAnswer.includes(spokenText)) {
        // Правильно
        resultIcon.className = 'fas fa-check-circle';
        resultText.textContent = 'Правильно! +10';
        resultText.style.color = '#4CAF50';
        correctAnswerElement.textContent = '';
        
        score += 10;
        scoreElement.textContent = score;
        
        streak++;
        streakElement.textContent = streak;
        
        if (streak % 3 === 0) {
            resultText.textContent = `СЕРИЯ ${streak}! +30`;
            score += 20;
            scoreElement.textContent = score;
            showConfetti();
            playSound(winSound);
        } else {
            playSound(correctSound);
        }
        
        setTimeout(nextWord, 1500);
    } else {
        // Неправильно
        resultIcon.className = 'fas fa-times-circle';
        resultText.textContent = 'Не совсем...';
        resultText.style.color = '#FF416C';
        correctAnswerElement.textContent = `Правильно: ${correctAnswer}`;
        
        streak = 0;
        streakElement.textContent = streak;
        
        playSound(wrongSound);
        
        setTimeout(nextWord, 2000);
    }
}

// Следующее слово
function nextWord() {
    currentWordIndex = (currentWordIndex + 1) % words.length;
    showCurrentWord();
    resultElement.classList.add('hidden');
    if (hintElement) hintElement.textContent = "Нажмите 'ГОВОРИТЬ' и скажите перевод";
}

// Воспроизвести звук
function playSound(soundElement) {
    try {
        soundElement.currentTime = 0;
        soundElement.play();
    } catch (e) {
        console.log("Звук не воспроизводится");
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
    for (let i = 0; i < 80; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 4,
            speed: Math.random() * 2 + 1,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`
        });
    }
    
    let animationId;
    
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
        
        animationId = requestAnimationFrame(draw);
    }
    
    draw();
    
    setTimeout(() => {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 3000);
}

// ====================
// 8. ДРУГИЕ КНОПКИ
// ====================

skipButton.addEventListener('click', nextWord);

hintButton.addEventListener('click', function() {
    const word = words[currentWordIndex];
    if (hintElement) {
        hintElement.textContent = `Подсказка: начинается на "${word.russian[0]}"`;
        setTimeout(() => {
            if (hintElement) hintElement.textContent = "Нажмите 'ГОВОРИТЬ' и скажите перевод";
        }, 3000);
    }
});

restartButton.addEventListener('click', function() {
    score = 0;
    streak = 0;
    currentWordIndex = 0;
    if (scoreElement) scoreElement.textContent = score;
    if (streakElement) streakElement.textContent = streak;
    showCurrentWord();
    if (resultElement) resultElement.classList.add('hidden');
});

// ====================
// 9. ЗАПУСК
// ====================

window.addEventListener('load', function() {
    showCurrentWord();
    console.log("Игра готова к работе!");
});

