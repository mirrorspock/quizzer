document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('#checkboxes input[type="checkbox"]');
    const startButton = document.getElementById('startButton');
    const questionDiv = document.getElementById('question');
    const answersDiv = document.getElementById('answers');
    const progressDiv = document.getElementById('progress');
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
        const multiplier = getRandomInt(1, 15);
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
            button.addEventListener('click', () => checkAnswer(answer, correctAnswer));
            answersDiv.appendChild(button);
        });

        startTimer();
    }

    function checkAnswer(selected, correct) {
        clearInterval(timer);
        if (selected === correct) {
            alert('Correct!');
        } else {
            alert(`Wrong! The correct answer was ${correct}.`);
        }
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
                alert('Time is up!');
                generateQuestion();
            }
        }, 100);
    }

    startButton.addEventListener('click', generateQuestion);
});
