/**
 * alert module
 */
;
(function ($,document,Themify) {
    'use strict';
    
    const isNumber = function (number) {
        return number && !isNaN(parseFloat(number)) && isFinite(number);
    },
    setCookie = function (name, value, days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

        document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
    },
    getCookie = function (name) {
        name = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0, len = ca.length; i < len; ++i) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    },
    closeAlert = function (btn) {
        const speed = 400;
        let buttonMessage,
            alertBox;

        if (btn) {
            buttonMessage = btn.getAttribute('data-alert-message');
            alertBox = buttonMessage ? btn.closest('.alert-inner') : btn.closest('.module-alert');
        } else {
            alertBox = btn;
        }

        $(alertBox).slideUp(speed, function () {
			const $parent = $(this).parent();
            if (buttonMessage && !$parent.find('.alert-message').length) {
                const message = $('<div class="alert-message" />').html(buttonMessage + '<div class="alert-close tf_close" />');
                $parent.html(message);
                message.hide().slideDown(speed);
            }
        });
    };
    Themify.body.on('click.tb_alert', '.module-alert .alert-close', function (e) {
        e.preventDefault();
        closeAlert(this);
    });
    Themify.on('tb_alert_init',function(items){
        if(items instanceof jQuery){
            items = items.get();
        }
        for(let i=items.length-1;i>-1;--i){
            let alertID = items[i].getAttribute('data-module-id'),
                alertLimit =items[i].getAttribute('data-alert-limit'),
                autoClose = items[i].getAttribute('data-auto-close');

            if ( isNumber( alertLimit ) ) {
                let currentViews = parseInt(getCookie( alertID )) || 0;
                ++currentViews;
                setCookie( alertID, currentViews, 365 );
            }

            if (isNumber(autoClose)) {
                setTimeout(function(){
                    closeAlert(items[i]);
                }, autoClose * 1000);
            }
        }
    });

})(jQuery,document,Themify);