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
                toastr.warning('Error occurred while creating guest data')
            }
        });
    }

    if (sessionStorage.getItem("hasLogin") == "true") {
        setLoginState(true);
        setNavbarVisibility(true);
    } else {
        setLoginState(false);
        setNavbarVisibility(false);
    }

    getLeaderboard();
}

function setLoginState(state) {
    if (state) {
        $(".judulfriend").css("display", "block");
        $(".info-friend").hide();
        $(".friend-container").css("display", "flex");
    } else {
        $(".judulfriend").hide();
        $(".info-friend").css("display", "flex");
        $(".friend-container").hide();
    }
    showPlayerData(state);
    showFriendList(state);
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
                toastr.success("Login Success");
                sessionStorage.setItem("idGuest", result.payload.guestId);
                sessionStorage.setItem("idUser", result.payload.userId);
                sessionStorage.setItem("username", result.payload.name);
                sessionStorage.setItem("score", result.payload.score);
                sessionStorage.setItem("totalPlay", result.payload.totalPlay);
                sessionStorage.setItem("totalWin", result.payload.totalWin);
                sessionStorage.setItem("hasLogin", "true");
                setLoginState(true);
                setNavbarVisibility(true);
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
                toastr.success("Registration Success");
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
        $("#player-id").show();
        $("#player-score").show();
        $("#player-rank").show();
        $("#player-id").text(`Id : ${sessionStorage.getItem("idGuest")}`);
        $("#player-score").text(`Score : ${sessionStorage.getItem("score")}`);
        $("#player-rank").text(`Rank n/a`);
        // $("#player-rank").text(`Rank #${sessionStorage.getItem("rank")}`);
        $("#player-level").text(`Level ${parseInt(sessionStorage.getItem("totalPlay") / 5 + sessionStorage.getItem("totalWin") / 2).toFixed(0)}`);
    } else {
        $("#player-id").hide();
        $("#player-score").hide();
        $("#player-rank").hide();
        $("#player-level").text("Level 0");
    }

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
                // $(".friend-container").empty();
                var friendList = result.payload;
                var syntax;
                for (let i = 0; i < friendList.length; i++) {
                    syntax = `<div class="friendlist" data-friendId="${friendList[i].userId}">
                    <div class="bagianatas-friend">
                        <div class="profilefriend">
                            <img src="/picture/avatar/Avatar10.svg" width="45px">
                        </div>
                        <div class="levelfriend">
                            <p class="friend-level">Level ${parseInt(friendList[i].totalPlay / 5 + friendList[i].totalWin / 2).toFixed(0)}</p>
                        </div>
                    </div>
                    <div class="bagiantengah-friend">
                        <p class="friend-name">${friendList[i].name}</p>
                        <p class="friend-score">Score : ${friendList[i].score}</p>
                        <p class="friend-rank">Rank n/a</p>
                    </div>
                    <div class="bagianbawah-friend">
                        <button class="addplayer">
                            <div class="sign"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                    id="add-account">
                                    <path
                                        d="M21,10.5H20v-1a1,1,0,0,0-2,0v1H17a1,1,0,0,0,0,2h1v1a1,1,0,0,0,2,0v-1h1a1,1,0,0,0,0-2Zm-7.7,1.72A4.92,4.92,0,0,0,15,8.5a5,5,0,0,0-10,0,4.92,4.92,0,0,0,1.7,3.72A8,8,0,0,0,2,19.5a1,1,0,0,0,2,0,6,6,0,0,1,12,0,1,1,0,0,0,2,0A8,8,0,0,0,13.3,12.22ZM10,11.5a3,3,0,1,1,3-3A3,3,0,0,1,10,11.5Z">
                                    </path>
                                </svg>
                            </div>
                            <div class="textadd">Invite</div>
                        </button>
                    </div>
                </div>`;

                    $(".friend-container").append(syntax);
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