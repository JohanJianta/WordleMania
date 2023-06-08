'use strict';

const URL = 'http://127.0.0.1';
const idPlayer = 2;

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
            toastr.info(result.messages[0]);
            // parent.remove();
        },
        error: function (jqXHR) {
            console.log(jqXHR.responseText);
            toastr.info(JSON.parse(jqXHR.responseText).messages)
        }
    });
}

function searchFriendId(friendId) {
    if (friendId != idPlayer) {
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
                            text: 'Level ' + data.totalPlay
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
                            text: 'Rank: #5'
                        })
                    ),
                    $('<button>', {
                        class: 'add',
                        html: $('<b>', {
                            text: 'Add Friend'
                        })
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
        toastr.error('You can\'t search your own account');
    }
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

$('.search__btn').on('click', function () {
    var inputValue = $('.input').val().trim();
    searchFriendId(inputValue);
});

$('#btn-req').on('click', openForm);
$('#img-req').on('click', openForm);
$('#close-req').on('click', closeForm);