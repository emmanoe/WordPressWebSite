/**
 * ReadMore module
 */
;
(function ($,Themify) {
    'use strict';
    Themify.LoadCss(ThemifyBuilderModuleJs.cssUrl+'more-text.css');
    Themify.body.on('click', '.module-text-more', function (e) {
        e.preventDefault();
        const more_link = $(this),
            more_text = more_link.parent().find( '.more-text' ),
            callback = function() {
                // trigger resize so the module can re-adjust heights
                $( this ).closest( '.module' ).trigger( 'resize' );
            };
        if (!more_link.hasClass( 'tb_text_less_link' ) ) {
            more_link.addClass( 'tb_text_less_link' );
            more_text.slideDown( 400, 'linear', callback );
        } else {
            more_link.removeClass( 'tb_text_less_link' );
            more_text.slideUp( 400, 'linear', callback );
        }
    });

})(jQuery,Themify);