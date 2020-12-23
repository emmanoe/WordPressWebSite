/*! Themify Builder - Asynchronous Script and Styles Loader */
(function (Themify, window, document) {
    'use strict';
    let $;
    const wpEditor = function () {
        const remove_tinemce = function () {
            if (window['tinymce'] && tinyMCE) {
                const content_css = tinyMCEPreInit.mceInit['tb_lb_hidden_editor']['content_css'].split(',');
                tinyMCEPreInit.mceInit['tb_lb_hidden_editor']['wp_autoresize_on'] = false;
                tinyMCEPreInit.mceInit['tb_lb_hidden_editor']['content_css'] = content_css[1] ? content_css[1] : content_css[0];
                tinyMCEPreInit.mceInit['tb_lb_hidden_editor']['plugins'] = 'charmap,colorpicker,hr,lists,media,paste,tabfocus,textcolor,fullscreen,wordpress,wpautoresize,wpeditimage,wpemoji,wpgallery,wpdialogs,wptextpattern,wpview,wplink';
                tinyMCEPreInit.mceInit['tb_lb_hidden_editor']['indent'] = 'simple';
                tinyMCEPreInit.mceInit['tb_lb_hidden_editor']['ie7_compat'] = false;
                tinyMCEPreInit.mceInit['tb_lb_hidden_editor']['root_name'] = 'div';
                tinyMCEPreInit.mceInit['tb_lb_hidden_editor']['relative_urls'] = true;
                tinyMCE.execCommand('mceRemoveEditor', true, 'tb_lb_hidden_editor');
                $('#wp-tb_lb_hidden_editor-editor-container,#wp-tb_lb_hidden_editor-editor-tools').remove();
            }
        };
        $.ajax({
            url: themify_vars.ajax_url,
            type: 'POST',
            data: {'action': 'tb_load_editor'},
            success: function (res) {
                const doc = document.createElement('div'),
                        loaded = {},
                        needToLoad = {},
                        fr = document.createDocumentFragment(),
                        scriptsFr = document.createDocumentFragment(),
                        body = Themify.body[0],
                        jsLoadCallback = function () {
                            loaded[this.src] = true;
                            if ($.ui && $.fn.mouse && $.fn.sortable) {
                                Themify.trigger('tb_load_iframe');
                            }
                            for (let i in needToLoad) {
                                if (loaded[i] !== true) {
                                    return false;
                                }
                            }
                            const fr = document.createDocumentFragment();
                            for (let i = 0, len = final.length; i < len; ++i) {
                                fr.appendChild(final[i]);
                            }
                            body.appendChild(fr);
                            remove_tinemce();
                        };
                doc.innerHTML = res;
                const items = doc.querySelector('#tb_tinymce_wrap').children,
                        final = [];
                for (let i = 0, len = items.length; i < len; ++i) {

                    if (items[0].tagName !== 'SCRIPT' || (items[0].getAttribute('type') && items[0].getAttribute('type') !== 'text/javascript')) {
                        fr.appendChild(items[0]);
                    } else {
                        let s = document.createElement('script');
                        for (let attr = items[0].attributes, j = attr.length - 1; j > -1; --j) {
                            s.setAttribute(attr[j].name, attr[j].value);
                        }
                        let src = items[0].getAttribute('src');
                        if (!src) {
                            let html = items[0].innerHTML;
                            s.innerHTML = html;
                            if (html.indexOf('tinyMCEPreInit.') === -1 && html.indexOf('.addI18n') === -1  && html.indexOf('.i18n') === -1 && html.indexOf('wp.editor') === -1) {
                                fr.appendChild(s);
                            } else {
                                final.push(s);
                            }
                        } else if (needToLoad[src] === undefined && document.querySelector('script[src="' + src + '"]') === null) {
                            s.async = false;
                            needToLoad[src] = true;
                            s.addEventListener('load', jsLoadCallback, {once: true, passive: true});
                            s.addEventListener('error', jsLoadCallback, {once: true, passive: true});
                            fr.appendChild(s);
                        }
                        items[0].remove();
                    }
                }
                try {
                    body.appendChild(fr);
                } 
                catch (e) {
                }
            }
        });
    },
    windowLoad = function () {
        let pageId;
        $ = jQuery;
        if (!window['wp'] || !wp.customize) {
            let builder = document.getElementsByClassName('themify_builder_content'),
                    toogle = document.getElementsByClassName('toggle_tb_builder')[0],
                    found = false;
            pageId = toogle ? toogle.getElementsByClassName('tb_front_icon')[0].getAttribute('data-id') : false;
            for (let i = builder.length - 1; i > -1; --i) {
                let bid = builder[i].getAttribute('data-postid'),
                        a = document.createElement('a'),
                        span = document.createElement('span');
                if (bid === pageId) {
                    found = true;
                }
                a.href = 'javascript:void(0);';
                a.className = 'tb_turn_on js-turn-on-builder';
                span.className = 'dashicons dashicons-edit';
                span.setAttribute('data-id', bid);
                a.appendChild(span);
                const cl=builder[i].parentNode.classList;
                a.appendChild(document.createTextNode(cl.contains('tbp_template') ? tbLoaderVars.editTemplate : (cl.contains('tb_layout_part_wrap')?tbLoaderVars.turnOnLpBuilder:tbLoaderVars.turnOnBuilder)));
                builder[i].insertAdjacentElement('afterEnd', a);
            }
            if (!toogle) {
                toogle = document.getElementsByClassName('js-turn-on-builder')[0];
                if (!toogle) {
                    pageId = toogle.getElementsByClassName('dashicons-edit')[0].getAttribute('data-id');
                }
            }
            if (found === false) {
                pageId = null;
                toogle.classList.add('tb_disabled_turn_on');
            } else {
                toogle.classList.remove('tb_disabled_turn_on');
            }
        }
        let responsiveSrc = window.location.href.indexOf('?') > 0 ? '&' : '?';
        responsiveSrc = window.location.href.replace(window.location.hash, '').replace('#', '') + responsiveSrc + 'tb-preview=1&ver=' + window['themify_vars'].version;
        Themify.body.on('click.tb_loading', '.toggle_tb_builder > a, a.js-turn-on-builder', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const is_locked = this.classList.contains('tb_restriction');
            Themify.LoadAsync(tbLocalScript.builder_url + '/js/editor/themify-ticks.js', function () {
                if (is_locked) {
                    TB_Ticks.init(tbLocalScript.ticks).show();
                    init();
                }
            }, null, null, function () {
                return !!window['TB_Ticks'];
            });
            Themify.body.off('click.tb_loading');
            if (is_locked) {
                return;
            }
            const post_id = !this.classList.contains('js-turn-on-builder') ? pageId : this.childNodes[0].getAttribute('data-id');
            if (!post_id || this.parentNode.classList.contains('tb_disabled_turn_on')) {
                return;
            }
            Themify.lazyDisable=Themify.lazyScrolling = true;
            if (Themify.observer !== null) {
                Themify.observer.disconnect();
            }


            //remove unused the css/js to make faster switch mode/window resize
            let builderLoader,
                    css_items = [],
                    scrollPos = $(document).scrollTop(),
                    css = Themify.convert(document.head.getElementsByTagName('link')).concat(Themify.convert(document.head.getElementsByTagName('style')));
            const   $children = Themify.body.children(),
                    workspace = document.createElement('div'),
                    bar = document.createElement('div'),
                    leftBar = document.createElement('div'),
                    rightBar = document.createElement('div'),
                    verticalTooltip = document.createElement('div'),
                    iframe = document.createElement('iframe');
            workspace.className = 'tb_workspace_container';
            bar.className = 'tb_vertical_bars';
            leftBar.id = 'tb_left_bar';
            rightBar.id = 'tb_right_bar';
            leftBar.className = rightBar.className = 'tb_middle_bar';
            verticalTooltip.className = 'tb_vertical_change_tooltip';
            iframe.className = 'tb_iframe';
            iframe.id = iframe.name = 'tb_iframe';
            iframe.scrolling = Themify.isTouch ? 'no' : 'yes';
            iframe.src = responsiveSrc + '&tb-id=' + post_id;

            Themify.off('builder_load_module_partial');
            $(document).off('ajaxComplete');

            if (tbLoaderVars.styles !== null) {
                for (let i  in tbLoaderVars.styles) {
                    if (tbLoaderVars.styles[i] !== '') {
                        Themify.LoadCss(i, tbLoaderVars.styles[i]);
                        css_items[i + '?ver=' + tbLoaderVars.styles[i]] = 1;
                    }
                }
            }
            builderLoader = document.createElement('div');
            const fixed = document.createElement('div'),
                    progress = document.createElement('div'),
                    icon = document.getElementsByClassName('tb_front_icon')[0];
            builderLoader.id = 'tb_alert';
            builderLoader.className = 'tb_busy';

            fixed.id = 'tb_fixed_bottom_scroll';
            fixed.className = 'tb_fixed_scroll';
            progress.id = 'builder_progress';

            progress.appendChild(document.createElement('div'));
            document.body.insertAdjacentElement('afterbegin', fixed);
            document.body.appendChild(builderLoader);
            // Change text to indicate it's loading
            if (icon) {
                icon.parentNode.appendChild(progress);
            }
            Themify.on('tb_load_iframe', function () {

                bar.appendChild(leftBar);
                bar.appendChild(iframe);
                bar.appendChild(rightBar);
                bar.appendChild(verticalTooltip);
                workspace.appendChild(bar);

                iframe.addEventListener('load', function () {
                    const _this = this,
                            contentWindow = _this.contentWindow;
                    let b;
                    Themify.body.one('themify_builder_ready', function (e) {
                        $(builderLoader).fadeOut(100, function () {
                            this.classList.remove('tb_busy');
                        });
                        const isArchive = Themify.body[0].classList.contains('archive');
                        let cl = 'themify_builder_active builder-breakpoint-desktop page-loaded';
                        if (Themify.isTouch) {
                            cl += ' tb_touch';
                        }
                        if (isArchive) {
                            // "archive" classname signifies whether current page being edited is a WP archive page
                            cl += ' archive';
                        }
                        if ('1' === tbLoaderVars.isGlobalStylePost) {
                            cl += ' gs_post';
                        }
                        Themify.body[0].className = cl
                        Themify.body[0].removeAttribute('style');
                        workspace.style['display'] = 'block';
                        const activeBuilderPost = contentWindow.tb_app.Instances.Builder[0].$el.offset().top;
                        if (activeBuilderPost > scrollPos) {
                            scrollPos = activeBuilderPost;
                        }
                        contentWindow.scrollTo(0, scrollPos);
                        Themify.iframe = iframe;
                        Themify.is_builder_active = true;
                        setTimeout(function () {
                            $children.hide();
                            for (let i = css.length - 1; i > -1; --i) {
                                if (css[i] && css[i].parentNode) {
                                    let href = css[i].href,
										id=css[i].id;
                                    if (href) {
                                        if (!css_items[href] && href.indexOf('wp-includes') === -1 && href.indexOf('admin-bar') === -1) {
                                            css[i].setAttribute('disabled', true);
                                            css[i].parentNode.removeChild(css[i]);
                                        }
                                    } 
									else if(id!=='tf_fonts_style'&& id!=='tf_lazy_common') {
                                        css[i].parentNode.removeChild(css[i]);
                                    }
                                }
                            }
                            css = css_items = tbLoaderVars = builderLoader = null;
                            $('.themify_builder_content,#wpadminbar,header').remove();
                            $children.filter('ul,a,video,audio').filter(':not(:has(link))').remove();
                            const events = ['scroll', 'tfsmartresize', 'debouncedresize', 'throttledresize', 'resize', 'mouseenter', 'keydown', 'keyup', 'mousedown', 'assignVideo'],
                                    $window = $(window),
                                    $document = $(document);
                            for (let i = events.length - 1; i > -1; --i) {
                                $window.off(events[i]);
                                $document.off(events[i]);
                                Themify.body.off(events[i]);
                            }
                            document.documentElement.removeAttribute('style');
                            document.documentElement.removeAttribute('class');
                            const ticks = contentWindow.tbLocalScript.ticks;
                            ticks['postID']=post_id;
                            if (!b.hasClass('tb_restriction')) {
                                setTimeout(function () {
                                    TB_Ticks.init(ticks, contentWindow).ticks();
                                }, 5000);
                            } else {
                                setTimeout(function () {
                                    document.body.appendChild(b.find('#tmpl-builder-restriction')[0]);
                                    TB_Ticks.init(ticks, contentWindow).show();
                                }, 1000);
                            }
                            setTimeout(function () {
                                const globals = ['ThemifyBuilderModuleJs', 'c', '_wpemojiSettings', 'twemoji', 'themifyScript', 'tbLocalScript', 'tbScrollHighlight', 'google', 'ThemifyGallery', 'Animation', '$f', 'Froogaloop', 'SliderProSlide', 'SliderProUtils', 'ThemifySlider', 'FixedHeader', 'LayoutAndFilter', 'WOW', 'Waypoint', '$slidernav', 'google', 'Microsoft', 'Rellax', 'module$contents$MapsEvent_MapsEvent', 'module$contents$mapsapi$overlay$OverlayView_OverlayView', 'wc_add_to_cart_params', 'woocommerce_params', 'wc_cart_fragments_params', 'wc_single_product_params', 'tf_mobile_menu_trigger_point', 'themifyMobileMenuTrigger'];

                                for (let i = globals.length - 1; i > -1; --i) {
                                    if (window[globals[i]]) {
                                        window[globals[i]] = null;
                                    }
                                }
                                Themify.events = {};
                                window['wp']['emoji'] = null;
								window.ajaxurl = themify_vars.ajax_url; // required for Ajax requests sent by WP
                                Themify.cssLazy = [];
								for(let lazy=contentWindow.document.querySelectorAll('[data-lazy]'),i=lazy.length-1;i>-1;--i){
									lazy[i].removeAttribute('data-lazy');
								}
                            }, 3000);
                        }, 800);
                    });
                    
                    
                    const __callback = function () {
                        contentWindow.themifyBuilder.post_ID = post_id;
                        b = contentWindow.jQuery('body');
                        b.trigger('builderiframeloaded.themify', _this);
                    };
                    // Cloudflare compatibility fix
                    if ('__rocketLoaderLoadProgressSimulator' in contentWindow) {
                        const rocketCheck = setInterval(function () {
                            if (contentWindow.__rocketLoaderLoadProgressSimulator.simulatedReadyState === 'complete') {
                                clearInterval(rocketCheck);
                                __callback();
                            }
                        }, 10);
                    } else {
                        __callback();
                    }
                    
                }, {once: true, passive: true});
                
                document.body.appendChild(workspace);
                
            }, true);
            
            wpEditor();
        });
        if (!Themify.body[0].classList.contains('tb_restriction') && window.location.href.indexOf('tb-id')===-1) {
            if (window.location.hash === '#builder_active') {
                $('.toggle_tb_builder > a').first().click();
                window.location.hash = '';
            } else {
                //cache iframe content in background
                const link = document.createElement('link');
                link.href = responsiveSrc + (pageId ? '&tb-id=' + pageId : '');
                link.rel = 'prefetch';
                link.setAttribute('as', 'document');
                document.head.appendChild(link);
            }
        }

    };
    if (window.loaded === true) {
        windowLoad();
    } else {
        Themify.on('tf_init', windowLoad,true);
    }
})(Themify, window, document);
