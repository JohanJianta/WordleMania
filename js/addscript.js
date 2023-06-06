'use strict';

const URL = 'http://localhost';

function openForm() {
    $(".friend-req-container").css('display', 'flex');
    getFriendRequests();
}

function closeForm() {
    $(".friend-req-container").hide();
}

window.onload = function () {

}

function getFriendRequests() {
    $.ajax({
        type: "GET",
        url: `${URL}:8080/Friends/Requests/${2}`,
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

$('.btn-response').on('click', function () {
    sendResponse(this);
});

function sendResponse(DOM) {
    // var abc = $("#friendName");
    var id = $(DOM).attr('id');
    var idFriend = $(DOM).closest('.orang').attr('data-idFriend');
    console.log(idFriend + " is " + (id === 'check' ? "accepted." : "rejected."));
}

$('#btn-req').on('click', openForm);
$('#img-req').on('click', openForm);
$('#close-req').on('click', closeForm);