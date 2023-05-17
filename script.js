//Create Canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Define the speed and direction of the dot
let speedX = 3;
let speedY = 1;

// Set the size of the canvas to match the window size
canvas.width = 800;
canvas.height = 250;

// Set the starting position of the dot
// let x = canvas.width / 2;
// let y = canvas.height / 2;

let x = 0;
let y = canvas.height;


const bgImage = new Image();
bgImage.src = './img/aviator.spribe.background.jpeg';
bgImage.onload = function () {
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
};


// Start the animation
let animationId = requestAnimationFrame(draw);

let dotPath = [];
let counter = 1.0;
let multiplier = 0;
let counterDepo = [1.01, 18.45, 2.02, 5.21, 1.22, 1.25, 2.03, 4.55, 65.11, 1.03, 1.10, 3.01, 8.85, 6.95, 11.01, 2.07, 4.05, 1.51, 1.02, 1.95, 1.05, 3.99, 2.89, 4.09, 11.20, 2.55];
let randomStop = Math.random() * (10 - 0.1) + 0.8;
let cashedOut = false; // flag to indicate if the user has cashed out
let placedBet = false;
let isFlying = true;


// Load the image
const image = new Image();
image.src = './img/aviator_jogo.png';

let balanceAmount = document.getElementById('balance-amount');
let calculatedBalanceAmount = 3000;
balanceAmount.textContent = calculatedBalanceAmount.toString() + '€';
let betButton = document.getElementById('bet-button');
betButton.textContent = 'Bet';

//Previous Counters
let lastCounters = document.getElementById('last-counters');

function updateCounterDepo() {
    lastCounters.innerHTML = counterDepo.map(i => `<p>${i}</p>`).join('');
}


//Hide letter E from input
let inputBox = document.getElementById("bet-input");

let invalidChars = ["-", "+", "e",];

inputBox.addEventListener("keydown", function (e) {
    if (invalidChars.includes(e.key)) {
        e.preventDefault();
    }
});


let messageField = document.getElementById('message');
messageField.textContent = 'Place your bet';

// Define the rotation angle
let rotationAngle = 0;
//Animation
function draw() {
    //Counter
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

        // Stop the animation
        cancelAnimationFrame(animationId);

        counterDepo.push(counter.toFixed(2));
        counterDepo = counterDepo.reverse();


        // Wait for 8 seconds and then start a new animation
        setTimeout(() => {

            // Generate a new randomStop value and reset the counter to 1
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


    // Update the rotation angle
    rotationAngle += 0.01;

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

    //give shake effect to the plane image
    let shakeOffsetX = 0;
    let shakeOffsetY = 0;
    let shakeMagnitude = 3;

    shakeOffsetX = Math.random() * shakeMagnitude - shakeMagnitude / 2;
    shakeOffsetY = Math.random() * shakeMagnitude - shakeMagnitude / 2;


    // Draw the image on top of the dot
    ctx.drawImage(image, x - 28 + shakeOffsetX, y - 78 + shakeOffsetX, 185, 85);

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

});


// Function to place a bet
function placeBet() {

    if (placedBet || inputBox.value === 0 || isNaN(inputBox.value) || isFlying || inputBox.value > calculatedBalanceAmount) {
        // user has already placed bet or has not placed a bet
        return;
    }

    if ((counter >= randomStop) && !isFlying && (inputBox.value <= calculatedBalanceAmount)) {
        // Only allow betting if animation is not running
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
        messageField.textContent = 'Wait for the next round';
    }
}

// Function to cash out bet
function cashOut() {

    if (cashedOut || (inputBox.value === 0)) {
        // user has already cashed out or has not placed a bet
        return;
    }

    if ((counter < randomStop)) {
        const winnings = inputBox.value * counter; // Calculate winnings based on counter
        calculatedBalanceAmount += winnings; // Add winnings to balance
        balanceAmount.textContent = calculatedBalanceAmount.toFixed(2).toString() + '€';

        cashedOut = true; // set flag to indicate user has cashed out
        placedBet = false;
        betButton.textContent = 'Bet';
        messageField.textContent = `Bet cashed out: ${winnings.toFixed(2)}`;
    } else {
        messageField.textContent = "Can't cash out now";
    }
}


