'use strict';

const URL = "http://127.0.0.1";

window.onload = function () {
    if (!sessionStorage.getItem("idGuest") && !sessionStorage.getItem("username")) {
        var currentDate = new Date();
        var year = currentDate.getFullYear();
        var month = currentDate.getMonth() + 1;
        var day = currentDate.getDate();
        var hour = currentDate.getHours();
        var minute = currentDate.getMinutes();
        var second = currentDate.getSeconds();
        console.log("im heree1")
        sessionStorage.setItem("hasLogin", "false");
        sessionStorage.setItem("username", ("Guest" + (year + month + day + hour + minute + second)));
        $.ajax({
            type: "POST",
            url: `${URL}:8080/Player/Guest`,
            data: ("Guest" + (year + month + day + hour + minute + second)),
            dataType: 'json',
            contentType: 'application/json',
            success: function (result) {
                sessionStorage.setItem("idGuest", result.id);
                sessionStorage.setItem("username", result.name);
            },
            error: function (jqXHR) {
                console.log(jqXHR);
                sessionStorage.setItem("username",);
            }
        });
        console.log("im heree2")
    }

    if (sessionStorage.getItem("hasLogin") == "true") {
        showPlayerData(true);
        showFriendList(true);
    } else {
        showPlayerData(false);
        showFriendList(false);
    }

    
    console.log("hello world");

    getLeaderboard();
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
            url: `${URL}:8080/Player/Login`,
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'application/json',
            success: function (result) {
                resetForm();
                hideLogin();
                toastr.success("Login Success !!!");
                sessionStorage.setItem("idGuest", result.payload.guestId);
                sessionStorage.setItem("idUser", result.payload.userId);
                sessionStorage.setItem("username", result.payload.name);
                sessionStorage.setItem("score", result.payload.score);
                sessionStorage.setItem("totalPlay", result.payload.totalPlay);
                sessionStorage.setItem("totalWin", result.payload.totalWin);
                sessionStorage.setItem("hasLogin", "true");
                setLoginState(true);
            },
            error: function (jqXHR) {
                toastr.error("Login Failed: " + JSON.parse(jqXHR.responseText).messages);
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
            guestId: sessionStorage.getItem("idGuest"),
            name: nameInput,
            email: emailInput,
            password: passwordInput
        };

        $.ajax({
            type: "POST",
            url: `${URL}:8080/Player/Register`,
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'application/json',
            success: function (result) {
                toastr.success("Registration Success !!!");
                resetForm();
                hideSignUp();
            },
            error: function (jqXHR) {
                toastr.error("Registration Failed: " + JSON.parse(jqXHR.responseText).messages);
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

function showPlayerData(status) {

    if (status) {
        console.log(status);
        // $("#player-id").show();
        // $("#player-score").show();
        $("#player-id").text(sessionStorage.getItem("idGuest"));
        $("#player-score").text(sessionStorage.getItem("score"));
        // $("#player-total-play").text(sessionStorage.getItem("totalPlay"));
        // $("#player-total-win").text(sessionStorage.getItem("totalWin"));
    } else {
        
        console.log(status);
    }

    console.log(status);
    $("#player-nickname").text(sessionStorage.getItem("username"));

}

function showFriendList(status) {
    if (status) {
        $("#friends-unavailable").remove();
        $("#friend-list-container").removeClass("hidden");
        $("#friend-list-container").addClass("friend-list-container");
        $("#friend-title").removeClass("hidden");
        $("#friend-title").addClass("friend-title");
        $.ajax({
            type: "GET",
            url: `${URL}:8080/Friends/${sessionStorage.getItem("idUser")}`,
            dataType: 'json',
            success: function (result) {
                var friend;
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

                    $(".friend-list-container").append(friend);
                }
            },
            error: function (jqXHR) {
                toastr.warning("System can't load the friend list. Consider to refresh the page")
            }
        });
    } else {
        $("#friend-list-container").removeClass("friend-list-container");
        $("#friend-list-container").addClass("hidden");
        $("#friend-title").removeClass("friend-title");
        $("#friend-title").addClass("hidden");
        $(".friend-section").append("<p id='friends-unavailable'>This Feature Only Accessible After Login</p>");
    }
}

function getLeaderboard() {
    $.ajax({
        type: "GET",
        url: `${URL}:8080/Player/Leaderboard`,
        dataType: 'json',
        success: function (result) {
            for (let i = 0; i < result.payload.length; i++) {
                $(`#leaderboard-name-${i + 1}`).text(result.payload[i].name);
                $(`#leaderboard-score-${i + 1}`).text(result.payload[i].score);
            }
        },
        error: function (jqXHR) {
            toastr.warning("System can't load the leaderboard. Consider to refresh the page")
        }
    });
}

function searchRandomRoom() {
    $.ajax({
        type: "GET",
        url: `${URL}:8080/Game`,
        dataType: 'json',
        success: function (result) {

            // $.ajax({
            //     type: "POST",
            //     url: `${URL}:8080/Game/Player`,
            //     data: JSON.stringify({ gameId: result.payload, playerId: sessionStorage.getItem("idGuest") }),
            //     dataType: 'json',
            //     contentType: 'application/json',
            //     success: function () {
            sessionStorage.setItem("gameCode", result.payload);
            window.location.assign(`${URL}:5500/Room.html`);
            //     },
            //     error: function (jqXHR) {
            //         toastr.error("Something went wrong when joining the game. Please try again.");
            //     }
            // });

        },
        error: function (jqXHR) {
            toastr.error(JSON.parse(jqXHR.responseText).messages[0]);
        }
    });
}

function createRoom() {
    if (sessionStorage.getItem("hasLogin") == "true") {
        $.ajax({
            type: "POST",
            url: `${URL}:8080/Game`,
            data: "Public",
            dataType: 'json',
            contentType: 'application/json',
            success: function (result) {

                // $.ajax({
                //     type: "POST",
                //     url: `${URL}:8080/Game/Player`,
                //     data: JSON.stringify({ gameId: result.payload, playerId: sessionStorage.getItem("idGuest") }),
                //     dataType: 'json',
                //     contentType: 'application/json',
                //     success: function () {
                sessionStorage.setItem("gameCode", result.payload);
                window.location.assign(`${URL}:5500/Room.html`);
                //     },
                //     error: function (jqXHR) {
                //         toastr.error("Something went wrong when joining the game. Please try again.");
                //     }
                // });

            },
            error: function (jqXHR) {
                toastr.error(JSON.parse(jqXHR.responseText).messages[0]);
            }
        });
    } else {
        toastr.info("This feature only available for registered player");
    }
}