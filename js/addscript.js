'use strict';

function openForm() {
    $(".friend-req-container").css('display', 'flex');
}

function closeForm() {
    $(".friend-req-container").hide();
}

$('#btn-req').on('click', openForm);

$('#img-req').on('click', openForm);

$('#close-req').on('click', closeForm);