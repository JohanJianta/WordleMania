'use strict';

let regex = /[a-zA-Z!@#$%^&*(),.?":{}|<>]/;

var idPlayer;
const topPlayers = [];

window.onload = async () => {
    if (sessionStorage.getItem('hasLogin') == "true") {
        idPlayer = sessionStorage.getItem('idUser');
        $('#myId').text(`My ID : ${idPlayer}`);

        await getTopPlayers();

        getRandomUser();
    } else {
        toastr.warning('This section only available for registered player. Please try to register or login first.');
        window.location.assign("/Home.html");
    }
}

function openForm() {
    $(".friend-req-container").css('display', 'flex');
    getFriendRequests();
}

function closeForm() {
    $(".friend-req-container").hide();
}

function sendFriendRequest(DOM) {
    var parent = $(DOM).closest('.friend-container');
    var idFriend = parent.attr('data-idFriend');

    $.ajax({
        type: "POST",
        url: `${URL}:8080/Friends/${idPlayer}`,
        data: JSON.stringify({ id: idFriend }),
        dataType: 'json',
        contentType: 'application/json',
        success: function (result) {
            toastr.success(result.messages[0]);
            // parent.remove();
        },
        error: function (jqXHR) {
            toastr.info(JSON.parse(jqXHR.responseText).messages)
        }
    });
}

function searchFriendId(friendId) {
    if (idPlayer != null) {
        $.ajax({
            type: "GET",
            url: `${URL}:8080/Player/${friendId}`,
            dataType: 'json',
            success: function (result) {
                $(".friend-display").empty();
                var data = result.payload;
                var syntax = $('<div>', {
                    class: 'friend-container',
                    'data-idFriend': data.userId
                }).append(
                    $('<div>', {
                        class: 'avatar'
                    }),
                    $('<b>').append(
                        $('<p>', {
                            text: data.name
                        })
                    ),
                    $('<div>', {
                        class: 'level'
                    }).append(
                        $('<p>', {
                            text: 'Level ' + parseInt((data.totalPlay / 5 + data.totalWin / 2).toFixed(0))
                        })
                    ),
                    $('<div>', {
                        class: 'score'
                    }).append(
                        $('<p>', {
                            text: data.score
                        })
                    ),
                    $('<div>', {
                        class: 'rank'
                    }).append(
                        $('<p>', {
                            text: `Rank ${topPlayers.includes(data.userId) ? `#${topPlayers.indexOf(data.userId) + 1}` : "n/a"}`
                        })
                    ),
                    $('<button>', {
                        class: 'add',
                        text: 'Add Friend'
                    }));

                $('.friend-display').append(syntax);

                $('.add').on('click', function () {
                    sendFriendRequest(this);
                });

            },
            error: function (jqXHR) {
                toastr.error(JSON.parse(jqXHR.responseText).messages[0]);
            }
        });
    } else {
        toastr.error('You need to login first in order to use this feature');
    }
}

function getRandomUser() {
    $.ajax({
        type: "GET",
        url: `${URL}:8080/Player`,
        dataType: 'json',
        success: function (result) {
            $(".friend-display").empty();
            var data = result.payload;

            for (let i = 0; i < data.length; i++) {
                var syntax = $('<div>', {
                    class: 'friend-container',
                    'data-idFriend': data[i].userId
                }).append(
                    $('<div>', {
                        class: 'avatar'
                    }),
                    $('<b>').append(
                        $('<p>', {
                            class: 'friend-name',
                            text: data[i].name
                        })
                    ),
                    $('<div>', {
                        class: 'level'
                    }).append(
                        $('<p>', {
                            text: 'Level ' + parseInt((data[i].totalPlay / 5 + data[i].totalWin / 2).toFixed(0))
                        })
                    ),
                    $('<div>', {
                        class: 'score'
                    }).append(
                        $('<p>', {
                            text: data[i].score
                        })
                    ),
                    $('<div>', {
                        class: 'rank'
                    }).append(
                        $('<p>', {
                            text: `Rank ${topPlayers.includes(data[i].userId) ? `#${topPlayers.indexOf(data[i].userId) + 1}` : "n/a"}`
                        })
                    ),
                    $('<button>', {
                        class: 'add',
                        text: 'Add Friend'
                    }));

                $('.friend-display').append(syntax);
            }

            $('.add').on('click', function () {
                sendFriendRequest(this);
            });

        },
        error: function (jqXHR) {
            console.log("Failed to get random players");
        }
    });
}

function getTopPlayers() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: `${URL}:8080/Player/Leaderboard`,
            dataType: 'json',
            success: function (result) {
                for (let i = 0; i < result.payload.length; i++) {
                    topPlayers.push(result.payload[i].userId);
                }
                resolve(); // Resolve the promise when the AJAX request is successful
            },
            error: function (jqXHR) {
                reject(new Error("Failed to fetch top players")); // Reject the promise if there's an error
            }
        });
    });
}

function getFriendRequests() {
    $.ajax({
        type: "GET",
        url: `${URL}:8080/Friends/Requests/${idPlayer}`,
        dataType: 'json',
        success: function (result) {
            $('.list-req').empty();
            var requests = result.payload;
            for (let i = 0; i < requests.length; i++) {
                var syntax = $('<div>', {
                    class: 'orang',
                    'data-idFriend': requests[i].id
                }).append(
                    $('<div>', {
                        class: 'avatar-req'
                    }),
                    $('<b>').append(
                        $('<p>', {
                            id: 'friendName',
                            text: requests[i].friendName
                        })
                    ),
                    $('<p>', {
                        id: 'friendScore',
                        text: requests[i].friendScore
                    }),
                    $('<div>', {
                        class: 'req-response'
                    }).append(
                        $('<img>', {
                            class: 'btn-response',
                            id: 'check',
                            src: 'picture/check.png',
                            alt: 'accept'
                        }),
                        $('<img>', {
                            class: 'btn-response',
                            id: 'close',
                            src: 'picture/close.png',
                            alt: 'reject'
                        })
                    )
                );

                $(".list-req").append(syntax);
            }
            $('.btn-response').on('click', function () {
                sendResponse(this);
            });
        },
        error: function (jqXHR) {
            console.log(jqXHR.responseText);
            toastr.warning("System failed to load the friend request. Please refresh the page")
        }
    });
}

function sendResponse(DOM) {
    var id = $(DOM).attr('id');
    var parent = $(DOM).closest('.orang');
    var idFriend = parent.attr('data-idFriend');
    var response = id === 'check' ? "ACCEPT" : "REJECT";

    $.ajax({
        type: "PUT",
        url: `${URL}:8080/Friends/${idPlayer}`,
        data: JSON.stringify({ id: idFriend, status: response }),
        dataType: 'json',
        contentType: 'application/json',
        success: function (result) {
            toastr.info(result.messages[0]);
            parent.remove();
        },
        error: function (jqXHR) {
            console.log(jqXHR.responseText);
            toastr.warning(JSON.parse(jqXHR.responseText).messages)
        }
    });
}

$('.btn-response').on('click', function () {
    sendResponse(this);
});

$('.search_friend_btn').on('click', function () {
    var inputValue = $('.input-search').val().trim();

    if (inputValue.length == 0) return getRandomUser();

    if (!regex.test(inputValue)) {
        searchFriendId(inputValue);
    } else {
        toastr.error("Id must only contain number")
    }
});

$('.input-search').on("keypress", function (event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
        // Trigger the button element with a click
        $(".search_friend_btn").trigger("click");
    }
});

$('#btn-req').on('click', openForm);
$('#img-req').on('click', openForm);
$('#close-req').on('click', closeForm);