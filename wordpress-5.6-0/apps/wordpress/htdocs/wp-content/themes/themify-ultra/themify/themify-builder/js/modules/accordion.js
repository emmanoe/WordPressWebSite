/**
 * accordion module
 */
;
(function ($,Themify) {
    'use strict';
    let isAttached=false;
    const style_url=ThemifyBuilderModuleJs.cssUrl+'accordion_styles/',
        init=function(){
            Themify.body.off( 'click.tb_accordeon' ).on( 'click.tb_accordeon', '.accordion-title', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const $this = $(this),
                        $panel = $this.next(),
                        $item = $this.closest('li'),
                        $parent = $item.parent(),
						activeIcon=$item.find('.accordion-active-icon'),
						passiveIcon=$item.find('.accordion-icon'),
                        type = $parent.closest('.module-accordion[data-behavior]').data('behavior'),
                        def = $item.toggleClass('current').siblings().removeClass('current'); /* keep "current" classname for backward compatibility */

                    if (!$parent.hasClass('tf-init-accordion')) {
                        $parent.addClass('tf-init-accordion');
                    }

                    if ('accordion' === type) {
                        def.find('.accordion-content').slideUp().closest('li').removeClass('builder-accordion-active')
							.find('.accordion-title > a').attr('aria-expanded', 'false')
								.find( '.accordion-icon' ).removeClass( 'tf_hide' )
								.end()
								.find( '.accordion-active-icon' ).addClass( 'tf_hide' );
                    }
                    if ($item.hasClass('builder-accordion-active')) {
						
						activeIcon.addClass('tf_hide');
						passiveIcon.removeClass('tf_hide');
                        $panel.slideUp();
                        $item.removeClass('builder-accordion-active').find('.accordion-title > a').attr('aria-expanded', 'false');
                        $panel.attr('aria-hidden', 'true');
                    } else {
						activeIcon.removeClass('tf_hide');
						passiveIcon.addClass('tf_hide');
                        $item.addClass('builder-accordion-active');
                        $panel.slideDown();
                        $item.find('.accordion-title > a').attr('aria-expanded','true');
                        $panel.attr('aria-hidden', 'false');

                        // Show map marker properly in the center when tab is opened
                        const existing_maps = $panel.hasClass('default-closed') ? $panel.find('.themify_map') : false;
                        if (existing_maps) {
                            for (let i =existing_maps.length-1; i>-1 ;--i) { // use loop for multiple map instances in one tab
                                let current_map = $(existing_maps[i]).data('gmap_object'); // get the existing map object from saved in node
                                if (typeof current_map.already_centered !== 'undefined' && !current_map.already_centered)
                                    current_map.already_centered = false;
                                if (!current_map.already_centered) { // prevent recentering
                                    let currCenter = current_map.getCenter();
                                    google.maps.event.trigger(current_map, 'resize');
                                    current_map.setCenter(currCenter);
                                    current_map.already_centered = true;
                                }
                            }
                        }
                    }
                    Themify.trigger('tb_accordion_switch', [$panel]);
                    $(window).triggerHandler( 'resize' );
                });
                isAttached=true;
        };
    Themify.on('tb_accordion_init',function(items,isLazy){
        for(let i=items.length-1;i>-1;--i){
            if(!Themify.cssLazy['tb_accordion_separate'] && items[i].classList.contains('separate')){
                Themify.cssLazy['tb_accordion_separate']=true;
                Themify.LoadCss(style_url+'separate.css');
            }
            if(!Themify.cssLazy['tb_accordion_transparent'] && items[i].classList.contains('transparent')){
                Themify.cssLazy['tb_accordion_transparent']=true;
                Themify.LoadCss(style_url+'transparent.css');
            }
        }
        if(isLazy!==true || isAttached===false){
            Themify.requestIdleCallback(init,50);
        }
    });

})(jQuery,Themify);
