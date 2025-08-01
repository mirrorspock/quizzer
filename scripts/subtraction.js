class SubtractionGame {
    constructor() {
        this.score = 0;
        this.totalQuestions = 0;
        this.currentQuestion = null;
        this.answerHistory = [];
        this.timeLeft = 10;
        this.timer = null;
        this.isPlaying = false;
        this.difficulty = 1;

        // DOM elements
        this.startButton = document.getElementById('startButton');
        this.stopButton = document.getElementById('stopButton');
        this.questionDiv = document.getElementById('question');
        this.answersDiv = document.getElementById('answers');
        this.progressBar = document.getElementById('progress');
        this.scoreBoard = document.getElementById('scoreBoard');
        this.answerHistoryDiv = document.getElementById('answerHistory');

        // Bind event listeners
        this.startButton.addEventListener('click', () => this.startGame());
        this.stopButton.addEventListener('click', () => this.stopGame());
    }

    generateQuestion() {
        let num1, num2;
        const difficulty = parseInt(document.querySelector('input[name="difficulty"]:checked')?.value || 1);
        
        switch(difficulty) {
            case 1: // Result > 0
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * num1);
                break;
            case 2: // Result < 10
                num1 = Math.floor(Math.random() * 15) + 5;
                num2 = num1 - Math.floor(Math.random() * 9);
                break;
            case 3: // Result < 20
                num1 = Math.floor(Math.random() * 30) + 10;
                num2 = num1 - Math.floor(Math.random() * 19);
                break;
            case 4: // Result < 50
                num1 = Math.floor(Math.random() * 80) + 20;
                num2 = num1 - Math.floor(Math.random() * 49);
                break;
            case 5: // Any result
                num1 = Math.floor(Math.random() * 100) + 1;
                num2 = Math.floor(Math.random() * 100) + 1;
                break;
        }

        this.currentQuestion = {
            num1,
            num2,
            answer: num1 - num2
        };

        return `${num1} - ${num2} = ?`;
    }

    generateAnswers() {
        const answers = [this.currentQuestion.answer];
        const numAnswers = 4;
        
        while (answers.length < numAnswers) {
            const wrongAnswer = this.currentQuestion.answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
            if (!answers.includes(wrongAnswer)) {
                answers.push(wrongAnswer);
            }
        }

        // Shuffle answers
        return answers.sort(() => Math.random() - 0.5);
    }

    updateTimer() {
        // Clear any existing timer
        if (this.timer) {
            clearInterval(this.timer);
        }

        this.timeLeft--;
        const progress = (this.timeLeft / 10) * 100;
        this.progressBar.style.width = `${progress}%`;

        if (this.timeLeft <= 0) {
            this.handleTimeout();
        }
    }

    handleTimeout() {
        clearInterval(this.timer);
        this.answerHistory.push({
            question: `${this.currentQuestion.num1} - ${this.currentQuestion.num2}`,
            answer: this.currentQuestion.answer,
            userAnswer: 'Timeout',
            correct: false
        });
        this.updateAnswerHistory();
        this.nextQuestion();
    }

    startGame() {
        if (!document.querySelector('input[name="difficulty"]:checked')) {
            alert('Please select a difficulty level');
            return;
        }

        this.isPlaying = true;
        this.score = 0;
        this.totalQuestions = 0;
        this.answerHistory = [];
        this.startButton.style.display = 'none';
        this.stopButton.style.display = 'block';
        this.updateScore();
        this.nextQuestion();
    }

    stopGame() {
        this.isPlaying = false;
        clearInterval(this.timer);
        this.startButton.style.display = 'block';
        this.stopButton.style.display = 'none';
        this.questionDiv.textContent = 'Game stopped';
        this.answersDiv.innerHTML = '';
    }

    nextQuestion() {
        if (!this.isPlaying) return;

        this.timeLeft = 10;
        this.progressBar.style.width = '100%';
        
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => this.updateTimer(), 1000);

        const question = this.generateQuestion();
        this.questionDiv.textContent = question;

        const answers = this.generateAnswers();
        this.answersDiv.innerHTML = '';
        
        answers.forEach(answer => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.addEventListener('click', () => this.checkAnswer(answer));
            this.answersDiv.appendChild(button);
        });
    }

    checkAnswer(userAnswer) {
        clearInterval(this.timer);
        const correct = userAnswer === this.currentQuestion.answer;
        
        if (correct) {
            this.score++;
        }

        this.totalQuestions++;
        this.answerHistory.push({
            question: `${this.currentQuestion.num1} - ${this.currentQuestion.num2}`,
            answer: this.currentQuestion.answer,
            userAnswer: userAnswer,
            correct: correct
        });

        this.updateScore();
        this.updateAnswerHistory();
        this.nextQuestion();
    }

    updateScore() {
        const percentage = this.totalQuestions === 0 ? 0 : Math.round((this.score / this.totalQuestions) * 100);
        this.scoreBoard.textContent = `Score: ${this.score}/${this.totalQuestions} (${percentage}%)`;
    }

    updateAnswerHistory() {
        this.answerHistoryDiv.innerHTML = this.answerHistory
            .slice(-5)
            .map(history => `
                <div class="${history.correct ? 'correct' : 'incorrect'}">
                    ${history.question} = ${history.answer}
                    ${!history.correct ? ` (Your answer: ${history.userAnswer})` : ''}
                </div>
            `)
            .join('');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SubtractionGame();
});