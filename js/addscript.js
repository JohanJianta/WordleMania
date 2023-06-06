'use strict';

const URL = 'http://localhost';
const idPlayer = 2;

function openForm() {
    $(".friend-req-container").css('display', 'flex');
    getFriendRequests();
}

function closeForm() {
    $(".friend-req-container").hide();
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

$('#btn-req').on('click', openForm);
$('#img-req').on('click', openForm);
$('#close-req').on('click', closeForm);