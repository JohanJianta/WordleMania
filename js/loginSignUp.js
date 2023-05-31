'use strict';

const notifDesc = document.querySelector('#notif-desc');

window.onclick = function () {
    $(".notif-container").css("display", "none");
}

function showNotif(color, title, desc) {
    $(".notif-container").css("display", "flex");
    $(".notif-container").css("color", color);
    $("#notif-title").text(title);
    $("#notif-desc").text(desc);
}

function login() {
    var emailInput = $("#loginEmail").val().trim();
    var passwordInput = $("#loginPass").val().trim();

    if (emailInput && passwordInput) {

        var data = {
            email: emailInput,
            password: passwordInput
        };

        $.ajax({
            type: "POST",
            url: "http://localhost:8080/Player/Login",
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'application/json',
            success: function (result) {
                showNotif("green", "Login Success", "Directing to your home page...");
                resetForm();
                hideLogin();
                getPlayerData(result.payload);
            },
            error: function (jqXHR) {
                showNotif("red", "Login Failed", JSON.parse(jqXHR.responseText).messages);
                resetForm();
            }
        });
    }
}

function signUp() {
    var nameInput = $("#signUpName").val().trim();
    var emailInput = $("#signUpEmail").val().trim();
    var passwordInput = $("#signUpPass").val().trim();

    if (nameInput && passwordInput && emailInput) {
        var data = {
            name: nameInput,
            email: emailInput,
            password: passwordInput
        };

        $.ajax({
            type: "POST",
            url: "http://localhost:8080/Player/Register",
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'application/json',
            success: function (result) {
                showNotif("green", "Registration Success", "Directing to your home page...");
                resetForm();
                hideSignUp();
            },
            error: function (jqXHR) {
                showNotif("red", "Registration Failed", JSON.parse(jqXHR.responseText).messages);
                resetForm();
            }
        });

    }
}

function resetForm() {
    $("#loginEmail").val("");
    $("#loginPass").val("");
    $("#signUpName").val("");
    $("#signUpEmail").val("");
    $("#signUpPass").val("");
}

function showLogin() {
    $("#login").removeClass("popUp-disabled");
    $("#login").addClass("popUp-enabled");
}

function hideLogin() {
    $("#login").removeClass("popUp-enabled");
    $("#login").addClass("popUp-disabled");
}

function showSignUp() {
    $("#signUp").removeClass("popUp-disabled");
    $("#signUp").addClass("popUp-enabled");
}

function hideSignUp() {
    $("#signUp").removeClass("popUp-enabled");
    $("#signUp").addClass("popUp-disabled");
}

function loginToSignUp() {
    resetForm();
    hideLogin();
    showSignUp();
}

function signUpToLogin() {
    resetForm();
    hideSignUp();
    showLogin();
}

function getPlayerData(idPlayer) {
    $.ajax({
        type: "GET",
        url: `http://localhost:8080/Player/${idPlayer}`,
        dataType: 'json',
        success: function (result) {
            let response = result.payload;
            $("#player-nickname").text(response.name);
            $("#player-id").text(response.id);
            $("#player-score").text(response.score);
            $("#player-total-play").text(response.totalPlay);
            $("#player-total-win").text(response.totalWin);
        },
        error: function (jqXHR) {
            console.log("Player Not Found")
        }
    });
    getFriendList(idPlayer);
}

function getFriendList(idPlayer) {
    $.ajax({
        type: "GET",
        url: `http://localhost:8080/Friends/${idPlayer}`,
        dataType: 'json',
        success: function (result) {
            var friend;
            console.log(result.payload.length)
            for (let i = 0; i < result.payload.length; i++) {
                friend = `<div class="friend-container">
                            <div class="friend-profile">
                                <div class="first-info">
                                    <div class="profile"></div>
                                    <div class="level">
                                        <p>Level 100</p>
                                    </div>
                                </div>

                                <div class="second-info">
                                    <div class="second-info-left">
                                        <div class="group-info">
                                            <p id="friend-nickname">${result.payload[i].name}</p>
                                        </div>
                                        <div class="group-info">
                                            <p class="info-title">Score:  ${result.payload[i].score}</p>
                                        </div>
                                    </div>

                                    <div class="second-info-right">
                                        <img src="picture/Group 38-edit.png" alt="">
                                    </div>

                                </div>
                            </div>
                        </div>`;
                // friendDisplay.innerHTML += friend;

                $(".friend-list-container").append(friend);
            }
        },
        error: function (jqXHR) {
            console.log("Something went wrong with the friend list")
        }
    });
}

function getLeaderboard() {
    $.ajax({
        type: "GET",
        url: "http://localhost:8080/Player/Leaderboard",
        dataType: 'json',
        success: function (result) {
            for (let i = 0; i < result.payload.length; i++) {
                $(`#leaderboard-name-${i + 1}`).text(result.payload[i].name);
                $(`#leaderboard-score-${i + 1}`).text(result.payload[i].score);
            }
        },
        error: function (jqXHR) {
            console.log("Something went wrong with the leaderboard")
        }
    });
}

getLeaderboard();