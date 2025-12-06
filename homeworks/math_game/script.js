document.addEventListener('DOMContentLoaded', () => {
    const screens = {
        start: document.getElementById('start-screen'),
        game: document.getElementById('game-screen'),
        levelComplete: document.getElementById('level-complete-screen'),
        gameWon: document.getElementById('game-won-screen'),
        gameOver: document.getElementById('game-over-screen'),
    };

    const elements = {
        levelDisplay: document.getElementById('level-display'),
        timerDisplay: document.getElementById('timer-display'),
        questionDisplay: document.getElementById('question-display'),
        answerInput: document.getElementById('answer-input'),
        submitButton: document.getElementById('submit-button'),
        feedbackDisplay: document.getElementById('feedback-display'),
        correctDisplay: document.getElementById('correct-display'),
        incorrectDisplay: document.getElementById('incorrect-display'),
        levelCompleteMessage: document.getElementById('level-complete-message'),
        gameOverMessage: document.getElementById('game-over-message'),
    };

    const buttons = {
        start: document.getElementById('start-button'),
        submit: document.getElementById('submit-button'),
        nextLevel: document.getElementById('next-level-button'),
        restart: document.getElementById('restart-button'),
        restartWon: document.getElementById('restart-won-button'),
        exit: document.getElementById('exit-button'),
    };

    const gameState = {
        currentLevel: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        questionsAnswered: 0,
        questionPool: [],
        currentQuestion: null,
        timerInterval: null,
        timeLeft: 300,
    };
    
    const levelNames = ['Начальный', 'Средний', 'Продвинутый'];
    const QUESTIONS_PER_LEVEL = 10;
    const PASS_THRESHOLD = 8;
    function showScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[screenName].classList.add('active');
    }

    function generateBeginnerQuestion() {
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        const operators = ['+', '-', '*'];
        const op = operators[Math.floor(Math.random() * operators.length)];
        let question, answer;

        switch (op) {
            case '+': question = `${a} + ${b}`; answer = a + b; break;
            case '-': question = `${a} - ${b}`; answer = a - b; break;
            case '*': question = `${a} * ${b}`; answer = a * b; break;
        }
        return { question, answer: String(answer) };
    }

    function generateIntermediateQuestion() {
        const a = Math.floor(Math.random() * 50) + 1;
        const b = Math.floor(Math.random() * 50) + 1;
        const operators = ['>', '<', '>=', '<=', '===', '!=='];
        const op = operators[Math.floor(Math.random() * operators.length)];
        let question, answer;

        switch (op) {
            case '>': question = `${a} > ${b}`; answer = a > b; break;
            case '<': question = `${a} < ${b}`; answer = a < b; break;
            case '>=': question = `${a} >= ${b}`; answer = a >= b; break;
            case '<=': question = `${a} <= ${b}`; answer = a <= b; break;
            case '===': question = `${a} === ${b}`; answer = a === b; break;
            case '!==': question = `${a} !== ${b}`; answer = a !== b; break;
        }
        return { question, answer: String(answer) };
    }

    function generateAdvancedQuestion() {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const c = Math.floor(Math.random() * 10) + 1;
        const d = Math.floor(Math.random() * 10) + 1;
        const operators = ['&&', '||'];
        const op = operators[Math.floor(Math.random() * operators.length)];
        let question, answer;

        const cond1 = `${a} > ${b}`;
        const cond2 = `${c} < ${d}`;
        question = `(${cond1}) ${op} (${cond2})`;
        const eval1 = a > b;
        const eval2 = c < d;
        answer = (op === '&&') ? (eval1 && eval2) : (eval1 || eval2);

        return { question, answer: String(answer) };
    }

    function generateQuestionPool(level) {
        const pool = [];
        let generator;
        if (level === 0) generator = generateBeginnerQuestion;
        else if (level === 1) generator = generateIntermediateQuestion;
        else if (level === 2) generator = generateAdvancedQuestion;

        for (let i = 0; i < QUESTIONS_PER_LEVEL; i++) {
            pool.push(generator());
        }
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return pool;
    }

    function startGame() {
        gameState.currentLevel = 0;
        gameState.correctAnswers = 0;
        gameState.incorrectAnswers = 0;
        gameState.questionsAnswered = 0;
        startLevel(gameState.currentLevel);
    }

    function startLevel(level) {
        gameState.questionsAnswered = 0;
        gameState.questionPool = generateQuestionPool(level);
        gameState.timeLeft = 300;
        
        elements.levelDisplay.textContent = `Level: ${levelNames[level]}`;
        updateScore();
        showScreen('game');
        askNextQuestion();
        startTimer();
    }

    function askNextQuestion() {
        if (gameState.questionsAnswered >= QUESTIONS_PER_LEVEL || gameState.questionPool.length === 0) {
            endLevel();
            return;
        }

        gameState.currentQuestion = gameState.questionPool.pop();
        elements.questionDisplay.textContent = gameState.currentQuestion.question;
        elements.answerInput.value = '';
        elements.feedbackDisplay.textContent = '';
        elements.answerInput.focus();
    }

    function checkAnswer() {
        const userAnswer = elements.answerInput.value.trim().toLowerCase();
        const correctAnswer = gameState.currentQuestion.answer.toLowerCase();

        const correctSynonyms = ['true', 'верно', 'да', '+'];
        const incorrectSynonyms = ['false', 'неверно', 'нет', '-'];

        let isCorrect = false;

        if (!isNaN(correctAnswer)) {
            if (userAnswer === correctAnswer) {
                isCorrect = true;
            }
        } else {
            if (correctAnswer === 'true' && correctSynonyms.includes(userAnswer)) {
                isCorrect = true;
            } else if (correctAnswer === 'false' && incorrectSynonyms.includes(userAnswer)) {
                isCorrect = true;
            }
        }

        if (isCorrect) {
            gameState.correctAnswers++;
            elements.feedbackDisplay.textContent = 'Correct!';
            elements.feedbackDisplay.className = 'correct';
        } else {
            gameState.incorrectAnswers++;
            elements.feedbackDisplay.textContent = 'Incorrect!';
            elements.feedbackDisplay.className = 'incorrect';
        }

        gameState.questionsAnswered++;
        updateScore();
        
        setTimeout(askNextQuestion, 1000);
    }

    function endLevel() {
        stopTimer();
        if (gameState.correctAnswers >= PASS_THRESHOLD) {
            if (gameState.currentLevel < levelNames.length - 1) {
                elements.levelCompleteMessage.textContent = `Вы ответили правильно на ${gameState.correctAnswers} из ${QUESTIONS_PER_LEVEL} вопросов.`;
                showScreen('levelComplete');
            } else {
                showScreen('gameWon');
            }
        } else {
            elements.gameOverMessage.textContent = `Вы ответили правильно на ${gameState.correctAnswers} из ${QUESTIONS_PER_LEVEL} вопросов. Нужно было ${PASS_THRESHOLD}.`;
            showScreen('gameOver');
        }
    }
    
    function nextLevel() {
        gameState.currentLevel++;
        startLevel(gameState.currentLevel);
    }

    function updateScore() {
        elements.correctDisplay.textContent = `Correct: ${gameState.correctAnswers}`;
        elements.incorrectDisplay.textContent = `Incorrect: ${gameState.incorrectAnswers}`;
    }

    function startTimer() {
        stopTimer();
        gameState.timerInterval = setInterval(() => {
            gameState.timeLeft--;
            const minutes = Math.floor(gameState.timeLeft / 60);
            const seconds = gameState.timeLeft % 60;
            elements.timerDisplay.textContent = `Time left: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (gameState.timeLeft <= 0) {
                stopTimer();
                endLevel();
            }
        }, 1000);
    }

    function stopTimer() {
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
        }
    }
    
    function exitGame() {
        if (confirm("Вы уверены, что хотите выйти?")) {
            showScreen('start');
            stopTimer();
        }
    }

    buttons.start.addEventListener('click', startGame);
    buttons.submit.addEventListener('click', checkAnswer);
    elements.answerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    buttons.nextLevel.addEventListener('click', nextLevel);
    buttons.restart.addEventListener('click', startGame);
    buttons.restartWon.addEventListener('click', startGame);
    buttons.exit.addEventListener('click', exitGame);
});