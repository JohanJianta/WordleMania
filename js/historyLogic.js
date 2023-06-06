'use strict';

const URL = 'http://localhost';

window.onload = function () {
    $.ajax({
        type: "GET",
        url: `${URL}:8080/History/${1}`,
        dataType: 'json',
        success: function (result) {
            var histories = result.payload;
            for (let i = 0; i < histories.length; i++) {
                let dateValue = new Date(histories[i].date);
                let formattedDate = dateValue.toLocaleString('id-ID', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });
                var syntax = $('<div class="history-container">').append(
                    $('<h1>', {
                        id: 'winLabel',
                        text: histories[i].win,
                        css: { color: histories[i].win ? 'green' : 'red' }
                    }),
                    $('<p>', {
                        id: 'wordLabel',
                        text: histories[i].word
                    }),
                    $('<p>', {
                        id: 'player1Label',
                        text: histories[i].playerNames[0],
                        css: { display: histories[i].playerNames[0] !== undefined ? 'block' : 'none' }
                    }),
                    $('<p>', {
                        id: 'player2Label',
                        text: histories[i].playerNames[1],
                        css: { display: histories[i].playerNames[1] !== undefined ? 'block' : 'none' }
                    }),
                    $('<p>', {
                        id: 'player3Label',
                        text: histories[i].playerNames[2],
                        css: { display: histories[i].playerNames[2] !== undefined ? 'block' : 'none' }
                    }),
                    $('<p>', {
                        id: 'player4Label',
                        text: histories[i].playerNames[3],
                        css: { display: histories[i].playerNames[3] !== undefined ? 'block' : 'none' }
                    }),
                    $('<p>', {
                        id: 'dateLabel',
                        text: formattedDate
                    }),
                    $('<h1>', {
                        id: 'poinLabel',
                        text: (histories[i].win ? '+' : '-') + histories[i].score,
                        css: { color: (histories[i].win ? 'green' : 'red') }
                    })
                );
                $(".list-history").append(syntax);
            }
        },
        error: function (jqXHR) {
            console.log(jqXHR.responseText);
            toastr.warning("System failed to load the history. Please refresh the page")
        }
    });
}