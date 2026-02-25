const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");

// Starts the countdown
startBtn.addEventListener("click", () => {
    chrome.storage.local.get(["isRunning"], (res) => {
        chrome.storage.local.set({
            isRunning : !res.isRunning,
        });
        updateBtn();
    });
});

// Resets the countdown
resetBtn.addEventListener("click", () => {
    chrome.storage.local.set({
        timer: 40 * 60, 
        isRunning: false,
    }, () => {
        startBtn.textContent = "start";
    });
});

// Updates the values on the countdown
function updateTime() {
    chrome.storage.local.get(["timer", "isRunning"], (res) => {
        const time = document.getElementById("time");
        const minutes = `${Math.floor(res.timer / 60)}`.padStart(2, "0");
        const seconds = `${res.timer % 60}`.padStart(2, "0");
        time.textContent = `${minutes}:${seconds}`;

        updateBtn(res.isRunning);
    });
}

// Updates the start-pause button
function updateBtn(isRunning) {
    startBtn.textContent = isRunning ? "pause" : "start"
}

// Ensures the values are updated every second
updateTime();
setInterval(updateTime, 1000);