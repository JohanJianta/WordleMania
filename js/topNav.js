'use strict';

const URL = "http://127.0.0.1";
let regex = /[a-zA-Z!@#$%^&*(),.?":{}|<>]/;

window.setNavbarVisibility = function (status) {
    if (status) {
        $(".nav-button-container-2").removeClass("hidden");
        $(".nav-button-container-1").addClass("hidden");
        $(".burger-not-login").hide();
        $(".burger-must-login").css("display", "block");
    } else {
        $(".nav-button-container-1").removeClass("hidden");
        $(".nav-button-container-2").addClass("hidden");
        $(".burger-must-login").hide();
        $(".burger-not-login").css("display", "block");
    }
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

function searchRoomById(roomId) {
    if (!regex.test(roomId.trim())) {
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

if (sessionStorage.getItem("hasLogin") == "true") {
    setNavbarVisibility(true);
} else {
    setNavbarVisibility(false);
}

function hidepop() {
    $(".popUp-bgs").hide();
}