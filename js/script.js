import { WORDS_5 } from "./words-5.js";
import { WORDS_6 } from "./words-6.js";
import { WORDS_7 } from "./words-7.js";
import { WORDS_8 } from "./words-8.js";
import { WORDS_9 } from "./words-9.js";
import { WORDS_10 } from "./words-10.js";

const NUMBER_OF_GUESSES = 8;
const WORD_LENGTH = 5;
const ARRAYS = {
  WORDS_5,
  WORDS_6,
  WORDS_7,
  WORDS_8,
  WORDS_9,
  WORDS_10
};

let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = ARRAYS[`WORDS_${WORD_LENGTH}`][Math.floor(Math.random() * ARRAYS[`WORDS_${WORD_LENGTH}`].length)];

console.log(rightGuessString);

function initBoard() {
  let board = document.getElementById("game-board");

  for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
    let row = document.createElement("div");
    row.className = "letter-row";

    for (let j = 0; j < WORD_LENGTH; j++) {
      let box = document.createElement("div");
      box.className = "letter-box";
      row.appendChild(box);
    }

    board.appendChild(row);
  }
}

function shadeKeyBoard(letter, color) {
  for (const elem of document.getElementsByClassName("keyboard-button")) {
    if (elem.textContent === letter) {
      let oldColor = getComputedStyle(elem).backgroundColor;
      if (oldColor === "rgb(60, 226, 77)") {
        return;
      }
      
      // if (oldColor === "rgb(226, 167, 20)" && color !== "rgb(60, 226, 77)") {
      //   return;
      // }

      elem.style.backgroundColor = color;
      break;
    }
  }
}

function deleteLetter() {
  let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
  let box = row.children[nextLetter - 1];
  box.textContent = "";
  box.classList.remove("filled-box");
  currentGuess.pop();
  nextLetter -= 1;
}

function checkGuess() {
  let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
  let guessString = "";
  let rightGuess = Array.from(rightGuessString);

  for (const val of currentGuess) {
    guessString += val;
  }

  if (guessString.length != WORD_LENGTH) {
    toastr.error("Not enough letters!");
    return;
  }

  // if (!ARRAYS[`WORDS_${WORD_LENGTH}`].includes(guessString)) {
  //   toastr.error("Word not in list!");
  //   return;
  // }

  var letterColor = [];

  //check green
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (rightGuess[i] == currentGuess[i]) {
      letterColor[i] = "#3CE24D"; //dark green color
      rightGuess[i] = "#";
    }
  }

  //check yellow
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (letterColor[i] == "#3CE24D") continue;

    if (rightGuess.includes(currentGuess[i])) {
      letterColor[i] = "#e2a714"; // yellow gold color
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    let box = row.children[i];
    let delay = 250 * i;
    setTimeout(() => {
      //flip box
      animateCSS(box, "flipInX");
      //shade box
      box.style.backgroundColor = letterColor[i];
      shadeKeyBoard(guessString.charAt(i) + "", letterColor[i]);
    }, delay);
  }

  if (guessString === rightGuessString) {
    toastr.success("You guessed right! Game over!");
    guessesRemaining = 0;
    return;
  } else {
    guessesRemaining -= 1;
    currentGuess = [];
    nextLetter = 0;

    if (guessesRemaining === 0) {
      toastr.error("You've run out of guesses! Game over!");
      toastr.info(`The right word was: "${rightGuessString}"`);
    }
  }
}

function insertLetter(pressedKey) {
  if (nextLetter === WORD_LENGTH) {
    return;
  }
  pressedKey = pressedKey.toLowerCase();

  let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
  let box = row.children[nextLetter];
  animateCSS(box, "pulse");
  box.textContent = pressedKey;
  box.classList.add("filled-box");
  currentGuess.push(pressedKey);
  nextLetter += 1;
}

const animateCSS = (element, animation, prefix = "animate__") =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element;
    node.style.setProperty("--animate-duration", "0.3s");

    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve("Animation ended");
    }

    node.addEventListener("animationend", handleAnimationEnd, { once: true });
  });

document.addEventListener("keyup", (e) => {
  let pressedKey = String(e.key);
  if (guessesRemaining === 0 || document.activeElement === document.getElementById("message")) {
    return;
  } else if (pressedKey === "Backspace" && nextLetter !== 0) {
    deleteLetter();
  } else if (pressedKey === "Enter") {
    checkGuess();
  } else if (pressedKey.match(/[a-z]/gi) && pressedKey.match(/[a-z]/gi).length == 1) {
    insertLetter(pressedKey);
  } else {
    return;
  }
});

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
  const target = e.target;

  if (!target.classList.contains("keyboard-button")) {
    return;
  }
  
  let key = target.textContent;

  if (key === "Del") {
    key = "Backspace";
  }

  document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
});

initBoard();