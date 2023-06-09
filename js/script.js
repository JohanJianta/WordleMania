'use strict';

const URL = "http://127.0.0.1";

var NUMBER_OF_GUESSES;
var WORD_LENGTH;

let guessesRemaining;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString;
let playerSeat;
let playerCount = 0;

let gameCode;
let roomId;

window.onload = () => {
  gameCode = sessionStorage.getItem("gameCode");
  $("#game-code").text(gameCode);

  $.ajax({
    type: "POST",
    url: `${URL}:8080/Game/Player`,
    data: JSON.stringify({ gameId: gameCode, playerId: sessionStorage.getItem("idGuest") }),
    dataType: 'json',
    contentType: 'application/json',
    success: function () {

      connect();

    },
    error: function (jqXHR) {
      toastr.error("Something went wrong when joining the game. Please try again.");
    }
  });
}

function loadRoomData() {
  $.ajax({
    type: "GET",
    url: `${URL}:8080/Game/Data/${gameCode}`,
    dataType: 'json',
    success: function (result) {
      let room = result.payload;

      for (playerCount; playerCount < room.playerNames.length; playerCount++) {
        $(`#invite-icon-${playerCount}`).addClass("hidden");
        $(`#player-name-${playerCount}`).text(room.playerNames[playerCount]);
        if (room.playerIds[playerCount] == sessionStorage.getItem("idGuest")) {
          playerSeat = playerCount;
        }
      }

      if (roomId != room.roomId || NUMBER_OF_GUESSES != room.guessesTry || rightGuessString != room.word.toLowerCase()) {
        gameCode = room.gameCode;
        roomId = room.roomId;
        NUMBER_OF_GUESSES = room.guessesTry;
        guessesRemaining = room.guessesTry;
        rightGuessString = room.word.toLowerCase();
        WORD_LENGTH = room.word.length;

        removeDivElements();
        initBoard();
      }

    },
    error: function (_jqXHR) {
      console.log("Can't load player. Please re-join the room")
    }

  });
}

function removeDivElements() {
  let rows = document.getElementsByClassName("letter-row");

  while (rows.length > 0) {
    rows[0].remove();
  }

  playerCount = 0;
}

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
  box.style.backgroundColor = "transparent";
  box.classList.remove("filled-box");
  currentGuess.pop();
  nextLetter -= 1;
}

function checkGuess() {
  let guessString = "";

  for (const val of currentGuess) {
    guessString += val;
  }

  if (guessString.length != WORD_LENGTH) {
    toastr.error("Not enough letters!");
    return;
  }

  $.ajax({
    type: "POST",
    url: `${URL}:8080/Word`,
    data: JSON.stringify(guessString),
    dataType: 'json',
    contentType: 'application/json',
    success: function (result) {
      if (result) {
        stompClient.send("/app/game.answer", {}, JSON.stringify({ gameCode: gameCode, content: guessString }))
      } else {
        toastr.error("Word is not in list!");
      }
    },
    error: function (_jqXHR) {
      toastr.error("Something went wrong while checking the word, please try again");
    }
  });
}

function onWordReceived(payload) {
  currentGuess = JSON.parse(payload.body).content;
  let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
  let rightGuess = Array.from(rightGuessString);
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
    box.textContent = currentGuess[i];
    let delay = 250 * i;
    setTimeout(() => {
      //flip box
      animateCSS(box, "flipInX");
      //shade box
      box.style.backgroundColor = letterColor[i];
      shadeKeyBoard(box.textContent, letterColor[i]);
    }, delay);
  }

  if (currentGuess === rightGuessString) {
    toastr.success("You guessed right! Congratulation!");
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
  box.style.backgroundColor = "whitesmoke";
  box.classList.add("filled-box");
  currentGuess.push(pressedKey);
  nextLetter += 1;
}

