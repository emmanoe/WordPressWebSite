/**
 * menu module
 */
;
(function ($,Themify,document) {
    'use strict';
    
    const style_url=ThemifyBuilderModuleJs.cssUrl+'menu_styles/',
        isActive=Themify.is_builder_active,
    loadMobileCss=function(callback){
        Themify.LoadCss(style_url+'mobile.css',null,null,null,function(){
			setTimeout(callback,200);
		});
    },
    closeMenu = function () {
        const mobileMenu = $( '.mobile-menu-module' );
        mobileMenu.prop( 'class', 'mobile-menu-module' );
        Themify.body.removeClass( 'menu-module-left menu-module-right' ).find( '.module-menu.' + mobileMenu.attr( 'data-module' ) + ' .body-overlay' ).removeClass( 'body-overlay-on' );
        setTimeout( function () {
            if ( Themify.body.hasClass( 'close-left-menu' ) || Themify.body.hasClass( 'close-right-menu' ) ) {
                Themify.body.removeClass( 'close-left-menu close-right-menu' );
                mobileMenu.empty();
            }
        }, 300 );
    },
    init=function(isResize,items,windowWidth){
        for(let i=items.length-1;i>-1;--i){
            let breakpoint = parseInt(items[i].getAttribute( 'data-menu-breakpoint' ));
           
			if(!Themify.cssLazy['tb_menu_dropdown'] && items[i].classList.contains('dropdown')){
				Themify.cssLazy['tb_menu_dropdown']=true;
				Themify.LoadCss(style_url+'dropdown.css');
			}
			if(!Themify.cssLazy['tb_menu_transparent'] || !Themify.cssLazy['tb_menu_vertical'] || !Themify.cssLazy['tb_menu_fullwidth']){
				let tmp = items[i].getElementsByClassName( 'nav' )[0];
				if(tmp){
					if(!Themify.cssLazy['tb_menu_transparent'] && tmp.classList.contains('transparent')){
						Themify.cssLazy['tb_menu_transparent']=true;
						Themify.LoadCss(style_url+'transparent.css');
					}
					let type=tmp.classList.contains('fullwidth')?'fullwidth':(tmp.classList.contains('vertical')?'vertical':'');
					if(type!=='' && !Themify.cssLazy['tb_menu_'+type]){
						Themify.cssLazy['tb_menu_'+type]=true;
						Themify.LoadCss(style_url+type+'.css');
					}
				}
			}
            if ( breakpoint>0) {
				if ( windowWidth >= breakpoint ) {
					items[i].classList.remove('module-menu-mobile-active');
				} else {
					items[i].classList.add('module-menu-mobile-active');
				}
            } 
        }
        if(!isActive){
            if (isResize===false) {
                let menuBurger = $( '.menu-module-burger' ),
                    breakpoint = menuBurger.parent().data( 'menu-breakpoint' ),
                    style = menuBurger.parent().data( 'menu-style' );
                if ( style === 'mobile-menu-dropdown' && menuBurger.length && windowWidth < breakpoint) {
                    Themify.body.on( 'click', function ( e ) {
                        const $target = $( e.target ),
                            menuContainer = $( '.module-menu-container' );
                        if ( !$target.closest( '.module-menu-container' ).length && menuContainer.is( ':visible' ) && !$target.closest( '.menu-module-burger' ).length && menuBurger.is( ':visible' ) ) {
                            menuBurger.removeClass( 'is-open' );
                            menuContainer.removeClass( 'is-open' );
                        }
                    } );
                }
            } else {
                closeMenu();
            }
        }
    };
    setTimeout(function(){
		Themify.LoadCss(style_url+'hidden.css');
	},800);
    Themify.on('tb_menu_init',function(items){
        if(items instanceof jQuery){
            items=items.get();
        }
        init(false,items,Themify.w);
    });
    if(!isActive){
        const builder = document.createElement('div'),
			link =  document.createElement('link'),
            mobileMenu = document.createElement('div');
            mobileMenu.className='mobile-menu-module';
			link.rel='prefetch';
			link.setAttribute('as','style');
			link.href=style_url+'mobile.css';
            builder.className='themify_builder themify_builder_content-'+document.getElementsByClassName( 'themify_builder_content' )[0].dataset.postid;
            builder.appendChild(mobileMenu);
        Themify.body[0].appendChild(builder);
        Themify.body[0].appendChild(link);
        Themify.body.on( 'click', '.menu-module-burger', function ( e ) {
            e.preventDefault();
            const $self = $( this );
            loadMobileCss(function(){
                const $parent = $self.parent(),
                elStyle = $parent.data( 'menu-style' );
            if ( elStyle === 'mobile-menu-dropdown' ) {
                $self.siblings( '.module-menu-container' ).toggleClass( 'is-open' );
                $self.toggleClass( 'is-open' );
                return;
            }

            const menuDirection = $parent.data( 'menu-direction' ),
                elID = $parent.data( 'element-id' );
            let gs = $parent.data( 'gs' ),
                menuContent = $parent.find( 'div[class*="-container"] > ul' ).clone(),
                menuUI = menuContent.prop( 'class' ).replace( /nav|menu-bar|fullwidth|vertical|with-sub-arrow/g, '' ),
                customStyle = $parent.prop( 'class' ).match( /menu-[\d\-]+/g );
            
            gs = !gs ? '' : ' ' + gs;
            customStyle = customStyle ? customStyle[0] : '';
            menuContent = menuContent.removeAttr( 'id' ).removeAttr( 'class' ).addClass( 'nav' );
            if ( menuContent.find( 'ul' ).length ) {
                menuContent.find( 'ul' ).prev( 'a' ).append( '<i class="toggle-menu"></i>' );
            }
            Themify.body.addClass( 'menu-module-' + menuDirection );
			Themify.lazyScroll(menuContent[0].querySelectorAll('[data-lazy]'),true);
            $( '.mobile-menu-module' ).addClass( menuDirection + ' ' + menuUI + ' ' + customStyle + ' ' + elID + ' ' + elStyle + gs + ' module-menu' )
                .attr( 'data-module', elID )
                .html( menuContent )
                .prepend( '<a class="menu-close"><span class="menu-close-inner tf_close"></span></a>' );

            $parent.find( '.body-overlay' ).addClass( 'body-overlay-on' );
            });
        } )
        .on( 'click', '.mobile-menu-module ul .toggle-menu', function ( e ) {
                e.preventDefault();
                const $linkIcon = $( this ),
                    $this = $linkIcon.closest( 'a' );
                loadMobileCss(function(){
                    $this.next( 'ul' ).toggle();
                    if ( !$linkIcon.hasClass( 'menu-close' ) ) {
                        $linkIcon.addClass( 'menu-close' );
                    } else {
                        $linkIcon.removeClass( 'menu-close' );
                    }
                });

        } ).on( 'click', '.mobile-menu-module ul a[href="#"]', function ( e ) {
            e.preventDefault();
        } )
        .on( 'click', '.module-menu .body-overlay,.mobile-menu-module .menu-close,.mobile-menu-module .menu-item a', function ( e ) {
                if ( $( e.target ).hasClass( 'toggle-menu' ) ) {
                    return;
                }
                loadMobileCss(function(){
                    let closeClass = 'close-';
                    closeClass += $( '.mobile-menu-module' ).hasClass( 'right' ) ? 'right' : 'left';
                    closeClass += '-menu';
                    Themify.body.addClass( closeClass );

                    closeMenu();
                });
            } );
    }
    
    Themify.on('tfsmartresize', function (e) {
        if(e){
            init(true,document.querySelectorAll('.module-menu.module'),e.w);
        }
    });

})(jQuery,Themify,document);