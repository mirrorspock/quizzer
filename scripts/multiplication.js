document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('#checkboxes input[type="checkbox"]');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const questionDiv = document.getElementById('question');
    const answersDiv = document.getElementById('answers');
    const progressDiv = document.getElementById('progress');
    const gameSection = document.getElementById('game');
    const scoreBoardDiv = document.createElement('div');
    scoreBoardDiv.id = 'scoreBoard';
    document.body.appendChild(scoreBoardDiv);
    const answerHistoryDiv = document.createElement('div');
    answerHistoryDiv.id = 'answerHistory';
    document.body.appendChild(answerHistoryDiv);
    const settingsSection = document.getElementById('settings');
    let timer;
    const scores = {};

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateQuestion() {
        const selectedTables = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => parseInt(checkbox.value));

        if (selectedTables.length === 0) {
            questionDiv.textContent = 'Please select at least one multiplication table.';
            return;
        }

        const table = selectedTables[getRandomInt(0, selectedTables.length - 1)];
        const multiplier = getRandomInt(1, 10);
        const correctAnswer = table * multiplier;

        questionDiv.textContent = `What is ${table} x ${multiplier}?`;

        const answers = [correctAnswer];
        while (answers.length < 4) {
            const wrongAnswer = correctAnswer + getRandomInt(-2, 2);
            if (!answers.includes(wrongAnswer) && wrongAnswer > 0) {
                answers.push(wrongAnswer);
            }
        }

        answers.sort(() => Math.random() - 0.5);
        answersDiv.innerHTML = '';
        answers.forEach(answer => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.addEventListener('click', () => checkAnswer(answer, correctAnswer, table, multiplier));
            answersDiv.appendChild(button);
        });

        startTimer();
    }

    function checkAnswer(selected, correct, table, multiplier) {
        clearInterval(timer);
        const result = document.createElement('div');
        const buttons = answersDiv.querySelectorAll('button');
        buttons.forEach(button => {
            if (parseInt(button.textContent) === correct) {
                button.classList.add('correct');
            } else if (parseInt(button.textContent) === selected) {
                button.classList.add('incorrect');
            }
        });
        if (selected === correct) {
            result.textContent = `${table} x ${multiplier} = ${selected}`;
            result.classList.add('correct');
            updateScore(table, true);
        } else {
            result.innerHTML = `${table} x ${multiplier} = <span class="wrong-answer">${selected}</span> (${correct})`;
            result.classList.add('incorrect');
            updateScore(table, false);
        }
        answerHistoryDiv.appendChild(result);
        if (answerHistoryDiv.children.length > 4) {
            answerHistoryDiv.removeChild(answerHistoryDiv.firstChild);
        }
        setTimeout(generateQuestion, 1000); // Delay before generating the next question
    }

    function startTimer() {
        let width = 100;
        progressDiv.style.width = width + '%';
        timer = setInterval(() => {
            width -= 1;
            progressDiv.style.width = width + '%';
            if (width <= 0) {
                clearInterval(timer);
                const result = document.createElement('div');
                result.textContent = 'Time is up!';
                result.classList.add('incorrect');
                answerHistoryDiv.appendChild(result);
                if (answerHistoryDiv.children.length > 4) {
                    answerHistoryDiv.removeChild(answerHistoryDiv.firstChild);
                }
                generateQuestion();
            }
        }, 100);
    }

    function updateScore(table, isCorrect) {
        if (!scores[table]) {
            scores[table] = { correct: 0, incorrect: 0 };
        }
        if (isCorrect) {
            scores[table].correct += 1;
        } else {
            scores[table].incorrect += 1;
        }
        renderScores();
    }

    function renderScores() {
        scoreBoardDiv.innerHTML = '';
        for (const table in scores) {
            const score = scores[table];
            const scoreDiv = document.createElement('div');
            scoreDiv.classList.add('score');
            scoreDiv.textContent = `Table ${table}: Correct: ${score.correct}, Incorrect: ${score.incorrect}`;
            scoreBoardDiv.appendChild(scoreDiv);
        }
    }

    function showFinalScore() {
        clearInterval(timer);
        gameSection.style.display = 'none';
        settingsSection.style.display = 'block';
        stopButton.style.display = 'none';
        startButton.style.display = 'block';
        checkboxes.forEach(checkbox => checkbox.checked = false);
        alert('Game Over! Check the score board for your final scores.');
    }

    startButton.addEventListener('click', () => {
        settingsSection.style.display = 'none';
        gameSection.style.display = 'block';
        stopButton.style.display = 'block';
        generateQuestion();
    });

    stopButton.addEventListener('click', showFinalScore);
});