const animateCSS = (element, animation, prefix = "animate__") =>
  // We create a Promise and return it
  new Promise((resolve, _reject) => {
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

const messageInput = document.querySelector('#message');
const messageArea = document.querySelector('#messageArea');
const connectingElement = document.querySelector('.connecting');

var stompClient = null;
var username = null;

const colors = [
  '#2196F3', '#32c787', '#00BCD4', '#ff5652',
  '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function onDisconnect() {
  $.ajax({
    type: "PUT",
    url: `${URL}:8080/Game/Player`,
    data: JSON.stringify({ gameId: gameCode, playerId: sessionStorage.getItem("idGuest") }),
    dataType: 'json',
    contentType: 'application/json',
    success: function () {
      sessionStorage.removeItem("gameCode");
      if (stompClient) {
        stompClient.send("/app/chat.send", {}, JSON.stringify({ sender: username, content: playerSeat, type: 'LEAVE', gameCode: gameCode }));
        stompClient.disconnect();
      }
    },
    error: function (_jqXHR) {
      console.log("Something went wrong when trying to leave the game");
    }
  });
}

function connect() {
  // gameCode = JSON.parse(sessionStorage.getItem("gameCode")).payload.id;
  username = sessionStorage.getItem('username');

  if (username && gameCode) {
    var socket = new SockJS(`${URL}:8080/play`);
    stompClient = Stomp.over(socket);

    stompClient.connect({}, onConnected, onError);
    window.addEventListener('beforeunload', onDisconnect);
  }
}

function onConnected() {
  // Subscribe to the Public Topic
  stompClient.subscribe(`/room/${gameCode}/chatroom`, onMessageReceived);
  // stompClient.subscribe(`/room/${gameCode}/setting`, onSettingReceived);
  stompClient.subscribe(`/room/${gameCode}/answer`, onWordReceived);

  // Tell your username to the server
  stompClient.send("/app/chat.register", {}, JSON.stringify({ sender: username, type: 'JOIN', gameCode: gameCode }))
  // stompClient.send("/app/game.keyword", {}, JSON.stringify({ gameCode: gameCode, requestedLength: WORD_LENGTH }))

  connectingElement.classList.add('hidden');
}

function onError(_error) {
  connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
  connectingElement.style.color = 'red';
}

$("#messageForm").submit(sendChat);

function sendChat(event) {
  var messageContent = messageInput.value.trim();
  if (messageContent && stompClient) {
    var chatMessage = {
      sender: username,
      content: messageContent,
      type: 'CHAT',
      gameCode: gameCode
    };

    stompClient.send("/app/chat.send", {}, JSON.stringify(chatMessage));
    messageInput.value = '';
  }
  event.preventDefault();
}

function onMessageReceived(payload) {
  var message = JSON.parse(payload.body);

  var messageElement = document.createElement('li');

  if (message.type === 'JOIN') {
    messageElement.classList.add('event-message');
    message.content = message.sender + ' joined!';
    loadRoomData();
    toastr.success(`${message.sender} has joined the room`);
  } else if (message.type === 'LEAVE') {
    console.log("im here")
    $(`#invite-icon-${message.content}`).removeClass("hidden");
    $(`#player-name-${message.content}`).text("Invite");
    messageElement.classList.add('event-message');
    message.content = message.sender + ' left!';
    toastr.error(`${message.sender} has leaved the room`);
  } else {
    messageElement.classList.add('chat-message');

    var avatarElement = document.createElement('i');
    var avatarText = document.createTextNode(message.sender[0]);
    avatarElement.appendChild(avatarText);
    avatarElement.style['background-color'] = getAvatarColor(message.sender);

    messageElement.appendChild(avatarElement);

    var usernameElement = document.createElement('span');
    var usernameText = document.createTextNode(message.sender);
    usernameElement.appendChild(usernameText);
    messageElement.appendChild(usernameElement);
  }

  var textElement = document.createElement('p');
  var messageText = document.createTextNode(message.content);
  textElement.appendChild(messageText);

  messageElement.appendChild(textElement);

  messageArea.appendChild(messageElement);
  messageArea.scrollTop = messageArea.scrollHeight;
}

function getAvatarColor(messageSender) {
  var hash = 0;
  for (var i = 0; i < messageSender.length; i++) {
    hash = 31 * hash + messageSender.charCodeAt(i);
  }

  var index = Math.abs(hash % colors.length);

  return colors[index];
}

function onSettingReceived(payload) {
  rightGuessString = payload.body;
  console.log(rightGuessString);
}