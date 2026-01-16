// ====================
// 1. НАСТРОЙКА И ПЕРЕМЕННЫЕ
// ====================

// Наши слова для игры (слово на английском, перевод на русском, транскрипция)
const words = [
    { english: "APPLE", russian: "яблоко", transcription: "[ˈæp.əl]" },
    { english: "HOUSE", russian: "дом", transcription: "[haʊs]" },
    { english: "BOOK", russian: "книга", transcription: "[bʊk]" },
    { english: "WATER", russian: "вода", transcription: "[ˈwɔː.tər]" },
    { english: "DOG", russian: "собака", transcription: "[dɒɡ]" },
    { english: "CAT", russian: "кошка", transcription: "[kæt]" },
    { english: "SUN", russian: "солнце", transcription: "[sʌn]" },
    { english: "MOON", russian: "луна", transcription: "[muːn]" },
    { english: "TREE", russian: "дерево", transcription: "[triː]" },
    { english: "CAR", russian: "машина", transcription: "[kɑːr]" }
];

// Переменные игры
let currentWordIndex = 0;
let score = 0;
let streak = 0;
let isRecording = false;

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
// 3. НАСТРОЙКА РАСПОЗНАВАНИЯ РЕЧИ ДЛЯ iOS
// ====================

let recognition;
let isRecording = false;
let recognitionTimeout;

// Инициализируем распознавание
function initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        console.log("Распознавание речи не поддерживается");
        if (hintElement) {
            hintElement.textContent = "Используйте Chrome на Android или Safari на Mac";
        }
        return false;
    }
    
    const SpeechRecognition = window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    // НАСТРОЙКИ ДЛЯ iOS:
    recognition.continuous = false; // Важно: false для iOS
    recognition.interimResults = false;
    recognition.lang = 'ru-RU';
    recognition.maxAlternatives = 1;
    
    // События
    recognition.onstart = function() {
        console.log("Микрофон включен");
        isRecording = true;
        if (voiceIndicator) voiceIndicator.classList.add('active');
        if (hintElement) hintElement.textContent = "Говорите сейчас...";
        
        // Таймаут для iOS (на случай зависания)
        clearTimeout(recognitionTimeout);
        recognitionTimeout = setTimeout(() => {
            if (isRecording) {
                console.log("Таймаут распознавания");
                recognition.stop();
            }
        }, 5000); // 5 секунд максимум
    };
    
    recognition.onresult = function(event) {
        if (event.results[0].isFinal) {
            const spokenText = event.results[0][0].transcript.toLowerCase();
            console.log("Вы сказали:", spokenText);
            checkAnswer(spokenText);
        }
    };
    
    recognition.onerror = function(event) {
        console.log("Ошибка распознавания:", event.error);
        isRecording = false;
        if (voiceIndicator) voiceIndicator.classList.remove('active');
        if (hintElement) hintElement.textContent = "Ошибка. Попробуйте ещё раз";
        
        // Автоматический перезапуск при некоторых ошибках
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
            setTimeout(() => {
                if (!isRecording) {
                    hintElement.textContent = "Скажите громче...";
                }
            }, 1000);
        }
    };
    
    recognition.onend = function() {
        console.log("Микрофон выключен (onend)");
        isRecording = false;
        clearTimeout(recognitionTimeout);
        
        if (voiceIndicator) voiceIndicator.classList.remove('active');
        
        // НЕ меняем текст сразу - он изменится после проверки ответа
    };
    
    return true;
}

// Функция запуска распознавания
function startRecognition() {
    if (isRecording) {
        console.log("Уже записывается");
        return;
    }
    
    if (!recognition) {
        if (!initSpeechRecognition()) {
            alert("Распознавание речи не поддерживается в этом браузере");
            return;
        }
    }
    
    try {
        recognition.start();
        console.log("Запуск распознавания...");
    } catch (e) {
        console.log("Ошибка при старте:", e);
        
        // Попытка переинициализации
        if (e.message && e.message.includes('already started')) {
            setTimeout(() => {
                recognition.stop();
                setTimeout(() => {
                    recognition.start();
                }, 300);
            }, 100);
        }
    }
}

// ====================
// 4. ОБНОВЛЁННАЯ КНОПКА "ГОВОРИТЬ"
// ====================

if (speakButton) {
    speakButton.addEventListener('click', function() {
        startRecognition();
    });
}
    
    // ====================
    // 4. ОБРАБОТЧИКИ СОБЫТИЙ ДЛЯ РАСПОЗНАВАНИЯ
    // ====================
    
    // Когда началась запись
    recognition.onstart = function() {
        console.log("Начинаю слушать...");
        isRecording = true;
        voiceIndicator.classList.add('active');
        hintElement.textContent = "Говорите сейчас...";
    };
    
    // Когда запись закончилась
    recognition.onend = function() {
        console.log("Запись завершена");
        isRecording = false;
        voiceIndicator.classList.remove('active');
        hintElement.textContent = "Нажмите кнопку и произнесите перевод";
    };
    
    // Когда получен результат
    recognition.onresult = function(event) {
        // Получаем сказанный текст
        const spokenText = event.results[0][0].transcript.toLowerCase();
        console.log("Вы сказали: " + spokenText);
        
        // Проверяем, правильный ли ответ
        checkAnswer(spokenText);
    };
    
    // Если произошла ошибка
    recognition.onerror = function(event) {
        console.log("Ошибка распознавания: " + event.error);
        isRecording = false;
        voiceIndicator.classList.remove('active');
        hintElement.textContent = "Ошибка микрофона. Попробуйте ещё раз";
    };
    
    // ====================
    // 5. ФУНКЦИЯ ПРОВЕРКИ ОТВЕТА
    // ====================
    function checkAnswer(spokenText) {
        const currentWord = words[currentWordIndex];
        const correctAnswer = currentWord.russian.toLowerCase();
        
        // Показываем элемент с результатом
        resultElement.classList.remove('hidden');
        
        // Проверяем ответ (допускаем небольшие погрешности)
        if (spokenText.includes(correctAnswer) || correctAnswer.includes(spokenText)) {
            // ПРАВИЛЬНЫЙ ОТВЕТ
            handleCorrectAnswer();
        } else {
            // НЕПРАВИЛЬНЫЙ ОТВЕТ
            handleWrongAnswer(correctAnswer);
        }
    }
    
    // ====================
    // 6. КНОПКА "ГОВОРИТЬ"
    // ====================
    speakButton.addEventListener('click', function() {
        if (!isRecording) {
            recognition.start();
        }
    });
}

