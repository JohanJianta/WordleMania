'use strict';

var NUMBER_OF_GUESSES;
var WORD_LENGTH;

let currentGuess = [];
let colorCheckmark = [];
let arrayCheckpoint = [];
let gameCode;
let roomId;
let scorePrize;
let guessesRemaining;
let rightGuessString;
let nextLetter = 0;
let playerSeat;
let isLeaving = false;


window.onload = () => {
  if (!sessionStorage.getItem("gameCode")) {
    window.location.assign("/Home.html");
  }

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

      for (let i = 0; i < room.playerNames.length; i++) {
        $(`#invite-icon-${i}`).addClass("hidden");
        $(`#player-name-${i}`).text(room.playerNames[i]);
        $(`.player`).eq(i).removeClass("vacant");
        if (room.playerIds[i] == sessionStorage.getItem("idGuest")) {
          playerSeat = i;
        }
      }

      setInviteListener();

      if (roomId != room.roomId || NUMBER_OF_GUESSES != room.guessesTry || rightGuessString != room.word.toLowerCase()) {
        if ((roomId != null && NUMBER_OF_GUESSES != null && rightGuessString != null) || sessionStorage.getItem("roomId") != room.roomId) {
          sessionStorage.removeItem("checkpoint");
          sessionStorage.removeItem("colorCheckmark");
          sessionStorage.setItem("roomId", room.roomId);
        }

        gameCode = room.gameCode;
        roomId = room.roomId;
        NUMBER_OF_GUESSES = room.guessesTry;
        guessesRemaining = room.guessesTry;
        rightGuessString = room.word.toLowerCase();
        WORD_LENGTH = room.word.length;
        scorePrize = room.score;

        removeDivElements();
        initBoard();
      }

      if (sessionStorage.getItem("checkpoint") && sessionStorage.getItem("colorCheckmark")) {
        colorCheckmark = JSON.parse(sessionStorage.getItem("colorCheckmark"));
        arrayCheckpoint = JSON.parse(sessionStorage.getItem("checkpoint"));

        for (let i = 0; i < arrayCheckpoint.length; i++) {

          let row = document.getElementsByClassName("letter-row")[i];
          guessesRemaining--;

          for (let j = 0; j < arrayCheckpoint[i][1].length; j++) {
            let box = row.children[j];
            box.textContent = arrayCheckpoint[i][0][j];
            let delay = 0;
            setTimeout(() => {
              //flip box
              box.style.backgroundColor = arrayCheckpoint[i][1][j];
              animateCSS(box, "flipInX");
              //shade box
              shadeKeyBoard(box.textContent, arrayCheckpoint[i][1][j]);
            }, delay);
          }
        }
      }

    },
    error: function (_jqXHR) {
      console.log("Can't load player. Please re-join the room")
    }

  });
}

function setInviteListener() {
  $.ajax({
    type: "GET",
    url: `${URL}:8080/Friends/${sessionStorage.getItem("idUser")}`,
    dataType: 'json',
    success: function (result) {
      $(".list-req").empty();
      let friendList = result.payload;
      let syntax;
      for (let i = 0; i < friendList.length; i++) {
        syntax = `<div class="orang" data-idFriend="${friendList[i].id}">
        <div class="avatar-req"></div>

        <b>
            <p id=friendName>${friendList[i].name}</p>
        </b>

        <p id="friendScore">${friendList[i].score}</p>

        <button>Invite</button>
    </div>`;

        $(".list-req").append(syntax);
      }
    },
    error: function (jqXHR) {
      toastr.warning("System can't load the friend list. Consider to refresh the page")
    }
  });

  $(".player:not(.vacant)").off("click");
  $(".player:not(.vacant)").css("cursor","default");

  $(".vacant").on("click", function () {
    $(".friend-req-container").css('display', 'flex');
  });

  $("#close-req").on("click", function () {
    $(".friend-req-container").hide();
  });
}

