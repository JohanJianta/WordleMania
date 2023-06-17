'use strict';

const topPlayers = [];

window.onload = async function () {
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

    await getLeaderboard();

    if (sessionStorage.getItem("hasLogin") == "true") {
        $.ajax({
            type: "GET",
            url: `${URL}:8080/Player/${sessionStorage.getItem("idUser")}`,
            dataType: 'json',
            success: function (result) {
                sessionStorage.setItem("idGuest", result.payload.guestId);
                sessionStorage.setItem("idUser", result.payload.userId);
                sessionStorage.setItem("username", result.payload.name);
                sessionStorage.setItem("score", result.payload.score);
                sessionStorage.setItem("totalPlay", result.payload.totalPlay);
                sessionStorage.setItem("totalWin", result.payload.totalWin);
                setLoginState(true);
            },
            error: function (jqXHR) {
                toastr.warning("Something went wrong when loading player data. Consider to refresh the page")
            }
        });
    } else {
        setLoginState(false);
    }
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
                resetForm();
                hideSignUp();
                toastr.success("Registration Success");
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
        $("#player-id").text(`Id : ${sessionStorage.getItem("idUser")}`);
        $("#player-score").text(`Score : ${sessionStorage.getItem("score")}`);
        $("#player-rank").text(`Rank ${topPlayers.includes(parseInt(sessionStorage.getItem("idUser"), 10)) ? `#${topPlayers.indexOf(parseInt(sessionStorage.getItem("idUser"), 10)) + 1}` : "n/a"}`);
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
                let friendList = result.payload;

                for (let i = 0; i < friendList.length; i++) {
                    let syntax = $('<div>', {
                        'class': 'friendlist',
                        'data-friendId': friendList[i].userId
                    }).append(
                        $('<div>', { 'class': 'bagianatas-friend' }).append(
                            $('<div>', { 'class': 'profilefriend' }).append(
                                $('<img>', { src: '/picture/avatar/Avatar10.svg', width: '45px' })
                            ),
                            $('<div>', { 'class': 'levelfriend' }).append(
                                $('<p>', { 'class': 'friend-level' }).text(`Level ${parseInt(friendList[i].totalPlay / 5 + friendList[i].totalWin / 2).toFixed(0)}`)
                            )
                        ),
                        $('<div>', { 'class': 'bagiantengah-friend' }).append(
                            $('<p>', { 'class': 'friend-name' }).text(friendList[i].name),
                            $('<p>', { 'class': 'friend-score' }).text(`Score : ${friendList[i].score}`),
                            $('<p>', { 'class': 'friend-rank' }).text(`Rank ${topPlayers.includes(friendList[i].userId) ? `#${topPlayers.indexOf(friendList[i].userId) + 1}` : "n/a"}`)
                        ),
                        $('<div>', { 'class': 'bagianbawah-friend' }).append(
                            $('<button>', {
                                'class': `addplayer${friendList[i].status === "Playing" ? " playing" : (friendList[i].status === "Offline" ? " offline" : "")}`
                            }).append(
                                $('<div>', { 'class': 'sign' }).html('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="add-account"><path d="M21,10.5H20v-1a1,1,0,0,0-2,0v1H17a1,1,0,0,0,0,2h1v1a1,1,0,0,0,2,0v-1h1a1,1,0,0,0,0-2Zm-7.7,1.72A4.92,4.92,0,0,0,15,8.5a5,5,0,0,0-10,0,4.92,4.92,0,0,0,1.7,3.72A8,8,0,0,0,2,19.5a1,1,0,0,0,2,0,6,6,0,0,1,12,0,1,1,0,0,0,2,0A8,8,0,0,0,13.3,12.22ZM10,11.5a3,3,0,1,1,3-3A3,3,0,0,1,10,11.5Z"></path></svg>'),
                                $('<div>', { 'class': 'textadd' }).text(friendList[i].status === "Playing" ? "Playing" : (friendList[i].status === "Offline" ? "Offline" : "Invite"))
                            )
                        )
                    );

                    $(".friend-container").append(syntax);
                }

                $('.addplayer:not(.playing):not(.offline)').on('click', function (e) {
                    let friendId = $(e.target).closest(".friendlist").attr("data-friendId");
                    $.ajax({
                        type: "POST",
                        url: `${URL}:8080/Game`,
                        data: "Public",
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function (result) {
                            sessionStorage.setItem("gameCode", result.payload);
                            userClient.send("/app/invite", {}, JSON.stringify({ sender: sessionStorage.getItem("username"), content: result.payload, guestId: friendId }));
                            window.location.assign(`/Room.html`);
                        },
                        error: function (jqXHR) {
                            toastr.error(JSON.parse(jqXHR.responseText).messages[0]);
                        }
                    });
                })

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

async function getLeaderboard() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: `${URL}:8080/Player/Leaderboard`,
            dataType: 'json',
            success: function (result) {
                for (let i = 0; i < result.payload.length; i++) {
                    if (i < 3) {
                        $(`#leaderboard-name-${i + 1}`).text(result.payload[i].name);
                        $(`#leaderboard-score-${i + 1}`).text(result.payload[i].score);
                    }
                    topPlayers.push(result.payload[i].userId);
                }
                resolve(); // Resolve the promise when the AJAX request is successful
            },
            error: function (jqXHR) {
                reject(new Error("Failed to fetch leaderboard")); // Reject the promise if there's an error
            }
        });
    });
}

function searchRandomRoom() {
    $.ajax({
        type: "GET",
        url: `${URL}:8080/Game`,
        dataType: 'json',
        success: function (result) {
            sessionStorage.setItem("gameCode", result.payload);
            window.location.assign(`/Room.html`);
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
                sessionStorage.setItem("gameCode", result.payload);
                window.location.assign(`/Room.html`);
            },
            error: function (jqXHR) {
                toastr.error(JSON.parse(jqXHR.responseText).messages[0]);
            }
        });
    } else {
        toastr.info("This feature only available for registered player");
    }
}