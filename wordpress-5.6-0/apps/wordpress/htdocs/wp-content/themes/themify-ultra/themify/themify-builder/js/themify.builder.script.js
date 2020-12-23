let ThemifyBuilderModuleJs;

(function ($, window,Themify, document,tbLocalScript) {
    'use strict';

    ThemifyBuilderModuleJs = {
        loadedAddons:{},
		cssUrl:tbLocalScript.css_module_url,
		jsUrl:tbLocalScript.js_module_url,
		js_modules:tbLocalScript.js_modules,
		isBpMobile:!Themify.is_builder_active && Themify.w<parseInt(tbLocalScript.breakpoints.tablet[1]),
        init() {
            Themify.body.triggerHandler('themify_builder_loaded');
            if (!Themify.is_builder_active) {
                this.setupBodyClasses();
                this.GridBreakPoint();
                this.InitScrollHighlight();
            }
        },
        wowInit(el, options,isLazy) {
			if(tbLocalScript['is_animation']==='' || (this.isBpMobile===true && tbLocalScript['is_animation']==='m')){
				return;
			}
            let items;
            if(isLazy===true){
                if(!el[0].hasAttribute('data-tf-animation') && !el[0].classList.contains('hover-wow')){
                    if(el[0].parentNode && (el[0].parentNode.hasAttribute('data-tf-animation') || el[0].parentNode.classList.contains('hover-wow'))){
                        items=[el[0].parentNode];
                    }
                    else{
                        return;
                    }
                }
                else{
                    items=el;
                }
            }
            else{
                if(el){
                    items=el[0].querySelectorAll('.hover-wow,[data-tf-animation]');
                    if(el[0].classList.contains('hover-wow') || el[0].hasAttribute('data-tf-animation')){
                            items=Themify.convert(items);
                            items.push(el[0]);
                    }
                }
                else{
                    items=document.querySelectorAll('.hover-wow,[data-tf-animation]');
                }
            }
            if(items[0]){
                Themify.loadWowJs(function(){
					Themify.trigger('tf_wow_init',[items,options]);
				});
            }
        },
        setupFullwidthRows(el,isLazy) {
            if (tbLocalScript['fullwidth_support']) {
                return;
            }
            let items;
            if(isLazy===true){
                if(!el[0].classList.contains('fullwidth') && !el[0].classList.contains('fullwidth_row_container')){
                    return;
                }
                items=el;
            }
            else{
                if (!el) {
                    items=document.querySelectorAll('.fullwidth.module_row,.fullwidth_row_container.module_row');
                }
                else{
                    items=el.find('.fullwidth.module_row,.fullwidth_row_container.module_row');
                    if(el[0].classList.contains('fullwidth') || el[0].classList.contains('fullwidth_row_container')){
                        items=items.add(el);
                    }
                    items=items.get();
                }
            }
            if(items[0]){
                if(!Themify.jsLazy['tb_fwr']){
                    Themify.LoadAsync(this.js_modules.fwr,function(){
                        Themify.jsLazy['tb_fwr']=true;
                        Themify.trigger('tb_fullwidthrows_init',[items]);
                    },null,null,function(){
                        return !!Themify.jsLazy['tb_fwr'];
                    });
                }
                else{
                    Themify.trigger('tb_fullwidthrows_init',[items]);
                }
            }
        },
        InitScrollHighlight(el,isLazy) {
            if(isLazy===true || Themify.is_builder_active===true || (tbLocalScript['scrollHighlight'] && tbLocalScript['scrollHighlight']['scroll']==='external')){// can be 'external' so no scroll is done here but by the theme. Example:Fullpane.
                return;
            }
            let hasItems=el?(Themify.selectWithParent('[data-anchor]',el).length>0):(document.querySelector('[data-anchor]')!==null);
            if(hasItems===false){
                const hash= window.location.hash.replace('#','');
                if(hash!=='' && hash!=='#'){
                    hasItems=document.querySelector('[data-id="'+hash+'"]')!==null;
                }
            }
            if(hasItems===true){
                if(!Themify.jsLazy['tb_scroll_highlight']){
                    Themify.LoadAsync(this.js_modules.sh, function () {
                        Themify.jsLazy['tb_scroll_highlight']=true;
                        Themify.trigger('tb_init_scroll_highlight',[el]);
                     }, null, null, function () {
                         return !!Themify.jsLazy['tb_scroll_highlight'];
                    }); 
                }
                else{
                    Themify.trigger('tb_init_scroll_highlight',[el]);
                }
            }
        },
        // Row, col, sub-col, sub_row:Background Slider
        backgroundSlider(el,isLazy) {
            let items;
            if(isLazy===true){
                if(el[0].classList.contains('module')){
                    return;
                }
                items = el[0].getElementsByClassName('tb_slider')[0];
                if(!items || items.parentNode!==el[0]){
                    return;
                }
                items=[items];
            }
            else{
                items = Themify.selectWithParent('tb_slider',el); 
            }
            if (items[0]) {
                if(!Themify.jsLazy['tb_bgs']){
                    Themify.LoadAsync(this.js_modules.bgs,function(){
                        Themify.jsLazy['tb_bgs']=true;
                        Themify.trigger('tb_bgslider_init',[items]);
                    },null,null,function(){
                        return !!Themify.jsLazy['tb_bgs'];
                    });
                }
                else{
                    Themify.trigger('tb_bgslider_init',[items]);
                }
            }
        },
        // Row:Fullwidth video background
        fullwidthVideo(el, parent,isLazy) {
            let items=null;
            if(isLazy===true){
                if(!el[0].hasAttribute('data-fullwidthvideo')){
                    return;
                }
                items=el;
            }
            else{
                const p=el?el:(parent?parent:null);
                items = Themify.convert(Themify.selectWithParent('[data-fullwidthvideo]',p));
                for(let i=items.length-1;i>-1;--i){
                    let cl=items[i].classList;
                    if(!cl.contains('module_row') && !cl.contains('module_column') && !cl.contains('module_subrow') && !cl.contains('tb_slider_vid')){
                        items.splice(i,1);
                    }
                }
            }
            if (items[0]) {
                if(!Themify.jsLazy['tb_fwv']){
                    Themify.LoadAsync(this.js_modules.fwv,function(){
                        Themify.jsLazy['tb_fwv']=true;
                        Themify.trigger('tb_fullwidth_video_init',[items]);
                    },null,null,function(){
                       return !!Themify.jsLazy['tb_fwv'];
                    });
                }
                else{
                    Themify.trigger('tb_fullwidth_video_init',[items]);
                }
            }
        },
        feature(el,isLazy) {
            let items;
            if(isLazy===true){
                if(!el[0].classList.contains('module-feature')){
                    return;
                }
                items = el;
            }
            else{
                items = Themify.selectWithParent('module-feature', el);
            }
            if (items[0]) {
                if(!Themify.jsLazy['tb_feature']){
                    Themify.LoadAsync(this.js_modules.feature,function(){
                        Themify.jsLazy['tb_feature']=true;
                        Themify.trigger('tb_feature_init',[items]);
                    },null,null,function(){
                        return !!Themify.jsLazy['tb_feature'];
                    });
                }
                else{
                    Themify.trigger('tb_feature_init',[items]);
                }
            };
        },
        addonLoad(el, slug,isLazy) {
            if (window['tbLocalScript']['addons'] && Object.keys(window['tbLocalScript']['addons']).length > 0) {
                let addons;
                if(slug){
                    if(!window['tbLocalScript'].addons[slug] || this.loadedAddons[slug]===true){
                        return;
                    }
                    else {
                        addons = {};
                        addons[slug] = window['tbLocalScript'].addons[slug];
                    }
                }
                else{
                    addons = window['tbLocalScript'].addons;
                }
				const self=this;
                for (let i in addons) {
                    if(this.loadedAddons[i]!==true){
                            let found =false;
                            if(addons[i]['selector']){
                                    found=isLazy===true?(el[0].querySelector( addons[i]['selector'] )!==null || el[0].matches( addons[i]['selector'] )):document.querySelector(addons[i]['selector'] )!==null;
                            }
                            else{
                                    found=isLazy===true?el[0].classList.contains( 'module-' + i ):document.getElementsByClassName( 'module-' + i )[0]!==undefined;
                            }
                            if (found===true) {
                                    if (addons[i].css) {
                                        if(typeof addons[i].css === 'string'){
                                            Themify.LoadCss(addons[i].css, addons[i].ver);
                                        }
                                        else{
                                            for(let j=addons[i].css.length-1;j>-1;--j){
                                                Themify.LoadCss(addons[i].css[j], addons[i].ver);
                                            }
                                        }
                                        delete window['tbLocalScript']['addons'][i]['css'];
                                    }
                                    if (addons[i].js) {
                                            Themify.LoadAsync(addons[i]['js'], function(){
                                                    self.loadedAddons[i]=true;
                                                    Themify.trigger('builder_load_module_partial', [el, slug,isLazy]);
                                                    delete window['tbLocalScript']['addons'][i]['js'];
                                            }, addons[i]['ver'],{'before':addons[i]['external']},function(){
                                                    return self.loadedAddons[i]===true;
                                            });
                                    }
                                    if (slug) {
                                            return;
                                    }
                            }
                    }
                }
            }
        },
        loadOnAjax(el, type,lazy) {
            let slug=null;
            this.loadCssAppearance();
            this.rowColumnStyles(el,lazy);
            this.loadModulesCss(el,type,lazy);
            this.tabs(el,lazy);
            this.accordion(el,lazy);
            this.feature(el,lazy);
            this.backgroundSlider(el,lazy);
          
            this.backgroundZoomScroll(el,lazy);
            this.backgroundZooming(el,lazy);
            this.backgroundScrolling(el,lazy);
            this.menuModuleMobileStuff(el,lazy);
            this.gallery(el,lazy);
            this.overlayContentModule(el,lazy);
            if (Themify.is_builder_active===false) {
                this.alertModule(el,lazy);
                this.stickyElementInit(el,lazy);
            }
            else{
                slug = type === 'module' && tb_app.activeModel !== null ? tb_app.activeModel.get('mod_name') :false;
            }
            Themify.trigger('builder_load_module_partial', [el, type,lazy]);
            this.addonLoad(el,slug,lazy);
            this.initWC(el,lazy);
            if ( ( type === 'row' || ! type ) && ( ! el
				|| ( el !== undefined && ! el[0].closest( '.tb_overlay_content_lp' ) ) // disable fullwidth row in Overlay Content module
			) ) {
                this.setupFullwidthRows(el,lazy);
            }
            this.fullwidthVideo(el, null,lazy);
			this.wowInit(el, null,lazy);
            this.InitScrollHighlight(el,lazy);
            this.videoPlay(el,lazy);
            this.readMoreLink(el,lazy);
        },
        initWC(el,isLazy){
            if(isLazy!==true && window['wc_single_product_params']!==undefined){
                $( '.wc-tabs-wrapper, .woocommerce-tabs, #rating',el).each(function(){
                        if(!this.hasAttribute('tb_done')){
                                this.setAttribute('tb_done',1);
                                if(this.id!=='rating' || this.parentNode.getElementsByClassName('stars')[0]){
                                        $(this).trigger( 'init' );
                                }
                        }

                });
                if(typeof $.fn.wc_product_gallery!=='undefined'){
                    const args=window['wc_single_product_params'];
                    $( '.woocommerce-product-gallery',el ).each( function() {
                        if(!this.hasAttribute('tb_done')){
                            $( this ).trigger( 'wc-product-gallery-before-init', [ this, args ] )
                                    .wc_product_gallery( args )
                                    .trigger( 'wc-product-gallery-after-init', [ this, args ] )[0].setAttribute('tb_done',1);
                        }
                    } );
                }
            }
        },
        touchdropdown(el,isLazy) {
            if (Themify.isTouch) {
                const items=isLazy===true?(el[0].classList.contains('module-menu')?el[0].getElementsByClassName('nav')[0]:null):$('.module-menu .nav', el);
                if(!items || !items[0]){
                    return;
                }
                Themify.LoadCss(this.cssUrl+'menu_styles/sub_arrow.css',function(){
                    Themify.loadDropDown(items);
                });
            }
        },
        backgroundScrolling(el,isLazy) {
			if(tbLocalScript['is_parallax']==='' || (this.isBpMobile===true && tbLocalScript['is_parallax']==='m')){
                return true;
			}
			let items;
			if(isLazy===true){
				if(!el[0].classList.contains('builder-parallax-scrolling')){
					return;
				}
				items=el;
			}
			else{
				items=Themify.selectWithParent('builder-parallax-scrolling',el);
			}
			if(items[0]){
				if(!Themify.jsLazy['tb_parallax']){
					Themify.LoadAsync(this.js_modules.parallax,function(){
						Themify.jsLazy['tb_parallax']=true;
						Themify.trigger('tb_parallax_init',[items]);
					},null,null,function(){
					   return !!Themify.jsLazy['tb_parallax'];
					});
				}
				else{
					Themify.trigger('tb_parallax_init',[items]);
				}
			}
        },
        backgroundZoomScroll(el,isLazy) {
			let items;
			if(isLazy===true){
				if(!el[0].classList.contains('builder-zoom-scrolling')){
					return;
				}
				items=el;
			}
			else{
				items=Themify.selectWithParent('builder-zoom-scrolling',el);
			}
			if(items[0]){
				if(!Themify.jsLazy['tb_bgzs']){
					Themify.LoadAsync(this.js_modules.bgzs,function(){
						Themify.jsLazy['tb_bgzs']=true;
						Themify.trigger('tb_bgzoom_scroll_init',[items]);
					},null,null,function(){
						return !!Themify.jsLazy['tb_bgzs'];
					});
				}
				else{
					Themify.trigger('tb_bgzoom_scroll_init',[items]);
				}
			}
        },
        backgroundZooming(el,isLazy) {
			let items;
			if(isLazy===true){
				if(!el[0].classList.contains('builder-zooming')){
					return;
				}
				items=el;
			}
			else{
				items=Themify.selectWithParent('builder-zooming',el);
			}
			if(items[0]){
				if(!Themify.jsLazy['tb_bgzoom']){
					Themify.LoadAsync(this.js_modules.bgzoom,function(){
						Themify.jsLazy['tb_bgzoom']=true;
						Themify.trigger('tb_bgzoom_init',[items]);
					},null,null,function(){
						return !!Themify.jsLazy['tb_bgzoom'];
					});
				}
				else{
					Themify.trigger('tb_bgzoom_init',[items]);
				}
			}
        },
        setupBodyClasses() {
            if (!Themify.is_builder_active) {
                const builder = document.getElementsByClassName('themify_builder_content');
                for(let i=builder.length-1;i>-1;--i){
                    if (builder[i].getElementsByClassName('module_row')[0]) {
                        Themify.body[0].classList.add('has-builder');
                        break;
                    }
                }
            }
        },
        gallery(el,isLazy) {
            let items;
            if(isLazy===true){
                if(!el[0].classList.contains('module-gallery')){
                    return;
                }
                items = el;
            }
            else{
                items = Themify.selectWithParent('module-gallery',el);
            }
            if(items[0]){
                if(!Themify.jsLazy['tb_gallery']){
                    Themify.LoadAsync(this.js_modules.gallery,function(){
                        Themify.jsLazy['tb_gallery']=true;
                        Themify.trigger('tb_gallery_init',[items]);
                    },null,null,function(){
                        return !!Themify.jsLazy['tb_gallery'];
                    });
                }
                else{
                    Themify.trigger('tb_gallery_init',[items]);
                }
            }
        },
        menuModuleMobileStuff(el,isLazy) {
            let items;
            if(isLazy===true){
                if(!el[0].classList.contains('module-menu')){
                    return;
                }
                items = el;
            }
            else{
                items = Themify.selectWithParent('module-menu',el); 
            }
            if ( items[0] ) {
                if(!Themify.jsLazy['tb_menu']){
                    Themify.LoadAsync(this.js_modules.menu,function(){
                        Themify.jsLazy['tb_menu']=true;
                        Themify.trigger('tb_menu_init',[items]);
                    },null,null,function(){
                        return !!Themify.jsLazy['tb_menu'];
                    });
                }
                else{
                    Themify.trigger('tb_menu_init',[items]);
                }
                this.touchdropdown(el,isLazy);
            }
        },
        GridBreakPoint() {
            const tablet_landscape = tbLocalScript.breakpoints.tablet_landscape,
                    tablet = tbLocalScript.breakpoints.tablet,
                    mobile = tbLocalScript.breakpoints.mobile,
					self=this,
                    rows = document.querySelectorAll('.row_inner,.subrow_inner');
                    let prev = false,
                    Breakpoints = function (width) {
                        let type = 'desktop';

                        if (width <= mobile) {
                            type = 'mobile';
                        } else if (width <= tablet[1]) {
                            type = 'tablet';
                        } else if (width <= tablet_landscape[1]) {
                            type = 'tablet_landscape';
                        }

                        if (type !== prev) {
                            const is_desktop = type === 'desktop',
                                    set_custom_width = is_desktop || prev === 'desktop';

                            if (is_desktop) {
                                Themify.body[0].classList.remove('tb_responsive_mode');
                            } else {
                                if(!Themify.cssLazy['tb_responsive_mode'] && document.querySelector('[data-basecol]')!==null){
                                    Themify.cssLazy['tb_responsive_mode']=true;
                                    Themify.LoadCss(self.cssUrl + 'responsive-column.css');
                                }
                                Themify.body[0].classList.add('tb_responsive_mode');
                            }

                            for (let i =rows.length-1; i > -1; --i) {
                                let columns = rows[i].children,
                                        grid = rows[i].getAttribute('data-col_' + type),
                                        first = columns[0],
                                        last = columns[columns.length - 1],
                                        base = rows[i].getAttribute('data-basecol');

                                if (set_custom_width) {
                                    for (let j =columns.length-1; j > -1; --j) {
                                        let w = columns[j].getAttribute('data-w');
                                        if (w) {
                                            if (is_desktop) {
                                                columns[j].style['width'] = w + '%';
                                            } else {
                                                columns[j].style['width'] = '';
                                            }
                                        }
                                    }
                                }
                                let dir = rows[i].getAttribute('data-'+type + '_dir');

                                if (first && last) {
                                    if (dir === 'rtl') {
                                        first.classList.remove('first');
                                        first.classList.add('last');
                                        last.classList.remove('last');
                                        last.classList.add('first');
                                        rows[i].classList.add('direction-rtl');
                                    } else {
                                        first.classList.remove('last');
                                        first.classList.add('first');
                                        last.classList.remove('first');
                                        last.classList.add('last');
                                        rows[i].classList.remove('direction-rtl');
                                    }
                                }

                                if (base && !is_desktop) {
                                    if (prev !== false && prev !== 'desktop') {
                                        rows[i].classList.remove('tb_3col');
                                        let prev_class = rows[i].getAttribute('data-col_' + prev);

                                        if (prev_class) {
                                            rows[i].classList.remove($.trim(prev_class.replace('tb_3col', '').replace('mobile', 'column').replace('tablet', 'column')));
                                        }
                                    }

                                    if (!grid || grid === '-auto'|| grid===type+'-auto') {
                                        rows[i].classList.remove('tb_grid_classes');
                                        rows[i].classList.remove('col-count-' + base);
                                    } else {
                                        let cl = rows[i].getAttribute('data-col_' + type);

                                        if (cl) {
                                            rows[i].classList.add('tb_grid_classes');
                                            rows[i].classList.add('col-count-' + base);
                                            cl = cl.split(' ');
                                            for(let j=cl.length-1;j>-1;--j){
                                                rows[i].classList.add($.trim(cl[j].replace('mobile', 'column').replace('tablet', 'column')));
                                            }
                                        }
                                    }
                                }
                            }
                            prev = type;
                        }
                    };
			
            Breakpoints(Themify.w);
            Themify.on('tfsmartresize', function (e) {
                if(e && e.w!==Themify.w){
                    Breakpoints(e.w);
                }
            });
        },
        readMoreLink(el,isLazy) {
            if(!Themify.jsLazy['tb_read'] && ((isLazy===true && el[0].getElementsByClassName('module-text-more')[0]) || (isLazy!==true && document.getElementsByClassName('module-text-more')[0]))){
                Themify.jsLazy['tb_read']=true;
                Themify.LoadAsync(this.js_modules.read);
            }
        },
        stickyElementInit(el,isLazy) {
			if(tbLocalScript['is_sticky']==='' || (this.isBpMobile===true && tbLocalScript['is_sticky']==='m')){
				return;
			}
            let items;
            if(isLazy===true){
                if(!el[0].hasAttribute('data-sticky-active')){
                    return;
                }
                items = el;
            }else{
                items = Themify.selectWithParent('[data-sticky-active]',el);
            }
            if(items[0]){
                if(!Themify.jsLazy['tb_sticky']){
                    Themify.LoadAsync(this.js_modules.sticky,function(){
                        Themify.jsLazy['tb_sticky']=true;
                        Themify.trigger('tb_sticky_init',[items]);
                    },null,null,function(){
                        return !!Themify.jsLazy['tb_sticky'];
                    });
                }
                else{
                    Themify.trigger('tb_sticky_init',[items]);
                }
            }
        },
        alertModule(el,isLazy) {
            let items;
            if(isLazy===true){
                if(!el[0].classList.contains('module-alert')){
                    return;
                }
                items = el;
            }
            else{
                items = Themify.selectWithParent('module-alert',el);
            }
            if(items[0]){
                if(!Themify.jsLazy['tb_alert']){
                    Themify.LoadAsync(this.js_modules.alert,function(){
                        Themify.jsLazy['tb_alert']=true;
                        Themify.trigger('tb_alert_init',[items]);
                    },null,null,function(){
                        return !!Themify.jsLazy['tb_alert'];
                    });
                }
                else{
                    Themify.trigger('tb_alert_init',[items]);
                }
            }
        },
        tabs(el,isLazy) {
            let items;
            if(isLazy===true){
                if(!el[0].classList.contains('module-tab')){
                    return;
                }
                items = el;
            }
            else{
                items = Themify.selectWithParent('module-tab',el);
            }
            if(items[0]){
                Themify.requestIdleCallback(function(){
                    if(!Themify.jsLazy['tb_tab']){
                        Themify.LoadAsync(this.js_modules.tab,function(){
                            Themify.jsLazy['tb_tab']=true;
                            Themify.trigger('tb_tab_init',[items,isLazy]);
                        },null,null,function(){
                           return !!Themify.jsLazy['tb_tab'];
                        });
                    }
                    else{
                        Themify.trigger('tb_tab_init',[items,isLazy]);
                    }
                }.bind(this),1200);
            }
        },
        accordion(el,isLazy) {
            let items;
            if(isLazy===true){
                if(!el[0].classList.contains('module-accordion')){
                    return;
                }
                items = el;
            }
            else{
                items = Themify.selectWithParent('module-accordion',el);
            }
             if(items[0]){
                Themify.requestIdleCallback(function(){
                    if(!Themify.jsLazy['tb_accordion']){
                        Themify.LoadAsync(this.js_modules.accordion,function(){
                            Themify.jsLazy['tb_accordion']=true;
                            Themify.trigger('tb_accordion_init',[items,isLazy]);
                        },null,null,function(){
                           return !!Themify.jsLazy['tb_accordion'];
                        });
                    }
                    else{
                        Themify.trigger('tb_accordion_init',[items,isLazy]);
                    }
                }.bind(this),1200);
            }
        },
        overlayContentModule(el,isLazy) {
            let items;
            if(isLazy===true){
                if(!el[0].classList.contains('module-overlay-content')){
                    return;
                }
                items = el;
            }
            else{
                items = Themify.selectWithParent('module-overlay-content',el);
            }
            if ( items[0] ) {
                if(!Themify.jsLazy['tb_oc']){
                    Themify.LoadAsync(this.js_modules.oc,function(){
                        Themify.jsLazy['tb_oc']=true;
                        Themify.trigger('tb_overlay_content_init',[items]);
                    },null,null,function(){
                        return !!Themify.jsLazy['tb_oc'];
                    });
                }
                else{
                    Themify.trigger('tb_overlay_content_init',[items]);
                }
            }
        },
        videoPlay(el,isLazy){
            let items;
            if(isLazy===true){
                if(!el[0].classList.contains('module-video')){
                    return;
                }
                items = el;
            }
            else{
                items = Themify.selectWithParent('module-video',el);
            }
            if(items[0]){
                if(!Themify.jsLazy['tb_video']){
                    Themify.LoadAsync(this.js_modules.video,function(){
                        Themify.jsLazy['tb_video']=true;
                        Themify.trigger('tb_video_init',[items]);
                    },null,null,function(){
                        return !!Themify.jsLazy['tb_video'];
                    });
                }
                else{
                    Themify.trigger('tb_video_init',[items]);
                }
            }
        },
        rowColumnStyles(el,isLazy){
                if(!Themify.cssLazy['tb_frame']  && ((isLazy===true && el[0].getElementsByClassName('tb_row_frame')[0]) || (isLazy!==true && (Themify.is_builder_active || document.getElementsByClassName('tb_row_frame')[0])))){
                        Themify.cssLazy['tb_frame']=true;
                        Themify.LoadCss(this.cssUrl + 'frames.css');
                }
                if(!Themify.cssLazy['tb_bg_zoom']  && ((isLazy===true && el[0].classList.contains('themify-bg-zoom')) || (isLazy!==true && (Themify.is_builder_active || document.getElementsByClassName('themify-bg-zoom')[0])))){
                        Themify.cssLazy['tb_bg_zoom']=true;
                        Themify.LoadCss(this.cssUrl + 'bg-zoom.css');
                }
                if(!Themify.cssLazy['tb_cover']  && ((isLazy===true && el[0].getElementsByClassName('builder_row_cover')[0]) || (isLazy!==true && (Themify.is_builder_active || document.getElementsByClassName('builder_row_cover')[0])))){
                        Themify.cssLazy['tb_cover']=true;
                        Themify.LoadCss(this.cssUrl + 'cover.css');
                }
        },
        loadCssAppearance(){
            this.loadCssColors();
            const appearance=['rounded','gradient','glossy','embossed','shadow'];
            for(let i=appearance.length-1;i>-1;--i){
                if(!Themify.cssLazy['tb_'+appearance[i]]  && document.getElementsByClassName(appearance[i])[0]){
                    Themify.cssLazy['tb_'+appearance[i]]=true;
                    Themify.LoadCss(this.cssUrl + 'appearance/'+appearance[i]+'.css');
                }
            }
        },
        loadCssColors(){
            const colors=['pink','red','yellow','orange','brown','purple','green','light-purple','light-green','light-blue','blue','gray','black','tb_default_color','default'];
            for(let i=colors.length-1;i>-1;--i){
                if(!Themify.cssLazy['tb_'+colors[i]]  && document.querySelector('.ui.'+colors[i])!==null){
					if(colors[i]==='default'){
						Themify.cssLazy['tb_default']=true;
						colors[i]='tb_default_color';
					}
                    Themify.cssLazy['tb_'+colors[i]]=true;
                    Themify.LoadCss(this.cssUrl + 'colors/'+colors[i]+'.css');
                }
            }
        },
        loadModulesCss(el,type,isLazy){
			const modules=['image','buttons','service-menu'],
                cl=isLazy===true?el[0].classList:null;
            let item=isLazy===true?el[0]:document;
			if(el && Themify.is_builder_active && window['Isotope']){
				const masonry = Themify.selectWithParent('masonry-done',el);
				for(let i=masonry.length-1;i>-1;--i){
					let m=Isotope.data(masonry[i]);
					if(m){
						m.destroy();
					}
					masonry[i].classList.remove('masonry-done');
				}
			}
			
            for(let i=modules.length-1;i>-1;--i){
                let _styles,
                    m=modules[i],
                    _css={},
                    key=m;
                if(m==='image'){
                    _styles=['image-card-layout','image-full-overlay','image-overlay','image-left','image-center','image-right','image-top'];
                    _css['zoom']='zoom';
                }
                else if(m==='buttons'){
                    _styles=['buttons-vertical','buttons-fullwidth','outline'];
                }
                else if(m==='service-menu'){
                    _styles=['image-horizontal','image-overlay','image-top','image-right','image-center'];
                    key='image';
                    _css['highlight']='tb-highlight-text';
                    _css['price']='tb-menu-price';
                }
                if(isLazy===true){
                    if(cl.contains('module-'+m)){
                        for(let j in _css){
                            if(!Themify.cssLazy['tb_'+m+'_'+j] && item.getElementsByClassName(_css[j])[0]){
                                Themify.cssLazy['tb_'+m+'_'+j]=true;
                                Themify.LoadCss(this.cssUrl + m+'_styles/'+j+'.css');
                            }
                        }
                        for(let j=_styles.length-1;j>-1;--j){
                            if(cl.contains(_styles[j])){
                                let k=_styles[j].replace(key+'-','');
                                if(!Themify.cssLazy['tb_'+m+'_'+k]){
                                    Themify.cssLazy['tb_'+m+'_'+k]=true;
                                    Themify.LoadCss(this.cssUrl + m+'_styles/'+k+'.css');
                                }
                                return;
                            }
                        }
                    }
                }
                else{
                    for(let j in _css){
                        if(!Themify.cssLazy['tb_'+m+'_'+j] && item.getElementsByClassName(_css[j])[0]){
                            Themify.cssLazy['tb_'+m+'_'+j]=true;
                            Themify.LoadCss(this.cssUrl + m+'_styles/'+j+'.css');
                        }
                    }
                    for(let j=_styles.length-1;j>-1;--j){
                        let k=_styles[j].replace(key+'-','');
                        if(!Themify.cssLazy['tb_'+m+'_'+k] && document.querySelector('.module-'+m+'.'+_styles[j])!==null){
                            Themify.cssLazy['tb_'+m+'_'+k]=true;
                            Themify.LoadCss(this.cssUrl + m+'_styles/'+k+'.css');
                        }
                    }
                }
            }
        }
    };
    if(window.loaded===true){
        ThemifyBuilderModuleJs.init();
    }
    else{
        window.addEventListener('load', function(){
            ThemifyBuilderModuleJs.init();
        }, {once:true, passive:true});
    }

}(jQuery, window,Themify, document,tbLocalScript));
