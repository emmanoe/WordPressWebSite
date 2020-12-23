(function ($,Themify,window,document,themify_vars,themifyScript) {
    'use strict';
    const ThemifyTheme = {
        isFullPageScroll:false,
        is_horizontal_scrolling:false,
        bodyCl:Themify.body[0].classList,
        headerType:themifyScript.headerType,
        v:themify_vars.theme_v,
        url:themify_vars.theme_url+'/',
        init(){
            this.isFullPageScroll=!Themify.is_builder_active && this.bodyCl.contains('full-section-scrolling');
            this.is_horizontal_scrolling=this.isFullPageScroll===true && this.bodyCl.contains('full-section-scrolling-horizontal');
            this.readyView();
            Themify.megaMenu(document.getElementById('main-nav'));
            this.headerRender();
            this.headerVideo();
            this.fixedHeader();
            if(this.isFullPageScroll===true){
                this.fullpage();
            }
			this.wc();
            this.clickableOverlay();
            this.mobileMenuDropDown();
            setTimeout(this.loadFilterCss.bind(this),800);
            setTimeout(this.searchForm.bind(this),1000);
            setTimeout(this.backToTop.bind(this),2000);
            this.doInfinite($('#loops-wrapper'));   
            setTimeout(this.commentAnimation,3500);
            this.revealingFooter();
            this.singleInfinie();
			this.splitMenu();
        },
        fixedHeader(){
            if(this.is_horizontal_scrolling===false && this.bodyCl.contains('fixed-header-enabled') && this.headerType!=='header-bottom' && document.getElementById('headerwrap')!==null){
                Themify.FixedHeader();
            }
        },
        revealingFooter(){
            if (this.bodyCl.contains('revealing-footer') && document.getElementById('footerwrap')!==null) {
                Themify.LoadAsync(this.url + 'js/modules/revealingFooter.js',null, this.v);
            }
        },
        doInfinite($container){
            if(themifyScript.infiniteEnable){
                Themify.infinity($container[0],{
                    scrollToNewOnLoad:themifyScript.scrollToNewOnLoad,
                    scrollThreshold: !('auto' !== themifyScript.autoInfinite),
                    history: !themifyScript.infiniteURL?false:'replace'
                });
            }
            const self=this;
            Themify.on('infiniteloaded.themify', function(){//should be enable always,for single infinity and others
                self.loadFilterCss();
            });
        },
        fullpage(e){
			const w=e ? e.w : Themify.w;
        	if (themifyScript['f_s_d'] && w <= parseInt(themifyScript['f_s_d'])){
        		Themify.lazyDisable = null;
				this.bodyCl.remove('full-section-scrolling');
				this.isFullPageScroll = false;
				Themify.on('tfsmartresize',this.fullpage.bind(this),true);
				if(typeof tbLocalScript!=='undefined' && tbLocalScript['scrollHighlight']){
					delete tbLocalScript['scrollHighlight']['scroll'];
					if(typeof ThemifyBuilderModuleJs!=='undefined'){
						ThemifyBuilderModuleJs.InitScrollHighlight();
					}
				}
				return;
			}
			this.bodyCl.add('full-section-scrolling');
			Themify.lazyDisable = true;
        	this.isFullPageScroll = true;
        	const usesRows = document.getElementsByClassName('type-section')[0]===undefined;
			if (usesRows && document.getElementsByClassName('themify_builder')[0]===undefined) {
				return;
			}
            const slideClass = '.module_row_slide';
            let sectionClass = '.section-post:not(.section-post-slide)',
                sectionsWrapper= 'div:not(.module-layout-part) > #loops-wrapper';
            if (usesRows) {
                sectionClass = '.module_row:not('+slideClass+')';
                sectionsWrapper = 'div:not(.module-layout-part) > .themify_builder_content:not(.not_editable_builder)';
            }
            const options = {
                'usesRows':usesRows,
                'sectionClass':sectionClass,
                'is_horizontal':this.is_horizontal_scrolling,
                'slideClass': slideClass,
                'sectionsWrapper':sectionsWrapper
            };
            Themify.LoadAsync(this.url + 'js/modules/fullpage.js',function(){
                    Themify.trigger('themify_theme_fullpage_init',options);
            }, this.v);
        },
        searchForm(){
            const search = document.getElementById('search-lightbox-wrap');
            if(search){
                const search_button=document.getElementsByClassName('search-button')[0];
                if(search_button){
                    const self=this,
                        loaded={};
                    search_button.addEventListener('click',function(e){
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        const _check = function(){
                            if(loaded['search'] && loaded['css_search']){
                                Themify.trigger('themify_theme_search_init',$(search));
                                $(search_button).click();
                            }
                        };
                        Themify.LoadCss(self.url + 'styles/modules/search-form-overlay.css', self.v,null,null,function(){
                            loaded['css_search']=true;
                            _check();
                        });
                        Themify.LoadAsync(self.url + 'js/modules/search.js',function(){
                            loaded['search']=true;
                            _check();
                        }, self.v);
                    },{once:true});
                }
            }
        },
        loadFilterCss(){
                const filters = ['blur','grayscale','sepia','none'];
                for(let i=filters.length-1;i>-1;--i){
                        if(document.getElementsByClassName('filter-'+filters[i])[0]!==undefined || document.getElementsByClassName('filter-hover-'+filters[i])[0]!==undefined){
                                Themify.LoadCss(this.url + 'styles/modules/filters/'+filters[i]+'.css',this.v);
                        }
                }
        },
        headerVideo(){
			const header = document.getElementById('headerwrap');
			if(header){
				const videos=Themify.selectWithParent('[data-fullwidthvideo]',header);
				if(videos.length>0){
					Themify.LoadAsync(this.url + 'js/modules/headerVideo.js',function(){
						Themify.trigger('themify_theme_header_video_init',[videos]);
					}, this.v);
				}
			}
        }, 
		wc(){
            if(window['woocommerce_params']!==undefined){
                Themify.LoadAsync(this.url + 'js/modules/wc.js',null, this.v);
            }
        },
        mobileMenuDropDown(){
            const items = document.getElementsByClassName('toggle-sticky-sidebar');
            for(let i=items.length-1;i>-1;--i){
                items[i].addEventListener('click',function () {
                        var sidebar = $('#sidebar');
                        if ($(this).hasClass('open-toggle-sticky-sidebar')) {
                                $(this).removeClass('open-toggle-sticky-sidebar').addClass('close-toggle-sticky-sidebar');
                                sidebar.addClass('open-mobile-sticky-sidebar tf_scrollbar');
                        } else {
                                $(this).removeClass('close-toggle-sticky-sidebar').addClass('open-toggle-sticky-sidebar');
                                sidebar.removeClass('open-mobile-sticky-sidebar tf_scrollbar');
                        }
                },{passive:true});
            }
        },

        splitMenu() {
			if ( this.headerType === 'header-menu-split' ) {
				const self = this,
				_resize = function(){
					if ( self.bodyCl.contains( 'mobile_menu_active' ) ) {
						/* on mobile move the site logo to the header */
						$( '#main-nav #site-logo' ).prependTo( '.header-bar' );
					} else {
						$( '.header-bar #site-logo' ).prependTo( $( '#main-nav .themify-logo-menu-item' ) );
					}
				};
				_resize();
				Themify.on('tfsmartresize',function(e){
					if(e){
						_resize(e);
					}
				});
			}
        },
        clickableOverlay(){
            setTimeout(function(){
                Themify.body.on('click', '.post-content', function (e) {
                    if(e.target.tagName!=='A' && e.target.tagName!=='BUTTON'){
						const el = this.closest('.loops-wrapper');
						if(el!==null){
							const cl =el.classList;
							if((cl.contains('grid6') || cl.contains('grid5')|| cl.contains('grid4') || cl.contains('grid3') || cl.contains('grid2')) && (cl.contains('polaroid') || cl.contains('overlay') || cl.contains('flip'))){
								const $link = $(this).closest('.post').find('a[data-post-permalink]');
								if ($link.attr('href') && !$link.hasClass('themify_lightbox')) {
									window.location = $link.attr('href');
								}
							}
						}
					}
                });
            },1500);
        },
        headerRender(){
            const type=this.headerType;
            if(type==='header-horizontal' || type==='header-top-bar' || type==='boxed-compact'|| type==='header-stripe'){
				const headerWidgets = document.getElementsByClassName('header-widget')[0];
				if (headerWidgets!==undefined) {
					const self =this,
					pullDown=document.getElementsByClassName('pull-down')[0];
					if(pullDown!==undefined){
						pullDown.addEventListener('click', function (e) {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    $('#header').toggleClass('pull-down-close');
                                                    $(headerWidgets).slideToggle('fast');
						});
					}
				}
			}
            Themify.sideMenu(document.getElementById('menu-icon'),{
                close: '#menu-icon-close',
                side:type==='header-leftpane' || type==='header-minbar'?'left':'right',
                hasOverlay:!(type==='header-slide-out' || type==='header-rightpane')
            });
            // Expand Mobile Menus
            if(undefined != themify_vars.m_m_expand){
                Themify.on('sidemenushow.themify', function(panel_id){
                    if('#mobile-menu'===panel_id){
                        const items = document.querySelectorAll('#main-nav>li.has-sub-menu');
                        for(let i=items.length-1;i>-1;i--){
                            items[i].className+=' toggle-on';
                        }
                    }
                },true);
            }
        },
        backToTop(){
            const back_top = document.getElementsByClassName('back-top'),
				type=this.headerType,
				isFullpageScroll=this.isFullPageScroll,
				back_top_float=isFullpageScroll?null:document.querySelector('.back-top-float:not(.footer-tab)');
				if(back_top_float){
					const events =['scroll'],
						scroll=function(){
							back_top_float.classList.toggle ('back-top-hide',(this.scrollY < 10));
							
						};
						if(Themify.isTouch){
							events.push('touchstart');
							events.push('touchmove');
						}
						for(let i=events.length-1;i>-1;--i){
							window.addEventListener(events[i],scroll,{passive:true});
						}
				}
			if (back_top[0]) {
				for(let i=back_top.length-1;i>-1;--i){
					back_top[i].addEventListener('click',function (e) {
						e.preventDefault();
						e.stopPropagation();
						if (isFullpageScroll || this.classList.contains('footer-tab')) {
                                                        const wrap = document.getElementById('footerwrap');
                                                        if(wrap){
															wrap.classList.remove('tf_hide');
                                                            Themify.lazyScroll(wrap.querySelectorAll('[data-lazy]'),true);
                                                            wrap.classList.toggle('expanded');
                                                        }
						}
						else {
							Themify.scrollTo();
						}
					});
				}
            }
        },
        commentAnimation(){
            if(document.getElementById('commentform')){
                Themify.body.on( 'focus.tfCommentLabel', '#commentform input, #commentform textarea', function () {
					$( this ).closest( 'p' ).addClass('focused');
                }).on( 'blur.tfCommentLabel', '#commentform input, #commentform textarea', function () {
					if ( this.value === '' ) {
						$(this).removeClass('filled').closest('p').removeClass('focused');
					} else {
						$(this).addClass('filled');
					}
				} );
            }
        },
        readyView(){
            if (this.isFullPageScroll || '1' === themifyScript.pageLoaderEffect) {
                const self = this,
                 callback = function(){
                    self.bodyCl.add('ready-view');
                    self.bodyCl.remove('hidden-view');
                    $('.section_loader').fadeOut(500);
                    window.addEventListener('beforeunload', function (e) {
                        if (e.target.activeElement.tagName === 'BODY'
                                || ($(e.target.activeElement).attr('id') === 'tb_toolbar')
                                || $(e.target.activeElement).closest('#tb_toolbar').length)
                            return;
                        self.bodyCl.add('hidden-view');
                        if (self.bodyCl.contains('ready-view')) {
                            self.bodyCl.remove('ready-view');
                        }
                    });
                };
                if(this.isFullPageScroll && !(themifyScript['f_s_d'] && Themify.w<=parseInt(themifyScript['f_s_d']))){
                    Themify.on('themify_onepage_afterload',callback,true);
                }
                else{
                    callback();
                }
            }
        },
		singleInfinie(){
			if(document.getElementsByClassName('tf_single_scroll_wrap')[0]){
				const self=this;
				window.addEventListener('scroll',function(){
					Themify.LoadAsync(self.url + 'js/modules/single-infinite.js',null, self.v);
				},{once:true,passive:true});
			}
		}
    };
    ThemifyTheme.init();
})(jQuery,Themify,window,document,themify_vars,themifyScript);
