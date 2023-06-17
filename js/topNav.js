'use strict';

let regex = /[a-zA-Z!@#$%^&*(),.?":{}|<>]/;

const URL = "http://127.0.0.1";
const userSubscriptions = [];

let socket;
let userId;
let userClient;

function stompOnline() {
    userId = sessionStorage.getItem("idUser");

    if (userId) {
        socket = new SockJS(`${URL}:8080/play`);
        userClient = Stomp.over(socket);
        userClient.connect({}, onOnline, onFail);
    } else {
        console.log("Player needs to login first")
    }
}

function onOnline() {
    // Subscribe to the Room Topic
    const invitation = userClient.subscribe(`/room/${userId}/request`, onInvitationReceived);
    userSubscriptions.push(invitation.id);
}

function onFail(_error) {
    console.error(_error);
    console.log("connection failed")
}

function onInvitationReceived(payload) {
    let data = JSON.parse(payload.body);

    let syntax = `<div class="modal-invitation" data-gameCode="${data.content}">
        <h2>${data.sender} invited you to join room</h2>
        <div class="invitation-response">
        <button class="invitation-reject">Reject</button>
        <button class="invitation-accept">Accept</button>
        </div></div>`;

    // animasi masuk
    $(syntax).clone().hide().prependTo('.invitation-container').slideDown();

    // animasi keluar
    if ($('.invitation-container').children().length >= 4) {
        $('.invitation-container').children().last().addClass("fade-out");

        $('.invitation-container').children().last().on('transitionend', function () {
            $(this).remove();
        })
    }

    // pengecekan ulang invitation
    if ($('.invitation-container').children().length >= 4) {
        $('.invitation-container').children().last().remove();
    }

    $('.invitation-reject').on('click', function (e) {
        $(e.target).closest(".modal-invitation").remove();
    })

    $('.invitation-accept').on('click', function (e) {
        let roomId = $(e.target).closest(".modal-invitation").attr("data-gameCode");
        $(e.target).closest(".modal-invitation").remove();
        checkRoom(roomId);
    })
}

function burgerContent() {
    document.getElementById("myDropDown").classList.toggle("show");
    document.getElementsByClassName("burger-menu")[0].classList.toggle("active");

    document.addEventListener("click", function (event) {
        if (!event.target.closest(".dropdown") && !event.target.closest(".burger-menu")) {
            document.getElementById("myDropDown").classList.remove("show");
            document.getElementsByClassName("burger-menu")[0].classList.remove("active");
        }
    })
}

function toHome() {
    window.location.assign("/Home.html");
}

function toHistory() {
    if (sessionStorage.getItem("hasLogin") == "true") {
        window.location.assign("/History.html");
    } else {
        toastr.info("This feature only available for registered player")
    }
}

function toSearchFriend() {
    if (sessionStorage.getItem("hasLogin") == "true") {
        window.location.assign("/AddFriend.html");
    } else {
        toastr.info("This feature only available for registered player")
    }
}

// Fungsi di Room.html
function showChat() {
    document.getElementById("chat-panel").classList.toggle('active');
    document.getElementById("side-panel-toggle").classList.toggle('move');

    $(document).on("click", function (event) {
        if (!$(event.target).closest(".side-panel-container").length) {
            $("#chat-panel").removeClass("active");
            $("#side-panel-toggle").removeClass("move");
        }
    });
}

function checkRoom(roomId) {
    $.ajax({
        type: "GET",
        url: `${URL}:8080/Game/${roomId}`,
        dataType: 'json',
        success: function (result) {

            sessionStorage.setItem("gameCode", roomId);
            window.location.assign(`/Room.html`);

        },
        error: function (jqXHR) {
            toastr.error(JSON.parse(jqXHR.responseText).messages[0]);
        }
    });
}

function searchRoomById(roomId) {
    if (!regex.test(roomId.trim())) {
        checkRoom(roomId);
    } else {
        toastr.error("Roomcode must only contain number");
    }
}

$('.search__btn').on('click', function () {
    var roomId = $('.input').val().trim();
    if (roomId != '') {
        $('.input').val('');
        searchRoomById(roomId);
    } else {
        toastr.error("Please input the room id")
    }
});

function hidepop() {
    $(".popUp-bgs").hide();
}

window.setNavbarVisibility = function (status) {
    if (status) {
        $(".nav-button-container-2").removeClass("hidden");
        $(".nav-button-container-1").addClass("hidden");
        $(".burger-not-login").hide();
        $(".burger-must-login").css("display", "block");
        stompOnline();

        $.ajax({
            type: "PUT",
            url: `${URL}:8080/Player/${sessionStorage.getItem("idUser")}`,
            data: JSON.stringify({ status: "Online" }),
            dataType: 'json',
            contentType: 'application/json',
            success: function (result) {

            },
            error: function (jqXHR) {
                console.log(`Error when updating player status: ${JSON.parse(jqXHR.responseText).messages}`);
            }
        });

    } else {
        $(".nav-button-container-1").removeClass("hidden");
        $(".nav-button-container-2").addClass("hidden");
        $(".burger-must-login").hide();
        $(".burger-not-login").css("display", "block");
    }
}

$(window).on('beforeunload', () => {
    $.ajax({
        type: "PUT",
        url: `${URL}:8080/Player/${sessionStorage.getItem("idUser")}`,
        data: JSON.stringify({ status: "Offline" }),
        dataType: 'json',
        contentType: 'application/json',
        success: function (result) {

        },
        error: function (jqXHR) {
            console.log(`Error when updating player status: ${JSON.parse(jqXHR.responseText).messages}`);
        }
    });

    if (userClient) {
        userSubscriptions.forEach((subscriptionId) => {
            userClient.unsubscribe(subscriptionId);
        });
        userClient.disconnect();
    }
});

if (sessionStorage.getItem("hasLogin") == "true") {
    setNavbarVisibility(true);
} else {
    setNavbarVisibility(false);
}