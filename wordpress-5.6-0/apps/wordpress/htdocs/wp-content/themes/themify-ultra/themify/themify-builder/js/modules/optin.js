/**
 * option module
 */
;
(function ($,Themify) {
    'use strict';
     Themify.body.on( 'submit.tb_option', '.tb_optin_form', function( e ) {
            e.preventDefault();
            const $this = $( this );
            if ( $this.hasClass( 'processing' ) ) {
                    return;
            }
            $this.addClass( 'processing' );
            $.ajax( {
                    url : $this.attr( 'action' ),
                    type : 'POST',
                    data : $this.serialize(),
                    success : function( resp ) {
                            if ( resp.success ) {
                                    if ( $this.data( 'success' ) === 's1' ) {
                                            window.location.href = resp.data.redirect;
                                    } else {
                                            $this.fadeOut().closest( '.module' ).find( '.tb_optin_success_message' ).fadeIn();
                                    }
                            } else {
                                    window.console && console.log( resp.data.error );
                            }
                    },
                    complete : function() {
                            $this.removeClass( 'processing' );
                    }
            } );
    } );

})(jQuery,Themify);