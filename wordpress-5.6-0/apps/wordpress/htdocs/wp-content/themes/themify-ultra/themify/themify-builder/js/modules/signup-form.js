/**
 * signup module
 */
;
(function ($,Themify) {
    'use strict';
    
    Themify.body.on( 'submit.tb_signup', '.tb_signup_form', function ( e ) {
        e.preventDefault();
        const $this = $( this ),
            $btn = $this.find('button');
        $btn.prop('disabled', true);
        $.ajax( {
            type: 'POST',
            url: themify_vars.ajax_url,
            data: {
                dataType : 'json',
                action : 'tb_signup_process',
                nonce : $this.find('input[name="nonce"]').val(),
                data: $this.serialize()
            },
            beforeSend:function(){
                $this.find('.tb_signup_errors').removeClass('tb_signup_errors').empty();
                $this.find('.tb_signup_success').hide();
            },
            success: function ( resp ) {
                if (resp.err ) {
                    const errWrapper = $this[0].getElementsByClassName('tb_signup_messages')[0];
                        errWrapper.classList.add('tb_signup_errors');
                    for(let i = resp.err.length-1;i>-1;--i){
                        let err = document.createElement('div');
                        err.innerText = resp.err[i];
                        errWrapper.appendChild(err);
                    }
                } else {
                    $this.find('.tb_signup_success').fadeIn();
                    const redirect = $this.find('input[name="redirect"]');
                    if(redirect[0]){
                        const url = redirect.val();
                        if(''!== url){
                            window.location.href = url;
                        }else{
                            window.location.reload(true);
                        }
                    }else{
                        $this[0].reset();
                    }
                }
                Themify.scrollTo($this.offset().top-100);
            },
            complete: function () {
                $btn.prop('disabled', false);
            }
        } );
    } );

})(jQuery,Themify);