'use strict';

var NUMBER_OF_GUESSES;
var WORD_LENGTH;

const roomSubscriptions = [];

let currentGuess = [];
let colorCheckmark = [];
let arrayCheckpoint = [];
let gameCode;
let roomId;
let scorePrize;
let guessesRemaining;
let rightGuessString;
let nextLetter = 0;
let playerCount = 0;
let readyCount = 0
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
      toastr.error("Something went wrong when joining the game. You will be directed back to home.");
      setTimeout(() => {
        window.location.assign("/Home.html");
      }, 3000);
    }
  });

  $.ajax({
    type: "PUT",
    url: `${URL}:8080/Player/${sessionStorage.getItem("idUser")}`,
    data: JSON.stringify({ status: "Playing" }),
    dataType: 'json',
    contentType: 'application/json',
    success: function (result) {

    },
    error: function (jqXHR) {
      console.log(`Error when updating player status: ${JSON.parse(jqXHR.responseText).messages}`);
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

      playerCount = 0;
      for (let i = 0; i < room.playerNames.length; i++) {
        $(`#invite-icon-${i}`).addClass("hidden");
        $(`#player-name-${i}`).text(room.playerNames[i]);
        $(`.player`).eq(i).removeClass("vacant");
        playerCount += 1;
        if (room.playerIds[i] == sessionStorage.getItem("idGuest")) {
          playerSeat = i;
        }
      }

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

      if (sessionStorage.getItem("isPlaying") == "true") {
        $(".modal-overlay").hide();
        setKeyboardListener();
        setInviteListener();
      } else if (playerCount >= 4) {
        startGame();
      } else {
        setInviteListener();
        $(".modal-overlay").css("display", "flex");

        document.removeEventListener("keyup", keyupHandler);
        document.removeEventListener("keyboard-cont", keyboardContHandler);
      }

      if (sessionStorage.getItem("checkpoint") && sessionStorage.getItem("colorCheckmark")) {
        colorCheckmark = JSON.parse(sessionStorage.getItem("colorCheckmark"));
        arrayCheckpoint = JSON.parse(sessionStorage.getItem("checkpoint"));

        for (let i = 0; i < arrayCheckpoint.length; i++) {

          let row = document.getElementsByClassName("letter-row")[i];
          guessesRemaining--;

          for (let j = 0; j < arrayCheckpoint[i][2].length; j++) {
            let box = row.children[j];
            box.textContent = arrayCheckpoint[i][1][j];
            let delay = 0;
            setTimeout(() => {
              //flip box
              box.style.backgroundColor = arrayCheckpoint[i][2][j];
              animateCSS(box, "flipInX");
              //shade box
              shadeKeyBoard(box.textContent, arrayCheckpoint[i][2][j]);
            }, delay);
          }
        }
      }

    },
    error: function (_jqXHR) {
      toastr.warning("System failed to load the room data. You will be directed back to home.");
      setTimeout(() => {
        window.location.assign("/Home.html");
      }, 3000);
    }

  });
}

function setInviteListener() {
  $(".player").off("click");

  if (sessionStorage.getItem("idUser") && sessionStorage.getItem("isPlaying") != "true") {
    $(".player:not(.vacant)").css("cursor", "default");
    $(".vacant").css("cursor", "pointer");

    $(".vacant").on("click", function () {
      getOnlineFriend();
      $(".friend-req-container").css('display', 'flex');
    });

    $("#close-req").on("click", function () {
      $(".friend-req-container").hide();
    });
  } else {
    $(".player").css("cursor", "default");
  }

}

