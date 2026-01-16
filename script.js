const words = [
    { english: "APPLE", russian: "яблоко", transcription: "[ˈæp.əl]" },
    { english: "HOUSE", russian: "дом", transcription: "[haʊs]" },
    { english: "BOOK", russian: "книга", transcription: "[bʊk]" },
    { english: "WATER", russian: "вода", transcription: "[ˈwɔː.tər]" },
    { english: "DOG", russian: "собака", transcription: "[дɒɡ]" }
];

let currentWordIndex = 0;
let score = 0;
let streak = 0;
let isRecording = false;
let recognition = null;
let soundsEnabled = false;

const wordCard = document.getElementById('word-card');
const currentWordElement = document.getElementById('current-word');
const scoreElement = document.getElementById('score');
const streakElement = document.getElementById('streak');
const voiceIndicator = document.getElementById('voice-indicator');
const hintElement = document.getElementById('hint');

// Активация звуков на iOS при первом клике
document.addEventListener('click', function() {
    if (!soundsEnabled) {
        const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ');
        silentAudio.volume = 0.01;
        silentAudio.play().then(() => {
            soundsEnabled = true;
        }).catch(e => {});
    }
});

function startVoiceRecording() {
    if (isRecording) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Микрофон не поддерживается");

    recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;

    recognition.onstart = () => {
        isRecording = true;
        voiceIndicator.classList.add('active');
        hintElement.textContent = "Слушаю...";
    };

    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        checkAnswer(spokenText);
    };

    recognition.onend = () => {
        isRecording = false;
        voiceIndicator.classList.remove('active');
        hintElement.textContent = "Нажми и говори";
        recognition = null;
    };

    recognition.start();
}

function checkAnswer(spokenText) {
    const correct = words[currentWordIndex].russian.toLowerCase();
    const isCorrect = spokenText.includes(correct) || correct.includes(spokenText);
    
    if (isCorrect) {
        score += 10;
        streak++;
        wordCard.classList.add('correct-anim');
        if (soundsEnabled) document.getElementById('correct-sound').play().catch(e=>{});
        
        // Показываем результат
        const resultEl = document.getElementById('result');
        const resultText = document.getElementById('result-text');
        const resultIcon = document.getElementById('result-icon');
        
        if (resultEl && resultText && resultIcon) {
            resultIcon.className = 'fas fa-check-circle';
            resultText.textContent = 'Правильно! +10';
            resultText.style.color = '#4CAF50';
            resultEl.classList.remove('hidden');
            
            setTimeout(() => {
                resultEl.classList.add('hidden');
            }, 1500);
        }
        
        if (streak % 3 === 0) {
            showConfetti();
        }
    } else {
        streak = 0;
        wordCard.classList.add('wrong-anim');
        if (soundsEnabled) document.getElementById('wrong-sound').play().catch(e=>{});
        
        // Показываем результат
        const resultEl = document.getElementById('result');
        const resultText = document.getElementById('result-text');
        const resultIcon = document.getElementById('result-icon');
        
        if (resultEl && resultText && resultIcon) {
            resultIcon.className = 'fas fa-times-circle';
            resultText.textContent = 'Попробуй ещё';
            resultText.style.color = '#FF416C';
            resultEl.classList.remove('hidden');
            
            setTimeout(() => {
                resultEl.classList.add('hidden');
            }, 1500);
        }
    }

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
    document.getElementById('transcription').textContent = words[currentWordIndex].transcription;
}

function showConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    
    if (soundsEnabled) document.getElementById('win-sound').play().catch(e => {});
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    score += 20;
    scoreElement.textContent = score;
    hintElement.textContent = `СЕРИЯ ${streak}! +20 бонус`;
    
    const particles = [];
    for (let i = 0; i < 60; i++) {
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
        hintElement.textContent = "Нажми и говори";
    }, 2000);
}

// Слушатели событий
document.getElementById('speak-btn').addEventListener('click', startVoiceRecording);

document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
});

document.getElementById('skip-btn').addEventListener('click', nextWord);

document.getElementById('hint-btn').addEventListener('click', function() {
    const word = words[currentWordIndex];
    hintElement.textContent = `Начинается на "${word.russian[0].toUpperCase()}"...`;
    setTimeout(() => {
        hintElement.textContent = "Нажми и говори";
    }, 3000);
});

document.getElementById('restart-btn').addEventListener('click', function() {
    score = 0;
    streak = 0;
    currentWordIndex = 0;
    scoreElement.textContent = score;
    streakElement.textContent = streak;
    currentWordElement.textContent = words[currentWordIndex].english;
    document.getElementById('transcription').textContent = words[currentWordIndex].transcription;
    wordCard.classList.remove('correct-anim', 'wrong-anim');
    
    const resultEl = document.getElementById('result');
    if (resultEl) resultEl.classList.add('hidden');
});

console.log("VOICE MASTER загружен! Версия для iPhone");
