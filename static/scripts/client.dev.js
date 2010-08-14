var last_message_time = 1;
var RANT_LIMIT = 100;
function updateCounter(e){
    var _input = $('#id_rant');
    var _counter = $('#counter');
    var LIMIT = 280;
    var len = LIMIT - _input.val().length;
    if(len && $.trim(_input.val())){
        $("#send_rant").removeAttr("disabled");
    }else{
        $("#send_rant").attr("disabled", "disabled");
    }
    _counter.text(len);
    if(len < 140){
        _counter.css('color', '#122312');
    }else if(len >= 200 && len < 280){
        _counter.css('color', '#2C2016');
    }else{ //>= 280
        _counter.css('color', '#2C1616');
    }
    return false;
}

function longPoll(data){
    if(data && data.messages){
        $.each(data.messages, function(index, message){
            if(message.timestamp > last_message_time){
                last_message_time = message.timestamp;
            } 
            $("<li class='rant navkey withoutfocus'>"+message.text+"</li>").fadeIn().prependTo('#rants');
            //TODO: show decay in the rant color
            //if it exceeds the limit, remove the last rant:
            if($("#rants li").length > RANT_LIMIT){
               $("#rants :last").fadeOut(1000, function(){
                    $(this).remove();
               });
            }
        });
    } //process data

    //poll again
    $.get(
        "/rants",
        {since: last_message_time},
        function(data){
            longPoll(data);
        },
        'json'
    );
} //longPoll

$(function(){        
    longPoll();
    $('#id_rant').bind('keyup',updateCounter);
    //HACK: set a timeout, waiting for the paste to update the content:
    $('#id_rant').bind('paste', function(e){
        setTimeout("updateCounter", 20);
    });

    $("#rant-form").submit(function(e){
        e.preventDefault();
        $.post('/rant',
               $('#rant-form').serialize(),
               function(){$('#id_rant').val("").trigger('keyup');return false;},
               'json'
        );
    });
});