function removeDivElements() {
  $("#game-board").empty();
  $("#game-result").empty();
  colorCheckmark.length = 0;
}

function initBoard() {
  let board = document.getElementById("game-board");
  let result = document.getElementById("game-result");

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

  let row = document.createElement("div");
  row.className = "letter-row";
  for (let i = 0; i < WORD_LENGTH; i++) {
    let box = document.createElement("div");
    box.className = "letter-box";
    box.innerText = rightGuessString[i];
    row.appendChild(box);
    colorCheckmark.push("whitesmoke");
  }
  result.appendChild(row);

}

function shadeKeyBoard(letter, color) {
  for (const elem of document.getElementsByClassName("keyboard-button")) {
    if (elem.textContent === letter) {
      let oldColor = elem.style.backgroundColor;

      if (oldColor === "rgb(60, 226, 77)" || color === "whitesmoke" || (color === "#e2a714" && oldColor === "rgb(226, 167, 20)")) {
        return;
      }

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
  let rowCheckpoint = NUMBER_OF_GUESSES - guessesRemaining;
  let row = document.getElementsByClassName("letter-row")[rowCheckpoint];
  let rightGuess = Array.from(rightGuessString);
  var letterColor = [];

  //check green
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (rightGuess[i] == currentGuess[i]) {
      letterColor[i] = "#3CE24D"; //dark green color
      rightGuess[i] = "#";
      colorCheckmark[i] = "#3CE24D";
    }
  }

  //check yellow
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (letterColor[i] == "#3CE24D") continue;

    if (rightGuess.includes(currentGuess[i])) {
      letterColor[i] = "#e2a714"; // yellow gold color
    } else {
      letterColor[i] = "whitesmoke";
    }
  }

  arrayCheckpoint.push([currentGuess, letterColor]);

  for (let i = 0; i < WORD_LENGTH; i++) {
    let box = row.children[i];
    box.textContent = currentGuess[i];
    let delay = 250 * i;
    setTimeout(() => {
      //flip box
      box.style.backgroundColor = letterColor[i];
      animateCSS(box, "flipInX");
      //shade box
      shadeKeyBoard(box.textContent, letterColor[i]);
    }, delay);
  }

  guessesRemaining -= 1;

  if (currentGuess === rightGuessString) {
    toastr.success("You guessed right! Congratulation!");
    showGameResult();
    saveGameResult(true, scorePrize);
    guessesRemaining = 0;
  } else {
    currentGuess = [];
    nextLetter = 0;

    if (guessesRemaining === 0) {
      toastr.error("You've run out of guesses! Game over!");
      toastr.info(`The right word is "${rightGuessString}"`);
      showGameResult();
      saveGameResult(false, scorePrize);
    }
  }
}

function showGameResult() {
  let letterBoxes = $("#game-result").find(".letter-box");
  let correctCount = 0;
  for (let i = 0; i < colorCheckmark.length; i++) {
    $(letterBoxes[i]).css("background-color", colorCheckmark[i]);
    if (colorCheckmark[i] === "#3CE24D") {
      correctCount += 1;
    }
  }

  if (correctCount === WORD_LENGTH) {
    scorePrize = scorePrize + guessesRemaining * 10;
    $("#result-desc").text(`You managed to guess the word in ${NUMBER_OF_GUESSES - guessesRemaining} try`);
    $("#result-title").text(`Point Gain`);
    $("#result-point").css(`color`, '#3CE24D');
    $("#result-point").text(`+${scorePrize}`);
  } else {
    scorePrize = 0 - scorePrize / 2 + correctCount * 10;
    $("#result-desc").text(`You managed to guess ${correctCount} letters`);
    $("#result-title").text(`Point Lose`);
    $("#result-point").css(`color`, 'crimson');
    $("#result-point").text(`${scorePrize}`);
  }

  setTimeout(() => {

    $(".result-container").css('display', 'flex');

  }, (250 * (WORD_LENGTH + 3)));
}

