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

$(function(){        
    $('#id_rant').bind('keyup',updateCounter);
    //HACK: set a timeout, waiting for the paste to update the content:
    $('#id_rant').bind('paste', function(e){
        setTimeout("updateCounter", 20);
    });
});
