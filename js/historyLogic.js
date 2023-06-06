'use strict';

const URL = 'http://localhost';
const idPlayer = 1;

window.onload = function () {
    $.ajax({
        type: "GET",
        url: `${URL}:8080/History/${idPlayer}`,
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

                var syntax = $('<div>', {
                    class: 'history-container',
                    'data-idHistory': histories[i].roomId
                }).append(
                    $('<h1>', {
                        text: histories[i].win == true ? 'WIN' : 'LOSE',
                        css: { textTransform: 'uppercase' }
                    }),
                    $('<div>', {
                        class: 'background-word',
                        css: { backgroundColor: histories[i].win ? 'rgba(0, 128, 0, 0.6)' : 'rgba(220, 20, 60, 0.6)' }
                    }).append(
                        $('<h2>', {
                            text: histories[i].word,
                            css: { fontStyle: 'italic', textTransform: 'capitalize' }
                        })
                    ),
                    $('<div class="player-list">').append(
                        $('<p>', {
                            text: histories[i].playerNames[0] !== undefined ? histories[i].playerNames[0] : '',
                        }),
                        $('<p>', {
                            text: histories[i].playerNames[1] !== undefined ? histories[i].playerNames[1] : '',
                        }),
                        $('<p>', {
                            text: histories[i].playerNames[2] !== undefined ? histories[i].playerNames[2] : '',
                        }),
                        $('<p>', {
                            text: histories[i].playerNames[3] !== undefined ? histories[i].playerNames[3] : ''
                        })
                    ),
                    $('<p>', {
                        text: formattedDate
                    }),
                    $('<div>', {
                        class: 'background-score',
                        css: { backgroundColor: histories[i].win ? 'green' : 'crimson' }
                    }).append(
                        $('<h1>', {
                            text: (histories[i].win ? '+' : '-') + histories[i].score
                        })
                    )
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