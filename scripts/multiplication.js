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
    const questionStats = {}; // To track stats for each question
    const unansweredQuestions = {}; // To track unanswered questions for each table
    const recentlyAsked = []; // To track recently asked questions
    const MAX_RECENTLY_ASKED = 5; // Limit for recently asked questions
    let mode = 'Choose'; // Default mode

    const modeSlider = document.getElementById('modeSlider');
    modeSlider.addEventListener('change', (event) => {
        mode = event.target.value;
        answersDiv.innerHTML = ''; // Clear answers when mode changes
        if (mode === 'Open') {
            const inputBox = document.createElement('input');
            inputBox.type = 'number';
            inputBox.id = 'manualAnswer';
            inputBox.placeholder = 'Enter your answer';
            inputBox.autofocus = true;
            inputBox.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const userAnswer = parseInt(inputBox.value);
                    clearInterval(timer);
                    checkAnswer(userAnswer, correctAnswer, table, multiplier);
                }
            });
            answersDiv.appendChild(inputBox);
            inputBox.focus();
        }
    });

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

        // Initialize unanswered questions for selected tables
        selectedTables.forEach(table => {
            if (!unansweredQuestions[table]) {
                unansweredQuestions[table] = [];
                for (let multiplier = 1; multiplier <= 10; multiplier++) {
                    unansweredQuestions[table].push(multiplier);
                }
            }
        });

        let table, multiplier;

        // Prefer unanswered questions
        const tablesWithUnanswered = selectedTables.filter(table => unansweredQuestions[table].length > 0);
        if (tablesWithUnanswered.length > 0) {
            table = tablesWithUnanswered[getRandomInt(0, tablesWithUnanswered.length - 1)];
            const multiplierIndex = getRandomInt(0, unansweredQuestions[table].length - 1);
            multiplier = unansweredQuestions[table].splice(multiplierIndex, 1)[0];
        } else {
            // Create pools for incorrect and correct questions
            const incorrectQuestions = [];
            const correctQuestions = [];

            selectedTables.forEach(table => {
                for (let multiplier = 1; multiplier <= 10; multiplier++) {
                    const key = `${table}x${multiplier}`;
                    if (!recentlyAsked.includes(key)) {
                        if (!questionStats[key] || questionStats[key].correct < questionStats[key].total) {
                            incorrectQuestions.push({ table, multiplier });
                        } else {
                            correctQuestions.push({ table, multiplier });
                        }
                    }
                }
            });

            if (incorrectQuestions.length > 0) {
                const question = incorrectQuestions[getRandomInt(0, incorrectQuestions.length - 1)];
                table = question.table;
                multiplier = question.multiplier;
            } else if (correctQuestions.length > 0) {
                const question = correctQuestions[getRandomInt(0, correctQuestions.length - 1)];
                table = question.table;
                multiplier = question.multiplier;
            } else {
                table = selectedTables[getRandomInt(0, selectedTables.length - 1)];
                multiplier = getRandomInt(1, 10);
            }
        }

        const correctAnswer = table * multiplier;

        questionDiv.textContent = `What is ${table} x ${multiplier}?`;

        answersDiv.innerHTML = '';
        if (mode === 'Choose') {
            const answers = [correctAnswer];
            while (answers.length < 4) {
                const wrongAnswer = correctAnswer + getRandomInt(-2, 2);
                if (!answers.includes(wrongAnswer) && wrongAnswer > 0) {
                    answers.push(wrongAnswer);
                }
            }

            answers.sort(() => Math.random() - 0.5);
            answers.forEach(answer => {
                const button = document.createElement('button');
                button.textContent = answer;
                button.addEventListener('click', () => {
                    clearInterval(timer);
                    checkAnswer(answer, correctAnswer, table, multiplier);
                });
                answersDiv.appendChild(button);
            });
        } else if (mode === 'Open') {
            const inputBox = document.createElement('input');
            inputBox.type = 'number';
            inputBox.id = 'manualAnswer';
            inputBox.placeholder = 'Enter your answer';
            inputBox.autofocus = true;
            inputBox.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const userAnswer = parseInt(inputBox.value);
                    clearInterval(timer);
                    checkAnswer(userAnswer, correctAnswer, table, multiplier);
                }
            });
            answersDiv.appendChild(inputBox);
            inputBox.focus();
        }

        startTimer();
    }

    function updateQuestionStats(table, multiplier, isCorrect) {
        const key = `${table}x${multiplier}`;
        if (!questionStats[key]) {
            questionStats[key] = { correct: 0, total: 0 };
        }
        questionStats[key].total += 1;
        if (isCorrect) {
            questionStats[key].correct += 1;
        }
        renderScores();
    }

    function renderScores() {
        scoreBoardDiv.innerHTML = '';
        const sortedTables = Object.keys(scores).sort((a, b) => parseInt(a) - parseInt(b));
        for (const table of sortedTables) {
            const score = scores[table];
            const scoreDiv = document.createElement('div');
            scoreDiv.classList.add('score');
            scoreDiv.innerHTML = `<strong>Table ${table}:</strong> Correct: ${score.correct}, Incorrect: ${score.incorrect}`;

            const tableStats = Object.entries(questionStats)
                .filter(([key]) => key.startsWith(`${table}x`))
                .sort(([keyA], [keyB]) => {
                    const multiplierA = parseInt(keyA.split('x')[1]);
                    const multiplierB = parseInt(keyB.split('x')[1]);
                    return multiplierA - multiplierB;
                })
                .map(([key, { correct, total }]) => `<div>${key}: ${correct}/${total}</div>`)
                .join('');

            const statsDiv = document.createElement('div');
            statsDiv.classList.add('table-stats');
            statsDiv.innerHTML = tableStats;

            scoreDiv.appendChild(statsDiv);
            scoreBoardDiv.appendChild(scoreDiv);
        }
    }

    function showFeedback(isCorrect) {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.id = 'feedback';
        feedbackDiv.textContent = isCorrect ? 'Correct!' : 'Incorrect!';
        feedbackDiv.classList.add(isCorrect ? 'correct-feedback' : 'incorrect-feedback');
        document.body.appendChild(feedbackDiv);

        setTimeout(() => {
            feedbackDiv.remove();
        }, 1000); // Feedback disappears after 1 second
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
            updateQuestionStats(table, multiplier, true);
            showFeedback(true); // Show correct feedback
        } else {
            result.innerHTML = `${table} x ${multiplier} = <span class="wrong-answer">${selected}</span> (${correct})`;
            result.classList.add('incorrect');
            updateScore(table, false);
            updateQuestionStats(table, multiplier, false);
            showFeedback(false); // Show incorrect feedback
        }
        answerHistoryDiv.appendChild(result);
        if (answerHistoryDiv.children.length > 4) {
            answerHistoryDiv.removeChild(answerHistoryDiv.firstChild);
        }
        setTimeout(generateQuestion, 1000); // Delay before generating the next question
    }

    function startTimer() {
        // Clear any existing timer
        if (timer) {
            clearInterval(timer);
        }

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

    function showFinalScore() {
        clearInterval(timer); // Clear timer when the game ends
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

        // Check the current mode and initialize accordingly
        if (mode === 'Open') {
            answersDiv.innerHTML = '';
            const inputBox = document.createElement('input');
            inputBox.type = 'number';
            inputBox.id = 'manualAnswer';
            inputBox.placeholder = 'Enter your answer';
            inputBox.autofocus = true;
            inputBox.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const userAnswer = parseInt(inputBox.value);
                    clearInterval(timer);
                    checkAnswer(userAnswer, correctAnswer, table, multiplier);
                }
            });
            answersDiv.appendChild(inputBox);
            inputBox.focus();
        }

        generateQuestion();
    });

    stopButton.addEventListener('click', showFinalScore);
});
