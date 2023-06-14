const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;


function initBoard() {
    let board = document.getElementById("boards");

        
        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"

        }

        board.appendChild()
    
}

initBoard()

function hidepop() {
   $(".popUp-bgs").hide();
}