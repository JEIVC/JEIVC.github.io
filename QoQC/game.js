const PERFECTFPS = 100 / 6;

let dt = 0;
let lastTimestamp = 0;
const upgradeList = [
    {
        type: "buyable",
        cost: () => {
            return (1 + game.upgrades[0].bought)
                * 5
        }
    }
]

function getUpgCost(upgradeId) {
    return upgradeList[upgradeId].cost()
}

const defaultGame = {
    points: 0,
    cooldown: 2,
    buttons: {
        "inc_0": 0
    },
    superButtons: {},
    upgrades: [
        {
            bought: 0
        }
    ]
};
let game = JSON.parse(JSON.stringify(
    defaultGame
));

let upgrade0 = document.getElementById("upg_0");
    let upgrade0CostDisplay = document.getElementById("cost_0");
let upgrade1 = document.getElementById("upg_1");
let pointDisplay = document.getElementById("pointDisplay");
function updateDisplays() {
    pointDisplay.textContent = game.points.toString();
    upgrade0CostDisplay.textContent = getUpgCost(0);
}

let removeButtons = () => {
    for (id in game.buttons) {
        document.getElementById(id).remove();
    }
    game.buttons = {};
    lastIncrementorId = -1;
}

function load(gameSave) {
    game.buttons = {}
    for (let btn of rawbuttons) btn.remove();
    for (info in gameSave.superButtons) addSuperButton(gameSave.superButtons[info].power);
    lastIncrementorId = -1;
    for (_ in gameSave.buttons) addButton();

    // please implement more robust data transfer
    // (loop thru keys and if the default save has a key the save does not,)
    // (...add the default key-value pair to the game save)
    game = gameSave;

    updateDisplays();
}

function onIncrement(button) {
    if (button.classList.contains("cooldown")) return;

    if (button.id in game.buttons) {
        ++game.points;
        game.buttons[button.id] = game.cooldown;
    } else if (button.id in game.superButtons) {
        game.points += game.superButtons[button.id].power;
        game.superButtons[button.id].cooldown = game.cooldown;
    }

    updateDisplays();
    button.classList.add("cooldown");
}
let incrementorContainer = document.getElementById("incContainer");
let superIncrementorContainer = document.getElementById("sincContainer");
let incrementorTemplate = document.getElementById("inc_0").cloneNode(true);
let superIncrementorTemplate = incrementorTemplate.cloneNode(true);
superIncrementorTemplate.firstChild.textContent = "increment superbutton";
superIncrementorTemplate.id = "sinc_0";
superIncrementorTemplate.classList.add("super");

let lastIncrementorId = 0;
let lastSuperIncrementorId = -1;

let rawbuttons = document.getElementsByClassName("incrementor");
for (let btn of rawbuttons) {
    console.log(btn)
    game.buttons[btn.id] = 0;
    btn.addEventListener("click", () => onIncrement(btn));
}

function addButton() {
    ++lastIncrementorId;

    let newBtn = incrementorTemplate.cloneNode(true);
    newBtn.id = "inc_" + lastIncrementorId.toString();

    game.buttons[newBtn.id] = 0;
    newBtn.addEventListener("click", () => onIncrement(newBtn));

    incrementorContainer.appendChild(newBtn);
}
function addSuperButton(power) {
    ++lastSuperIncrementorId;

    let newSBtn = superIncrementorTemplate.cloneNode(true);
    newSBtn.id = "sinc_" + lastSuperIncrementorId.toString();

    console.log(newSBtn.id + " with power " + Object.keys(game.buttons).length.toString());
    game.superButtons[newSBtn.id] = {
        power: power,
        cooldown: 0
    }
    newSBtn.firstChild.textContent = "increment superbutton (x" +
        power.toString() + ")";
    newSBtn.addEventListener("click", () => onIncrement(newSBtn));

    removeButtons();
    superIncrementorContainer.appendChild(newSBtn);
}
upgrade0.onclick = () => {
    if (game.points < getUpgCost(0)) return;
    game.points -= getUpgCost(0);
    ++game.upgrades[0].bought;

    addButton();

    rawbuttons = document.getElementsByClassName("incrementor");
    updateDisplays();
}
upgrade1.onclick = () => {
    if (Object.keys(game.buttons).length < 5) return;

    addSuperButton(Object.keys(game.buttons).length);
    
    rawbuttons = document.getElementsByClassName("incrementor");
}

function update(timestamp) {
    requestAnimationFrame(update);
    dt = (timestamp - lastTimestamp) / PERFECTFPS;
    lastTimestamp = timestamp;

    for (let btn of rawbuttons) {
        if (btn.id in game.buttons) {
            if (game.buttons[btn.id] > 0) {
                game.buttons[btn.id] -= dt / 60;
                btn.firstElementChild.firstElementChild.style.width = 
                  100*(1 - game.buttons[btn.id] / game.cooldown).toFixed(2) + "%";
            }
                
            if (game.buttons[btn.id] <= 0)
                if (btn.classList.contains("cooldown"))
                    btn.classList.remove("cooldown");
        }
        if (btn.id in game.superButtons) {
            if (game.superButtons[btn.id].cooldown > 0) {
                game.superButtons[btn.id].cooldown -= dt / 60;
                btn.firstElementChild.firstElementChild.style.width = 
                  100*(1 - game.superButtons[btn.id].cooldown / game.cooldown).toFixed(2) + "%";
            }
                
            if (game.superButtons[btn.id].cooldown <= 0)
                if (btn.classList.contains("cooldown"))
                    btn.classList.remove("cooldown");
        }
    }
}

let saveBtn = document.getElementById("saveBtn");
saveBtn.onclick = () => {
    localStorage.setItem("saveData", JSON.stringify(game));
    saveBtn.textContent = "saved!"
    setTimeout(() => saveBtn.textContent = "save", 1000);
}
let resetBtn = document.getElementById("resetBtn");
var resetOut;
resetBtn.onclick = () => {
    if (resetOut) {
        window.clearTimeout(resetOut);
        localStorage.setItem("saveData", JSON.stringify(defaultGame));
        resetBtn.textContent = "done.";
        resetOut = undefined;
        setTimeout(() => location.reload(), 1000);
        return;
    }
    resetBtn.textContent = "ya sure?"
    resetOut = setTimeout(() => {
        resetBtn.textContent = "reset data";
        resetOut = undefined;
    }, 5000);
}
let saveData = localStorage.getItem("saveData");
if (saveData) {
    load(JSON.parse(saveData));
}
// {"points":85,"cooldown":2,"buttons":{"inc_0":0,"inc_1":0},"superButtons":{"sinc_0":{"power":5,"cooldown":0},"sinc_1":{"power":10,"cooldown":0}},"upgrades":[{"bought":16}]}
requestAnimationFrame(update);