function getOnlineFriend() {
  $.ajax({
    type: "GET",
    url: `${URL}:8080/Friends/${sessionStorage.getItem("idUser")}`,
    dataType: 'json',
    success: function (result) {
      $(".list-req").empty();
      let friendList = result.payload;

      for (let i = 0; i < friendList.length; i++) {
        if (friendList[i].status === "Offline") {
          continue;
        }

        let syntax = $('<div>', {
          'class': 'orang',
          'data-idFriend': friendList[i].userId
        }).append(
          $('<div>', { 'class': 'avatar-req' }),
          $('<b>').append(
            $('<p>', { id: 'friendName' }).text(friendList[i].name)
          ),
          $('<p>', { id: 'friendScore' }).text(friendList[i].score),
          $('<button>', {
            'class': `invite${friendList[i].status === "Playing" ? ' disabled' : ''}`
          }).text('Invite')
        );

        $(".list-req").append(syntax);
      }


      $(".invite").on("click", function (e) {
        let friendId = $(e.target).closest(".orang").attr("data-idFriend");
        userClient.send("/app/invite", {}, JSON.stringify({ sender: sessionStorage.getItem("username"), content: roomId, guestId: friendId }));
      });
    },
    error: function (jqXHR) {
      toastr.warning("System can't load the friend list. Consider to refresh the page")
    }
  });
}

function removeDivElements() {
  $(".board-relative").empty();
  $("#game-result").empty();
  colorCheckmark.length = 0;
}

function initBoard() {

  for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
    let row = document.createElement("div");
    row.className = "letter-row";

    for (let j = 0; j < WORD_LENGTH; j++) {
      let box = document.createElement("div");
      box.className = "letter-box";
      row.appendChild(box);
    }

    $(".board-relative").append(row);
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
  $("#game-result").append(row);

}

