const textPool = [
    "Something wicked this way comes",
    "Waiting for Fraud",
    "I will turn you into ashes.",
    "A young woman sits in her HTML div.",
    "FUCKING NIKKON",
    "I was programmed to see through walls but not lockers!?",
    "Elytra Wingsuits",
    "autistic introverted bisexual transfem once considered gifted",
    "REQUESTING SUPPORT...",
    "I don't take coupons from giant chickens...",
    "...not after what happened last time.",
    "Just hide bro",
    "SORRY, GONE FISHIN'!\n- SIZE 2",
    "you'll find my smoking body hung in wires overhead",
    "ts pmo 🥀" 
];

var randomTex = textPool[
    Math.floor(Math.random() * textPool.length)
];
document.getElementById("randomtext").innerText = randomTex;