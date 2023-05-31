'use strict';

const usernamePage = document.querySelector('#username-page');
const mainPage = document.querySelector('#main-page');
const usernameForm = document.querySelector('#usernameForm');
const messageForm = document.querySelector('#messageForm');
const gameForm = document.querySelector('#gameForm');
const messageInput = document.querySelector('#message');
const messageArea = document.querySelector('#messageArea');
const triesDisplay = document.querySelector('#triesDisplay');
const resultDisplay = document.querySelector('#resultDisplay');
const wordInput = document.querySelector('#word');
const connectingElement = document.querySelector('.connecting');

var stompClient = null;
var username = null;

let triesRemaining = 6;
var wordToGuess = "";

const colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function onKeywordReceived(payload) {
    if (payload.body.length == 6) {
        wordToGuess = payload.body;
        console.log("Cheat = " + payload.body);
        triesDisplay.innerHTML = triesRemaining;
    } else {
        console.log("Not enough player: " + payload.body);
    }
}

function connect(event) {
    username = document.querySelector('#name').value.trim();

    if (username) {
        usernamePage.classList.add('hidden');
        mainPage.classList.remove('hidden');
        mainPage.classList.add('main-page');

        var socket = new SockJS('http://localhost:8080/play');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
        window.addEventListener('beforeunload', onDisconnect);
    }
    event.preventDefault();
}


function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public', onMessageReceived);
    stompClient.subscribe('/topic/answer', onWordReceived);
    stompClient.subscribe('/topic/keyword', onKeywordReceived);

    // Tell your username to the server
    stompClient.send("/app/chat.register", {}, JSON.stringify({ sender: username, type: 'JOIN' }))
    stompClient.send("/app/player.count")

    connectingElement.classList.add('hidden');
}

function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}

function onDisconnect() {
    if (stompClient) {
        stompClient.send("/app/chat.send", {}, JSON.stringify({ sender: username, type: 'LEAVE' }));
        stompClient.disconnect();
    }
}


function sendChat(event) {
    var messageContent = messageInput.value.trim();
    if (messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
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
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
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


function checkWord(event) {
    // Get word user typed & convert to uppercase
    const word = wordInput.value.trim().toUpperCase();
    // Ignore if no tries remaining or empty word
    if (triesRemaining > 0 && word.length == 6 && !/[^\w\s]/.test(word) && !/\d/.test(word)) {
        console.log(word);
        var answer = {
            validWord: word
        };
        stompClient.send("/app/word", {}, JSON.stringify(answer));
        wordInput.value = '';
    }

    event.preventDefault();
}

function onWordReceived(payload) {
    var answer = JSON.parse(payload.body);
    showResult(answer.validWord);
}

function showResult(validWord) {    // display result
    let spanList = [];

    let guessLetters = wordToGuess.split("");
    let inputLetters = validWord.split("");

    // Check for correct letter first
    for (let i = 0; i < inputLetters.length; i++) {
        if (inputLetters[i] == guessLetters[i]) {
            spanList[i] = `<span id="answer" class="correct">${validWord[i]}</span> `;
            guessLetters[i] = 0;
            inputLetters[i] = 0;
        }
    }

    // Check for wrong place and incorrect letter last
    for (let i = 0; i < inputLetters.length; i++) {
        if (inputLetters[i] == 0) {
            continue;
        }

        if (guessLetters.includes(inputLetters[i])) {
            spanList[i] = `<span id="answer" class="wrongplace">${validWord[i]}</span> `;
        } else {
            spanList[i] = `<span id="answer" class="notpart">${validWord[i]}</span> `;
        }
    }

    let para = "</p>" + spanList.map(function (value) {
        return value;
    }).join("");

    triesRemaining--;

    if (validWord == wordToGuess) {
        alert("Congratulations you won!");
    } else if (triesRemaining == 0) {
        alert("You lose!");
    }

    triesDisplay.innerHTML = triesRemaining;

    // Show results 
    resultDisplay.innerHTML += para;
}

usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendChat, true)
gameForm.addEventListener('submit', checkWord, true)