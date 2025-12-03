let game = {
    // 0 - play, 1 - win, -1 - loss, -2 - init
    _state: -2,
    get state() {
        return this._state;
    },
    set state(val) {
        this._state = val;
        switch (val) {
            case 0:
                break;
            case 1:
                board.forEach((r) => {
                    r.forEach((tile) => {
                        if (tile.flagged != 0) {
                            tile.element.style.backgroundColor = "green";
                        } else if (!tile.counted) {
                            tile.element.style.background = `url("tileImages/${getFlagName(mineIndex[tile.type])}.png") no-repeat center/70% 70%`;
                            tile.element.style.backgroundColor = "green";
                        }
                    })
                })
                if (!primedMusic.paused) {
                    var vol = 1;
                    var fadeout = setInterval(
                    function() {
                        vol -= 0.05;
                        if (vol > 0) {
                            primedMusic.volume = vol;
                        }
                        else {
                            clearInterval(fadeout);
                            primedMusic.pause();
                        }
                    }, 100);
                }
                break;
            case -1:
                board.forEach((r) => {
                    r.forEach((tile) => {
                        tile.countMines("a");
                    })
                })
                if (!primedMusic.paused) {
                   primedMusic.pause();
                   loseSound.play();
                }
                break;
            case -2:
                break;
        }
    },
    cleared: 0,
    flags: {
        flag: 0,
        anti: 0,
        double: 0
    },
    flagCarousel: [0, 1, 2, -1],
    mines: {
        mine: 5,
        antiMine: 5,
        doubleMine: 5
    },
}

let stateDisp = document.getElementById("flagDisplay");
let musDisp = document.getElementById("musDisplay");
let boardDiv = document.getElementById("board");
let board = [];
let boardWidth = 10;
let boardHeight = 10;

let musicPool = [
    new Audio("music/panicBetrayer.mp3")
];
let primedMusic = musicPool[0];
    primedMusic.loop = true;
let loseSound = new Audio("died.ogg");
loseSound.volume = 0.6;


let totalMines = Object.values(game.mines).reduce((a, v) => a + v, 0);
let neededClears = boardHeight * boardWidth - totalMines;
const areSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));

const defaultMineDetection = [
    "111",
    "1X1",
    "111"
]
const doubleMineDetection = [
    "222",
    "2X2",
    "222"
]
const antiMineDetection = [
    ["-1", "-1", "-1"],
    ["-1", "X", "-1"],
    ["-1", "-1", "-1"]
]
const detections = [
    {
        type: "mine",
        detection: defaultMineDetection
    },
    {
        type: "doubleMine",
        detection: doubleMineDetection
    },
     {
        type: "antiMine",
        detection: antiMineDetection
    },
]
const mineIndex = {
    norm: 0,
    mine: 1,
    doubleMine: 2,
    antiMine: -1
}
function dualIndexAsOffsetFromCentre(grid, y, x) {
    // assumes uniform row length
    let rowLen = grid[0].length;
    let colLen = grid.length;

    // assumes an X
    let centreY;
    let centreX;
    for (var i = 0; i < colLen; ++i) {
        if (grid[i].includes("X")) {
            centreY = i;
            centreX = grid[i].indexOf("X");
        }
    }

    return [y - centreY, x - centreX];
}

function validDualIndex(y, x) {
    return (y >= 0 && y < board.length) 
        && (x >= 0 && x < board[0].length) 
}

function getFlagName(val) {
    switch (val) {
        case 0:
            return;
        case 1:
            return "flag";
        case 2:
            return "double";
        case -1:
            return "anti";
    }
}

function updateFlags() {
    game.flags = {
        flag: 0,
        anti: 0,
        double: 0
    }
    for (var y = 0; y < boardHeight; y++) {
        for (var x = 0; x < boardWidth; x++) {
            let tile = board[y][x];
            if (tile.flagged != 0) {
                ++game.flags[getFlagName(game.flagCarousel[tile.flagged])];
            }
        }
    }
    if (game.cleared == neededClears) {
        game.state = 1;
    }
    stateDisp.innerHTML = `Flags: ${game.flags.flag}/${game.mines.mine}<br>DFlags: ${game.flags.double}/${game.mines.doubleMine}<br>AFlags: ${game.flags.anti}/${game.mines.antiMine}<br>You've cleared ${game.cleared}/${neededClears} tiles`;
}

function populateMines(startY, startX, tolerance) {
    let available = [];
    for (var y = 0; y < boardHeight; ++y) {
            for (var x = 0; x < boardWidth; ++x) {
                if (
                    Math.abs(startY - y) > tolerance || 
                    Math.abs(startX - x) > tolerance
                )
                    available.push([y, x]);
            }
        }
    for (const [key, val] of Object.entries(game.mines)) {
        for (var _ = 0; _ < val; ++_) {
            let randomI = Math.floor(Math.random() * available.length);
            let randomPos = available[randomI];
            board[randomPos[0]][randomPos[1]].type = key;
            available.splice(randomI, 1);
        }
    }   
}

class Tile {
    type;
    x;
    y;
    element;
    counted;
    flagged;
    handler;
    constructor(_y, _x) {
        this.type = "norm"
        this.x = _x;
        this.y = _y;
        this.element = document.createElement("button");
        this.element.style.background = "grey";
        this.element.className = "tile";
        this.element.textContent = " ";

        this.handler = (e) => {
            if (primedMusic.paused && game.state == -2) {
                primedMusic.play();
                musDisp.textContent = "Panic Betrayer - Heaven Pierce Her"
            }
            this.countMines(e)
        };
        this.element.addEventListener("mouseup", this.handler, true);

        this.counted = false;
        this.flagged = 0;
    }

