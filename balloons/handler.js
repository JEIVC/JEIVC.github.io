let popSound = document.getElementById("popSound");
popSound.volume = 0.5;
popSound.load();

function balloonClick(element, numeral) {
    let parent = element.parentElement;
    let paragraphs = parent.getElementsByTagName('p');

    popSound.play();
    element.style.display = "none";
    setTimeout(() => {
        for (let x = 0; x < paragraphs.length; ++x) {
            paragraphs[x].classList.remove("disabled");
        }
    }, 2000);
    setTimeout(() => {
        document.getElementById("sy" + (numeral + 1).toString()).classList.remove("nodiv");
        if (numeral >= 5) {
            document.getElementById("sy" + (numeral + 1).toString()).getElementsByTagName("p")[0]
                .classList.remove("disabled");
        }
    }, 8000);
}

for (let i = 1; i <= 5; ++i) {
    let balloon = document.getElementById("sb" + i.toString());
    balloon.onclick = () => balloonClick(balloon, i);
}