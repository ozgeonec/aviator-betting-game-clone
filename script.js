// Create Canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Define the speed and direction of the dot
let speedX = 3;
let speedY = 1;

// Set the size of the canvas
canvas.width = 800;
canvas.height = 250;

// Set the starting position of the dot
let x = 0;
let y = canvas.height;

// Start the animation
let animationId = requestAnimationFrame(draw);

let dotPath = [];
let counter = 1.0;
let multiplier = 0;
let counterDepo = [
  1.34, 60.43, 3.54, 1.00, 2.56, 10.54, 5.67, 7.89, 12.34, 8.98,
  6.41, 4.25, 11.17, 9.56, 13.23, 15.67, 18.34, 20.23, 3.76, 7.01,
  12.89, 14.37, 10.42, 6.18, 17.62, 8.35, 3.67, 2.45, 6.99, 4.88,
  16.56, 9.71, 13.44, 19.13, 2.59, 11.22, 5.31, 8.74, 9.81, 14.56,
  20.44, 15.93, 10.77, 6.11, 7.19, 8.02, 4.69, 12.01, 17.22, 11.50,
  3.28, 5.99, 16.78, 10.89, 9.44, 2.67, 7.52, 14.88, 18.72, 5.03,
  6.49, 7.88, 19.34, 4.37, 3.92, 13.12, 10.25, 11.74, 8.95, 12.78,
  16.12, 2.83, 15.89, 17.11, 6.23, 4.95, 14.25, 19.22, 7.67, 8.57,
  5.84, 16.33, 13.55, 3.42, 10.90, 9.67, 7.13, 15.71, 18.99, 2.18
];
let randomStop = Math.random() * (10 - 0.1) + 0.8;
let cashedOut = false; // flag to indicate if the user has cashed out
let placedBet = false;
let isFlying = true;

// Load the image
const image = new Image();
image.src = './img/aviator_jogo.png';
image.style.minWidth = '100%';
image.style.width = '100%';

let balanceAmount = document.getElementById('balance-amount');
let calculatedBalanceAmount = 3000;
balanceAmount.textContent = calculatedBalanceAmount.toString() + '€';
let betButton = document.getElementById('bet-button');
betButton.textContent = 'Bet';

//Previous Counters
let lastCounters = document.getElementById('last-counters');
let counterItem = lastCounters.getElementsByTagName('p');
let classNameForCounter = '';


function updateCounterDepo() {
    lastCounters.innerHTML = counterDepo.map(function (i) {
        if ((i < 2.00)) {
            classNameForCounter = 'blueBorder';
        } else if ((i >= 2) && (i < 10)) {
            classNameForCounter = 'purpleBorder';
        } else classNameForCounter = 'burgundyBorder';

        return '<p' + ' class=' + classNameForCounter + '>' + i + '</p>';
    }).join('');
}

// Hide letter E from input
let inputBox = document.getElementById("bet-input");

let invalidChars = ["-", "+", "e",];

inputBox.addEventListener("keydown", function (e) {
    if (invalidChars.includes(e.key)) {
        e.preventDefault();
    }
});

let messageField = document.getElementById('message');
messageField.textContent = 'Wait for the next round';

// Animation
function draw() {
    // Counter
    counter += 0.001;
    document.getElementById('counter').textContent = counter.toFixed(2) + 'x';

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Call the function to update the counter item initially
    updateCounterDepo();

    x += speedX;
    // Calculate the new position of the dot
    if (counter < randomStop) {
        y -= speedY;
        y = canvas.height / 2 + 50 * Math.cos(x / 100);
        isFlying = true;
    } else {
        x = 0;
        y = 0;
        isFlying = false;
    }

    // Check if it's time to stop the animation
    if (counter >= randomStop) {
        messageField.textContent = 'Place your bet';

        // Stop the animation
        cancelAnimationFrame(animationId);

        counterDepo.unshift(counter.toFixed(2));

        // Wait for 8 seconds and then start a new animation
        setTimeout(() => {
            randomStop = Math.random() * (10 - 0.1) + 0.8;
            counter = 1.0;
            x = canvas.width / 2;
            y = canvas.height / 2;
            dotPath = [];
            cashedOut = false;
            isFlying = true;
            messageField.textContent = '';

            if (!placedBet && cashedOut) {
                betButton.textContent = 'Bet';
            }

            // Start the animation again
            animationId = requestAnimationFrame(draw);
        }, 8000);

        return;
    }

    // Push the dot's current coordinates into the dotPath array
    dotPath.push({ x: x, y: y });

    // Calculate the translation value for the canvas
    const canvasOffsetX = canvas.width / 2 - x;
    const canvasOffsetY = canvas.height / 2 - y;

    // Save the current transformation matrix
    ctx.save();

    // Translate the canvas based on the dot's position
    ctx.translate(canvasOffsetX, canvasOffsetY);

    // Draw the dot's path
    for (let i = 1; i < dotPath.length; i++) {
        ctx.beginPath();
        ctx.strokeStyle = '#dc3545';
        ctx.moveTo(dotPath[i - 1].x, dotPath[i - 1].y);
        ctx.lineTo(dotPath[i].x, dotPath[i].y);
        ctx.stroke();
    }

    // Draw the dot
    ctx.beginPath();
    ctx.fillStyle = '#dc3545';
    ctx.lineWidth = 5;
    ctx.arc(x, y, 1, 0, 2 * Math.PI);
    ctx.fill();

    // Draw the image on top of the dot
    ctx.drawImage(image, x - 28, y - 78, 185, 85);

    // Restore the transformation matrix to its original state
    ctx.restore();

    // Request the next frame of the animation
    animationId = requestAnimationFrame(draw);
}

// Start the animation
draw();

betButton.addEventListener('click', () => {
    if (placedBet) {
        cashOut();
    } else {
        placeBet();
    }
    if (!placedBet && !isFlying) {
        messageField.textContent = 'Place your bet';
    }
});

// Function to place a bet
function placeBet() {
    if (placedBet || inputBox.value === 0 || isNaN(inputBox.value) || isFlying || inputBox.value > calculatedBalanceAmount) {
        messageField.textContent = 'Wait for the next round';
        return;
    }

    if ((counter >= randomStop) && !isFlying && (inputBox.value <= calculatedBalanceAmount)) {
        if (inputBox.value && (inputBox.value <= calculatedBalanceAmount)) {
            calculatedBalanceAmount -= inputBox.value;
            balanceAmount.textContent = calculatedBalanceAmount.toFixed(2).toString() + '€';
            betButton.textContent = 'Cash Out';
            placedBet = true;
            messageField.textContent = 'Placed Bet';
        } else {
            messageField.textContent = 'Insufficient balance to place bet';
        }
    } else {
        if (isFlying) {
            messageField.textContent = 'Wait for the next round';
        }
    }
}

// Function to cash out bet
function cashOut() {
    if (cashedOut || (inputBox.value === 0)) {
        messageField.textContent = 'Wait for the next round';
        return;
    }

    if ((counter < randomStop)) {
        const winnings = inputBox.value * counter; 
        calculatedBalanceAmount += winnings;
        balanceAmount.textContent = calculatedBalanceAmount.toFixed(2).toString() + '€';

        cashedOut = true;
        placedBet = false;
        betButton.textContent = 'Bet';
        messageField.textContent = `Bet cashed out: ${winnings.toFixed(2)}`;
    } else {
        messageField.textContent = "Can't cash out now";
    }
}
