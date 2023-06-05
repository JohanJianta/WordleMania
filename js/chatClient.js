'use strict';

// const messageInput = document.querySelector('#message');
// const messageArea = document.querySelector('#messageArea');
// const connectingElement = document.querySelector('.connecting');

// var stompClient = null;
// var username = null;
// var roomId = null;

// const colors = [
//     '#2196F3', '#32c787', '#00BCD4', '#ff5652',
//     '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
// ];

// function connect() {
//     roomId = JSON.parse(sessionStorage.getItem("roomData")).payload.id;
//     username = sessionStorage.getItem('username');

//     if (username && roomId) {
//         var socket = new SockJS('http://localhost:8080/play');
//         stompClient = Stomp.over(socket);

//         stompClient.connect({}, onConnected, onError);
//         window.addEventListener('beforeunload', onDisconnect);
//     }
// }


// function onConnected() {
//     // Subscribe to the Public Topic
//     stompClient.subscribe(`/room/${roomId}/chatroom`, onMessageReceived);
//     stompClient.subscribe(`/room/${roomId}/setting`, onSettingReceived);
//     // stompClient.subscribe('/topic/answer', onWordReceived);

//     // Tell your username to the server
//     stompClient.send("/app/chat.register", {}, JSON.stringify({ sender: username, type: 'JOIN', roomId: roomId }))
//     stompClient.send("/app/game.keyword", {}, JSON.stringify({ roomId: roomId, requestedLength: 6 }))

//     connectingElement.classList.add('hidden');
// }

// function onError(error) {
//     connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
//     connectingElement.style.color = 'red';
// }

// function onDisconnect() {
//     if (stompClient) {
//         stompClient.send("/app/chat.send", {}, JSON.stringify({ sender: username, type: 'LEAVE' }));
//         stompClient.disconnect();
//     }
// }

// function sendChat() {
//     var messageContent = messageInput.value.trim();
//     if (messageContent && stompClient) {
//         var chatMessage = {
//             sender: username,
//             content: messageInput.value,
//             type: 'CHAT'
//         };

//         stompClient.send("/app/chat.send", {}, JSON.stringify(chatMessage));
//         messageInput.value = '';
//     }
// }

// function onMessageReceived(payload) {
//     var message = JSON.parse(payload.body);

//     var messageElement = document.createElement('li');

//     if (message.type === 'JOIN') {
//         messageElement.classList.add('event-message');
//         message.content = message.sender + ' joined!';
//     } else if (message.type === 'LEAVE') {
//         messageElement.classList.add('event-message');
//         message.content = message.sender + ' left!';
//     } else {
//         messageElement.classList.add('chat-message');

//         var avatarElement = document.createElement('i');
//         var avatarText = document.createTextNode(message.sender[0]);
//         avatarElement.appendChild(avatarText);
//         avatarElement.style['background-color'] = getAvatarColor(message.sender);

//         messageElement.appendChild(avatarElement);

//         var usernameElement = document.createElement('span');
//         var usernameText = document.createTextNode(message.sender);
//         usernameElement.appendChild(usernameText);
//         messageElement.appendChild(usernameElement);
//     }

//     var textElement = document.createElement('p');
//     var messageText = document.createTextNode(message.content);
//     textElement.appendChild(messageText);

//     messageElement.appendChild(textElement);

//     messageArea.appendChild(messageElement);
//     messageArea.scrollTop = messageArea.scrollHeight;
// }

// function getAvatarColor(messageSender) {
//     var hash = 0;
//     for (var i = 0; i < messageSender.length; i++) {
//         hash = 31 * hash + messageSender.charCodeAt(i);
//     }

//     var index = Math.abs(hash % colors.length);

//     return colors[index];
// }

// function onSettingReceived(payload) {
//     rightGuessString = payload;
//     console.log(rightGuessString);
// }

function showChat() {
    document.getElementById("chat-panel").classList.toggle('active');
    document.getElementById("side-panel-toggle").classList.toggle('move');
}

// connect();