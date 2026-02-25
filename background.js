const DEFAULT_TIMER_MINUTES = 40;
const TIMER_DURATION = DEFAULT_TIMER_MINUTES * 60;

// Creates an every-second trigger
chrome.alarms.create("exerciseReminder", { 
    periodInMinutes: 1 / 60,
})

// Updates the timer value
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "exerciseReminder") {
        chrome.storage.local.get(["timer", "isRunning"], (res) => {
            if (res.isRunning) {
                let timer = res.timer - 1;
                if (timer === 0) {
                    notifyUser();
                    timer = TIMER_DURATION;
                    chrome.storage.local.set({
                        isRunning: false,
                    });
                }
                chrome.storage.local.set({
                    timer, 
                });
            }
        });
    }
});

// Sends a notification to a user
function notifyUser() {
    chrome.notifications.create({
        type: "basic",
        title: "meow! time is up!",
        message: "do some stretching and eye exercising!",
        iconUrl: "./assets/icons8_48.png",
    });
}

// Sets values 
chrome.storage.local.get(["timer"], (res) => {
    if (!("timer" in res)) {
        chrome.storage.local.set({
            timer: TIMER_DURATION,
            isRunning: false,
        });
    }
});