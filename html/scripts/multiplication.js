document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('#checkboxes input[type="checkbox"]');
    const startButton = document.getElementById('startButton');
    const questionDiv = document.getElementById('question');
    const answersDiv = document.getElementById('answers');
    const progressDiv = document.getElementById('progress');
    const gameSection = document.getElementById('game');
    const answerHistoryDiv = document.createElement('div');
    answerHistoryDiv.id = 'answerHistory';
    document.body.appendChild(answerHistoryDiv);
    let timer;

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
        if (selected === correct) {
            result.textContent = `${table} x ${multiplier} = ${selected}`;
            result.classList.add('correct');
        } else {
            result.innerHTML = `${table} x ${multiplier} = <span class="wrong-answer">${selected}</span> (${correct})`;
            result.classList.add('incorrect');
        }
        answerHistoryDiv.appendChild(result);
        generateQuestion();
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
                generateQuestion();
            }
        }, 100);
    }

    startButton.addEventListener('click', () => {
        gameSection.style.display = 'block';
        generateQuestion();
    });
});