function shadeKeyBoard(letter, color) {
  for (const elem of document.getElementsByClassName("keyboard-button")) {
    if (elem.textContent === letter) {
      let oldColor = elem.style.backgroundColor;

      // rgb(60, 226, 77) = green || rgb(226, 167, 20) & #e2a714 = yellow gold || rgba(245, 245, 245, 0.500) & #f5f5f580 = gray
      if (oldColor === "rgb(60, 226, 77)" || (color === "#e2a714" && oldColor === "rgb(226, 167, 20)") || (color === "#f5f5f580" && oldColor === "rgb(226, 167, 20)" || oldColor === "rgba(245, 245, 245, 0.500)")) {
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
        roomClient.send("/app/game.answer", {}, JSON.stringify({ gameCode: gameCode, content: guessString, guestId: sessionStorage.getItem("idGuest") }))
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
  let data = JSON.parse(payload.body);
  currentGuess = data.content;
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
      letterColor[i] = "#f5f5f580"; // gray color
    }
  }

  arrayCheckpoint.push([data.guestId, currentGuess, letterColor]);

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

  let lastGuesser = false;
  let mostActive = findMostActivePlayer(arrayCheckpoint).includes(sessionStorage.getItem("idGuest")) ? true : false;

  if (correctCount === WORD_LENGTH) {
    scorePrize = scorePrize + guessesRemaining * 10;
    $("#result-desc").text(`You managed to guess the word in ${NUMBER_OF_GUESSES - guessesRemaining} try`);
    $("#result-title").text(`Point Gain`);
    $("#result-point").css(`color`, '#3CE24D');
    $("#result-point").text(`+${scorePrize}`);
    lastGuesser = arrayCheckpoint[arrayCheckpoint.length - 1][0] == sessionStorage.getItem("idGuest") ? true : false;
  } else {
    scorePrize = 0 - scorePrize / 2 + correctCount * 5;
    $("#result-desc").text(`You managed to guess ${correctCount} letters`);
    $("#result-title").text(`Point Lose`);
    $("#result-point").css(`color`, 'crimson');
    $("#result-point").text(`${scorePrize}`);
  }

  let bonus = 0;
  if (lastGuesser && mostActive) {
    bonus = 50;
    $("#result-bonus").text("Bonus last guesser & most active");
  } else if (lastGuesser) {
    bonus = 30;
    $("#result-bonus").text("Bonus last guesser");
  } else if (mostActive) {
    bonus = 20;
    $("#result-bonus").text("Bonus most active");
  }

  let scoreNow = scorePrize;
  scorePrize += bonus;

  setTimeout(() => {

    $(".result-container").css('display', 'flex');
    $(".response-leave").removeClass('disabled');

    if (bonus != 0) {
      setTimeout(() => {
        $("#result-bonus").removeClass("hidden");
        let delay = 100;
        let accelerationRate = 2; // The rate at which the interval delay accelerates
        var timer = setInterval(function () {
          if (bonus > 0) {
            scoreNow += 1;
            bonus -= 1;
            delay -= accelerationRate; // Decrease the delay by the acceleration rate
            if (correctCount === WORD_LENGTH) {
              $("#result-point").text(`+${scoreNow}`);
            } else {
              $("#result-point").text(`${scoreNow}`);
            }
          } else {
            clearInterval(timer);
          }
        }, delay);
      }, 1000);
    }

  }, (250 * (WORD_LENGTH + 3)));
}

function findMostActivePlayer(arrayCheckpoint) {
  // Membuat objek penghitung
  let counter = {};

  // Menghitung kemunculan setiap angka
  arrayCheckpoint.forEach((checkpoint) => {
    if (counter[checkpoint[0]]) {
      counter[checkpoint[0]]++;
    } else {
      counter[checkpoint[0]] = 1;
    }
  });

  let mostFrequentPlayer = [];
  let maxCount = 0;

  // Mencari angka yang paling sering muncul
  for (let id in counter) {
    if (counter[id] > maxCount) {
      mostFrequentPlayer = [id];
      maxCount = counter[id];
    } else if (counter[id] === maxCount) {
      mostFrequentPlayer.push(id);
    }
  }

  return mostFrequentPlayer;
}

function saveGameResult(status, scoreFinal) {
  $.ajax({
    type: "POST",
    url: `${URL}:8080/History`,
    data: JSON.stringify({ gameId: roomId, playerId: sessionStorage.getItem('idGuest'), scoreGain: scoreFinal }),
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
    data: JSON.stringify({ win: status }),
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

const keyupHandler = (e) => {
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
};

const keyboardContHandler = (e) => {
  const target = e.target;

  if (!target.classList.contains("keyboard-button")) {
    return;
  }

  let key = target.textContent;

  if (key === "Del") {
    key = "Backspace";
  }

  document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
};

function setKeyboardListener() {
  document.addEventListener("keyup", keyupHandler);
  document.getElementById("keyboard-cont").addEventListener("click", keyboardContHandler);
}

const messageInput = document.querySelector('#message');
const messageArea = document.querySelector('#messageArea');
const connectingElement = document.querySelector('.connecting');

let roomClient = null;
let username = null;

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
      toastr.warning("Something went wrong when trying to leave the game");
    }
  });

  if (roomClient) {
    roomClient.send("/app/chat.send", {}, JSON.stringify({ sender: username, content: playerSeat, type: 'LEAVE', gameCode: gameCode }));
    roomSubscriptions.forEach((subscriptionId) => {
      roomClient.unsubscribe(subscriptionId);
    });
    roomClient.disconnect();
  }

  if (!isLeaving) {
    sessionStorage.setItem("checkpoint", JSON.stringify(arrayCheckpoint));
    sessionStorage.setItem("colorCheckmark", JSON.stringify(colorCheckmark));
  }
}

function connect() {
  username = sessionStorage.getItem('username');

  if (username && gameCode) {
    let socket = new SockJS(`${URL}:8080/play`);
    roomClient = Stomp.over(socket);

    roomClient.connect({}, onConnected, onError);
    window.addEventListener('beforeunload', onDisconnect);
  }
}

function onConnected() {
  // Subscribe to the Room Topic
  const chatroom = roomClient.subscribe(`/room/${gameCode}/chatroom`, onMessageReceived);
  roomSubscriptions.push(chatroom.id);

  const answer = roomClient.subscribe(`/room/${gameCode}/answer`, onWordReceived);
  roomSubscriptions.push(answer.id);

  const ready = roomClient.subscribe(`/room/${gameCode}/ready`, onReadyReceived);
  roomSubscriptions.push(ready.id);

  //  Notification when player joins the room
  roomClient.send("/app/chat.register", {}, JSON.stringify({ sender: username, type: 'JOIN', gameCode: gameCode }));

  connectingElement.classList.add('hidden');
}