// ====================
// 7. ФУНКЦИИ ДЛЯ ПРАВИЛЬНЫХ/НЕПРАВИЛЬНЫХ ОТВЕТОВ
// ====================

function handleCorrectAnswer() {
    // Обновляем иконку и текст
    resultIcon.className = 'fas fa-check-circle';
    resultText.textContent = `Правильно! +10 очков`;
    resultText.style.color = '#4CAF50';
    correctAnswerElement.textContent = '';
    
    // Обновляем счёт
    score += 10;
    scoreElement.textContent = score;
    
    // Увеличиваем серию
    streak++;
    streakElement.textContent = streak;
    
    // Проверяем на бонус за серию
    if (streak % 3 === 0) {
        resultText.textContent = `СЕРИЯ ${streak}! +30 очков`;
        score += 20; // Дополнительные очки
        scoreElement.textContent = score;
        showConfetti(); // Показываем конфетти
        playSound(winSound); // Проигрываем победный звук
    } else {
        playSound(correctSound); // Проигрываем обычный звук правильного ответа
    }
    
    // Переходим к следующему слову через 1.5 секунды
    setTimeout(nextWord, 1500);
}

function handleWrongAnswer(correctAnswer) {
    // Обновляем иконку и текст
    resultIcon.className = 'fas fa-times-circle';
    resultText.textContent = 'Не совсем...';
    resultText.style.color = '#FF416C';
    correctAnswerElement.textContent = `Правильный ответ: ${correctAnswer}`;
    
    // Сбрасываем серию
    streak = 0;
    streakElement.textContent = streak;
    
    // Проигрываем звук ошибки
    playSound(wrongSound);
    
    // Переходим к следующему слову через 2 секунды
    setTimeout(nextWord, 2000);
}

// ====================
// 8. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ====================

// Переход к следующему слову
function nextWord() {
    currentWordIndex = (currentWordIndex + 1) % words.length;
    showCurrentWord();
    resultElement.classList.add('hidden');
}

// Показать текущее слово
function showCurrentWord() {
    const word = words[currentWordIndex];
    currentWordElement.textContent = word.english;
    transcriptionElement.textContent = word.transcription;
}

// Воспроизвести звук
function playSound(soundElement) {
    soundElement.currentTime = 0; // Перематываем в начало
    soundElement.play().catch(e => console.log("Ошибка воспроизведения звука:", e));
}

// ====================
// 9. КОНФЕТТИ ЭФФЕКТ
// ====================

function showConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confettiCount = 150;
    const confetti = [];
    
    // Создаём частицы конфетти
    for (let i = 0; i < confettiCount; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 10 + 5,
            d: Math.random() * 5 + 2,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            tilt: Math.random() * 10 - 10,
            tiltAngleIncrement: Math.random() * 0.07 + 0.05,
            tiltAngle: 0
        });
    }
    
    let animationId;
    
    function drawConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < confetti.length; i++) {
            const p = confetti[i];
            
            ctx.beginPath();
            ctx.lineWidth = p.r / 2;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
            ctx.stroke();
            
            p.y += p.d;
            p.tiltAngle += p.tiltAngleIncrement;
            p.tilt = Math.sin(p.tiltAngle) * 15;
            
            // Если конфетти улетело за экран, возвращаем его наверх
            if (p.y > canvas.height) {
                confetti[i] = {
                    x: Math.random() * canvas.width,
                    y: Math.random() * 20 - 20,
                    r: p.r,
                    d: p.d,
                    color: p.color,
                    tilt: Math.random() * 10 - 10,
                    tiltAngleIncrement: p.tiltAngleIncrement,
                    tiltAngle: p.tiltAngle
                };
            }
        }
        
        animationId = requestAnimationFrame(drawConfetti);
        
        // Останавливаем анимацию через 3 секунды
        setTimeout(() => {
            cancelAnimationFrame(animationId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 3000);
    }
    
    drawConfetti();
}

// ====================
// 10. ОБРАБОТЧИКИ КНОПОК
// ====================

// Кнопка "Начать игру"
startButton.addEventListener('click', function() {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    showCurrentWord();
});

// Кнопка "Пропустить"
skipButton.addEventListener('click', function() {
    nextWord();
});

// Кнопка "Подсказка"
hintButton.addEventListener('click', function() {
    const currentWord = words[currentWordIndex];
    hintElement.textContent = `Подсказка: начинается на "${currentWord.russian[0]}"`;
    
    // Через 3 секунды убираем подсказку
    setTimeout(() => {
        hintElement.textContent = "Нажмите кнопку и произнесите перевод";
    }, 3000);
});

// Кнопка "Заново"
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
// 11. ЗАПУСК ИГРЫ
// ====================

// Показываем первое слово при загрузке
window.addEventListener('load', function() {
    showCurrentWord();
    console.log("Игра загружена! Используйте браузер Chrome для лучшего распознавания речи.");

});