function saveGameResult(status, scoreFinal) {
  $.ajax({
    type: "POST",
    url: `${URL}:8080/History`,
    data: JSON.stringify({ gameId: gameCode, playerId: roomId }),
    dataType: 'json',
    contentType: 'application/json',
    success: function (result) {
      // toastr.success("Game result successfully saved to history")
    },
    error: function (_jqXHR) {
      toastr.warning("Something went wrong while saving the result");
    }
  });

  $.ajax({
    type: "PUT",
    url: `${URL}:8080/Game/Data/${roomId}`,
    data: JSON.stringify({ win: status, scorePrize: scoreFinal }),
    dataType: 'json',
    contentType: 'application/json',
    success: function (result) {
      // toastr.success("Game result successfully saved")
    },
    error: function (_jqXHR) {
      toastr.warning("Something went wrong while saving the result");
    }
  });

  if (sessionStorage.getItem("idUser")) {
    $.ajax({
      type: "PUT",
      url: `${URL}:8080/Player/${sessionStorage.getItem("idUser")}`,
      data: JSON.stringify({ score: scoreFinal, totalPlay: 1, totalWin: status == true ? 1 : 0 }),
      dataType: 'json',
      contentType: 'application/json',
      success: function (result) {
        // toastr.success("Game result successfully saved")
      },
      error: function (_jqXHR) {
        toastr.warning("Something went wrong while updating user data");
      }
    });
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

const animateCSS = (element, animation, prefix = "animate__") => {
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
}

document.addEventListener("keyup", (e) => {
  let pressedKey = String(e.key);
  if (guessesRemaining === 0 || document.activeElement === document.getElementById("message")) {
    return;
  } else if (pressedKey === "Backspace" && nextLetter !== 0) {
    deleteLetter();
  } else if (pressedKey === "Enter") {
    checkGuess();
  } else if (pressedKey.match(/^[a-zA-Z]$/) && pressedKey.length === 1) {
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
    success: function (result) {

    },
    error: function (_jqXHR) {
      console.log("Something went wrong when trying to leave the game");
    }
  });

  if (!isLeaving) {
    if (stompClient) {
      stompClient.send("/app/chat.send", {}, JSON.stringify({ sender: username, content: playerSeat, type: 'LEAVE', gameCode: gameCode }));
      stompClient.disconnect();
    }
    sessionStorage.setItem("checkpoint", JSON.stringify(arrayCheckpoint));
    sessionStorage.setItem("colorCheckmark", JSON.stringify(colorCheckmark));
  }
}

function connect() {
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

$("#messageForm").submit(sendChat);

function getAvatarColor(messageSender) {
  var hash = 0;
  for (var i = 0; i < messageSender.length; i++) {
    hash = 31 * hash + messageSender.charCodeAt(i);
  }

  var index = Math.abs(hash % colors.length);

  return colors[index];
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
    $(`#invite-icon-${message.content}`).removeClass("hidden"); // remove player from seat
    $(`#player-name-${message.content}`).text("Invite");
    $(`.player`).eq(message.content).addClass("vacant");
    messageElement.classList.add('event-message');
    message.content = message.sender + ' left!';
    toastr.error(`${message.sender} has leaved the room`);
    setInviteListener();
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

function onSettingReceived(payload) {
  rightGuessString = payload.body;
  console.log(rightGuessString);
}

function leaveRoom() {
  isLeaving = true;
  sessionStorage.removeItem("gameCode");
  sessionStorage.removeItem("roomId");
  sessionStorage.removeItem("checkpoint");
  sessionStorage.removeItem("colorCheckmark");
  window.location.assign("/Home.html");
}

$(".giveUp-btn").on('click', function() {
  $(".confirmation-container").css("display", "flex");
});

$("#game-title").on('click', function() {
  $(".confirmation-container").css("display", "flex");
});

$("#confirmation-play").on('click', function() {
  $(".confirmation-container").hide();
});

$(".response-leave").on('click', leaveRoom);