function onError(_error) {
  connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
  connectingElement.style.color = 'red';
}

function sendChat(event) {
  var messageContent = messageInput.value.trim();
  if (messageContent && roomClient) {
    var chatMessage = {
      sender: username,
      content: messageContent,
      type: 'CHAT',
      gameCode: gameCode
    };

    roomClient.send("/app/chat.send", {}, JSON.stringify(chatMessage));
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
    resetReady();
    toastr.success(`${message.sender} has joined the room`);

  } else if (message.type === 'LEAVE') {
    $(`#invite-icon-${message.content}`).removeClass("hidden"); // remove player from seat
    $(`#player-name-${message.content}`).text("Invite");
    $(`.player`).eq(message.content).addClass("vacant");
    messageElement.classList.add('event-message');
    message.content = message.sender + ' left!';
    toastr.error(`${message.sender} has leaved the room`);
    setInviteListener();
    resetReady();
    playerCount -= 1;

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

$("#vote-btn").on("click", function () {
  $("#vote-btn").toggleClass('ready');

  roomClient.send("/app/game.ready", {}, JSON.stringify({ sender: playerSeat, content: $("#vote-btn").text(), gameCode: gameCode }));

  if ($("#vote-btn").hasClass("ready")) {
    $("#vote-btn").text("Cancel");
    $(".player-ready").eq(playerSeat).css("display", "block");

    if (readyCount == (playerCount - 1) && playerCount != 1) {
      $.ajax({
        type: "PUT",
        url: `${URL}:8080/Game/${gameCode}`,
        data: "Closed",
        dataType: 'json',
        contentType: 'application/json',
        success: function (result) {

        },
        error: function (jqXHR) {
          toastr.error("Something went wrong when closing the game");
        }
      });
    }

  } else {
    $("#vote-btn").text("Ready");
    $(".player-ready").eq(playerSeat).hide();
  }

});

function resetReady() {
  readyCount = 0;
  $(".player-ready").hide();
  $("#vote-btn").removeClass("ready");
  $("#vote-btn").text("Ready");
}

function onReadyReceived(payload) {
  let log = JSON.parse(payload.body);

  if (log.content == "Ready") {
    $(".player-ready").eq(log.sender).css("display", "block");
    readyCount += 1;

    if (readyCount == playerCount && playerCount != 1) {
      startGame();
    }

  } else {
    $(".player-ready").eq(log.sender).hide();
    readyCount -= 1;
  }
}

function startGame() {
  sessionStorage.setItem("isPlaying", "true");
  $(".modal-overlay").empty();
  setInviteListener();
  resetReady();
  let container = $(".modal-overlay"); // Ganti dengan ID kontainer Anda
  container.css("font-size", "24px")
  let hitungan = 5;
  var timer = setInterval(function () {
    if (hitungan > 0) {
      container.text("Game will start in " + hitungan);
      hitungan -= 1;
    } else {
      clearInterval(timer);
      container.text("Good luck!");
      setTimeout(() => {
        setKeyboardListener();
        $(".modal-overlay").hide();
      }, 1000)
    }
  }, 1000);
}

function leaveRoom() {
  isLeaving = true;
  sessionStorage.removeItem("gameCode");
  sessionStorage.removeItem("roomId");
  sessionStorage.removeItem("checkpoint");
  sessionStorage.removeItem("colorCheckmark");
  sessionStorage.removeItem("isPlaying");
  window.location.assign("/Home.html");
}

$(".giveUp-btn").on('click', function () {
  $(".confirmation-container").css("display", "flex");
});

$("#game-title").on('click', function () {
  $(".confirmation-container").css("display", "flex");
});

$("#confirmation-play").on('click', function () {
  $(".confirmation-container").hide();
});

$(".response-leave").on('click', leaveRoom);