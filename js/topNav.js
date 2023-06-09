'use strict';

function setNavbarVisibility(status) {
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

function showChat() {
    document.getElementById("chat-panel").classList.toggle('active');
    document.getElementById("side-panel-toggle").classList.toggle('move');
}

if (sessionStorage.getItem("hasLogin") == "true") {
    setNavbarVisibility(true);
} else {
    setNavbarVisibility(false);
}