    countStyle(txt) {
        if (txt === "F") {
            this.element.textContent = " ";
            this.element.style.background = `url("tileImages/${this.type.toLowerCase()}.png") no-repeat center/90% 90%`;
            return;
        }
        if (game.state != -1) this.element.style.background = "lightgrey";
        if (txt == "0") return;
        this.element.style.background = `lightgrey url("tileImages/${txt}.png") no-repeat center/auto 70%`;
        this.element.style.fontSize = "20px";
        this.element.style.textShadow = "0 0 5px black";
        switch(txt) {
            case 10:
                this.element.style.color = "white";
                return;
            case 11:
                this.element.style.color = "orange";
                return;
            case 12:
                this.element.style.color = "pink";
                return;
        }
    }

    countMines(event) {
        switch (game.state) {
            case 1:
                return;
            case -2:
                populateMines(this.y, this.x, 1)
                game.state = 0;
                break;
            case -1:
                if (this.flagged) {
                    if (mineIndex[this.type] != game.flagCarousel[this.flagged]) 
                    {   
                        this.element.style.background = `url("tileImages/${getFlagName(game.flagCarousel[this.flagged])}Fail.png") no-repeat center/70% 70%`;
                        if (areSetsEqual(
                            new Set([mineIndex[this.type], game.flagCarousel[this.flagged]]),
                            new Set([1, -1])
                        )) {
                            this.element.style.background = `url("tileImages/revPolarity.png") no-repeat center/70% 70%`;
                        }
                        if (areSetsEqual(
                            new Set([mineIndex[this.type], game.flagCarousel[this.flagged]]),
                            new Set([2, -1])
                        )) {
                            this.element.style.background = `url("tileImages/revPolDouble.png") no-repeat center/70% 70%`;
                        }
                        if (mineIndex[this.type] == 1 && game.flagCarousel[this.flagged] == 2) {
                            this.element.style.background = `url("tileImages/uncheckedSingle.png") no-repeat center/70% 70%`;
                        }
                        if (mineIndex[this.type] == 2 && game.flagCarousel[this.flagged] == 1) {
                            this.element.style.background = `url("tileImages/uncheckedDouble.png") no-repeat center/70% 70%`;
                        }
                    }
                } else if (this.type.includes("ine")) {
                    this.countStyle("F");
                }
                return;
        }
        if (event != "a") {
            if (event.button == 2 && !this.counted) {
                this.flagged = (this.flagged + 1) % game.flagCarousel.length;
                if (game.flagCarousel[this.flagged] != 0) {
                    // ++game.flags[getFlagName(game.flagCarousel[this.flagged])];
                    this.element.style.background = `url("tileImages/${getFlagName(game.flagCarousel[this.flagged])}.png") no-repeat center/70% 70%`;
                } else {
                    //--game.flags;
                    this.element.style.background = "grey";
                }
                updateFlags();
                return;
            }
        } else {
            if (mineIndex[this.type] != game.flagCarousel[this.flagged]) {
                this.flagged = false;
                this.element.style.background = "lightgrey";
                updateFlags()
            }
        }

        if (this.counted || this.flagged) return;
        this.counted = true;
        if (this.type.includes("ine")) {
            this.countStyle("F");
            game.state = -1;
            this.element.style.backgroundColor = "red";
            this.element.removeEventListener("mouseup", this.handler, true);
            return;
        }
        let hasMines = false;
        let count = 0;
        detections.forEach(detectType => {
            let myDetection = detectType.detection;
            
            // flip the for loops so the mines have correct detection
            for (var y = myDetection.length - 1; y >= 0; y -= 1) {
                for (var x = 0; x < myDetection[0].length; ++x) {
                    let res = dualIndexAsOffsetFromCentre(myDetection, y, myDetection[0].length - x - 1);
                    let offY = res[0];
                    let offX = res[1];
                    let checkY = this.y + offY;
                    let checkX = this.x + offX;
                    
                    if (validDualIndex(checkY, checkX)) {
                        if (board[checkY][checkX].type == detectType.type) {
                            let val = myDetection[y][x];
                            hasMines = true;
                            if (val != "X") {
                                count += parseInt(val);
                            } else {
                                count = "F";
                                this.countStyle("F");
                                game.state = -1;
                                return;
                            }
                        }
                    }
                } 
            }
        })
        ++game.cleared;
        if (count.toString().includes("F")) return;
        if (count == 0 && hasMines) {
            this.countStyle("Z");
            updateFlags();
            return;
        } else if (count == 0) {
            for (var y = 0; y < defaultMineDetection.length; ++y) {
                for (var x = 0; x < defaultMineDetection[0].length; ++x) {
                    let res = dualIndexAsOffsetFromCentre(defaultMineDetection, y, x);
                    let offY = res[0];
                    let offX = res[1];
                    if (offX == 0 && offY == 0) continue;
                    let checkY = this.y + offY;
                    let checkX = this.x + offX;
                    if (validDualIndex(checkY, checkX)) {
                        board[checkY][checkX].countMines("a");
                    }
                } 
            }
        }
        this.countStyle(count);
        updateFlags();
    }
}

boardDiv.style.gridTemplateColumns = `repeat(${boardWidth}, 1fr)`;
for (var y = 0; y < boardHeight; y++) {
    var row = [];
    for (var x = 0; x < boardWidth; x++) {
        var tile = new Tile(y, x);

        row.push(tile);
        boardDiv.appendChild(tile.element);
    }

    board.push(row);
}

updateFlags();
document.addEventListener('contextmenu', event => event.preventDefault());