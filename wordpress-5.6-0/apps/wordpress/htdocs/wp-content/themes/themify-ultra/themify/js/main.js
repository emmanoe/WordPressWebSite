;
var Themify;
(function (window, document, $) {
    'use strict';
    Themify = {
        cssLazy:{},
        jsLazy:{},
        jsCallbacks:{},
        cssCallbacks:{},
        fontsQueue:{},
        is_min:false,
        events:{},
        body:null,
        is_builder_active:false,
        is_builder_loaded:false,
        w:null,
        h:null,
        isTouch:false,
        device:'desktop',
        isRTL:false,
        lazyDisable:false,
        lazyScrolling:null,
		url:null,
		js_modules:null,
		css_modules:null,
		jsUrl:null,
        observer:null,
        hasDecode:null,
        triggerEvent(target, type, params) {
            let ev;
            try {
                ev = new window.CustomEvent(type, {detail:params});
            } catch (e) {
                ev = window.CustomEvent(type, {detail:params});
            }
            target.dispatchEvent(ev);
        },
        on(ev, func, once) {
            ev = ev.split(' ');
            const len = ev.length;
            for (let i = 0; i < len; ++i) {
                if (!this.events[ev[i]]) {
                    this.events[ev[i]] = [];
                }
                let item = {'f':func};
                if (once === true) {
                    item['o'] = true;
                }
                this.events[ev[i]].push(item);
            }
            return this;
        },
        off(ev, func) {
            if (this.events[ev]) {
                if (!func) {
                    delete this.events[ev];
                } else {
                    const events = this.events[ev];
                    for (let i = events.length - 1; i > -1; --i) {
                        if (events[i]['f'] === func) {
                            this.events[ev].splice(i, 1);
                        }
                    }
                }
            }
            return this;
        },
        trigger(ev, args) {
            if (this.events[ev]) {
                const events = this.events[ev].reverse();
                if (!Array.isArray(args)) {
                    args = [args];
                }
                for (let i = events.length - 1; i > -1; --i) {
                    if (events[i] !== undefined) {
                        events[i]['f'].apply(null, args);
                        if (events[i] !== undefined && events[i]['o'] === true) {
                            this.events[ev].splice(i, 1);
                            if (Object.keys(this.events[ev]).length === 0) {
                                delete this.events[ev];
                                break;
                            }
                        }
                    }
                }
            }
            return this;
        },
        requestIdleCallback:function (callback, timeout) {
            if (window.requestIdleCallback) {
                window.requestIdleCallback(callback, {timeout:timeout});
            } else {
                setTimeout(callback, timeout);
            }
        },
        UpdateQueryString(a, b, c) {
            c || (c = window.location.href);
            const d = RegExp('([?|&])' + a + '=.*?(&|#|$)(.*)', 'gi');
            if (d.test(c))
                return b !== void 0 && null !== b ? c.replace(d, '$1' + a + '=' + b + '$2$3') :c.replace(d, '$1$3').replace(/(&|\?)$/, '');
            if (b !== void 0 && null !== b) {
                const e = -1 !== c.indexOf('?') ? '&' :'?', f = c.split('#');
                return c = f[0] + e + a + '=' + b, f[1] && (c += '#' + f[1]), c;
            }
            return c;
        },
        selectWithParent(selector, el) {
            let items = null;
            const isCl = selector.indexOf('.') === -1 && selector.indexOf('[') === -1,
                    isTag = isCl === true && (selector === 'video' || selector === 'audio' || selector === 'img');
            if (el && el[0] !== undefined) {
                el = el[0];
            }
            if (el) {
                items = isCl === false ? el.querySelectorAll(selector) :(isTag === true ? el.getElementsByTagName(selector) :el.getElementsByClassName(selector));
                if ((isCl === true && el.classList.contains(selector)) || (isCl === false && el.matches(selector)) || (isTag === true && el.tagName.toLowerCase() === selector)) {
                    items = this.convert(items, el);
                }
            } else {
                items = isCl === false ? document.querySelectorAll(selector) :(isTag === true ? document.getElementsByTagName(selector) :document.getElementsByClassName(selector));
            }
            return items;
        },
        convert(items, el) {
            let l = items.length;
            const arr = new Array(l);
            while (l--) {
                arr[l] = items[l];
            }
            if (el) {
                arr.push(el);
            }
            return arr;
        },
        Init() {
            this.is_builder_active = document.body.classList.contains('themify_builder_active');
            this.body = $('body');
            const self = this,
                    windowLoad = function () {
                        self.w = window.innerWidth;
                        self.h = window.innerHeight;
                        self.isRTL = self.body[0].classList.contains('rtl');
                        self.isTouch = !!(('ontouchstart' in window) ||  navigator.msMaxTouchPoints > 0);
                        self.lazyDisable = self.is_builder_active === true || self.body[0].classList.contains('tf_lazy_disable');
                        if(self.isTouch){
                            const ori=typeof window.screen!=='undefined' && typeof window.screen.orientation!=='undefined'?window.screen.orientation.angle:window.orientation,
                                w = ori===90 || ori===-90?self.h:self.w;
                            if(w<769){
                                self.device =w<681?'mobile':'tablet';
                            }
                        }
                        const img = new Image();
                        self.hasDecode = 'decode' in img;
                        if (typeof woocommerce_params !== 'undefined') {
                            self.body[0].classList.remove('woocommerce-no-js');
                            self.body[0].className += ' woocommerce-js';
                        }
                        if (typeof themify_vars === 'undefined') {
                            const vars = document.getElementById('tf_vars'),
                                    script = document.createElement('script');
                            script.type = 'text/javascript';
                            script.textContent = vars.textContent;
                            vars.parentNode.replaceChild(script, vars);
                        }
                        self.is_min = themify_vars.is_min?true:false;
						self.url=themify_vars.url;
						self.jsUrl = self.url+'/js/modules/';
						self.js_modules=themify_vars.js_modules;
						self.css_modules=themify_vars.css_modules;
						if(!window['IntersectionObserver']){
							self.LoadAsync(self.jsUrl+'fallback.js');
						}
                        if (themify_vars['done'] !== undefined) {
                            self.cssLazy = themify_vars['done'];
                            delete themify_vars['done'];
                        }
                        self.mobileMenu();
                        self.trigger('tf_init');
                        window.loaded = true;
                        if (themify_vars && !themify_vars['is_admin']) {
                            if (themify_vars['theme_v']) {
                                if ('serviceWorker' in navigator) {
                                    // temprorary disabling     navigator.serviceWorker.register(self.url+'/sw/sw'+(self.is_min===true?'.min':'')+'.js?ver='+themify_vars.version+'&tv='+themify_vars['theme_v'],{scope:'/'});
                                }
                                self.LoadAsync(themify_vars.theme_js, null, themify_vars.theme_v);
                                delete themify_vars['theme_js'];
                            }
                            if (self.is_builder_active === false) {
                                if (window['tbLocalScript'] && document.getElementsByClassName('module_row')[0]) {
                                    self.LoadAsync(window['tbLocalScript'].builder_url + '/js/themify.builder.script.js', function () {
                                        self.is_builder_loaded = true;
                                        self.body[0].className += ' page-loaded';
                                        self.lazyLoading();
                                    }, null, null, function () {
                                        return typeof ThemifyBuilderModuleJs !== 'undefined';
                                    });
                                } else {
                                    self.body[0].className += ' page-loaded';
                                    self.lazyLoading();
                                }
                                self.loadFonts();
                            } else {
                                self.body[0].className += ' page-loaded';
                            }
                            requestAnimationFrame(function(){ 
								self.initWC();
								setTimeout(function(){self.InitGallery();}, 800);
							});
                        }
                        self.initResizeHelper();
                    };
            if (document.readyState === 'complete' || self.is_builder_active === true) {
                windowLoad();
            } else {
                window.addEventListener('load', windowLoad, {once:true, passive:true});
            }
        },
        FixedHeader(options) {
            if (!this.is_builder_active) {
                if (!this.jsLazy['fixedheader']) {
                    const self = this;
                    this.LoadAsync(this.js_modules.fxh, function () {
                        self.jsLazy['fixedheader'] = true;
                        self.trigger('tf_fixed_header_init', options);
                    }, null, null, function () {
                        return !!self.jsLazy['fixedheader'];
                    });
                } else {
                    this.trigger('tf_fixed_header_init', options);
                }
            }
        },
        initComponents(el, isLazy) {
            if (isLazy === true && el[0].tagName === 'IMG') {
                return;
            }
            let items = null;
            if (isLazy === true) {
                if (el[0].classList.contains('tf_carousel')) {
                    items = el;
                }
            } else {
                items = this.selectWithParent('tf_carousel', el);
            }
            if (items !== null && items.length > 0) {
                this.InitCarousel(items);
            }
            items = null;
            if (isLazy === true) {
                if (el[0].classList.contains('themify_map')) {
                    items = el;
                }
            } else {
                items = this.selectWithParent('themify_map', el);
            }
            if (items !== null && items.length > 0) {
                this.InitMap(items);
            }
            items = null;
            if (isLazy === true) {
                if (el[0].classList.contains('auto_tiles')) {
                    items = el;
                }
            } else {
                items = this.selectWithParent('auto_tiles', el);
            }
            if (items !== null && items.length > 0) {
                this.autoTiles(items);
            }
            items = null;
            if (isLazy === true) {
                if (el[0].hasAttribute('data-lax')) {
                    items = el;
                }
            } else {
                items = this.selectWithParent('[data-lax]', el);
            }
            if (items !== null && items.length > 0) {
                this.lax(items, null);
            }
            items = null;
            if (isLazy === true) {
                if (el[0].classList.contains('wp-video-shortcode')) {
                    items = el;
                }
            } else {
                items = this.selectWithParent('wp-video-shortcode', el);
            }
            if (items !== null && items.length > 0) {
                this.media(items);
            }
            items = null;
            if (isLazy === true) {
                if (el[0].tagName === 'AUDIO') {
                    items = el;
                }
            } else {
                items = this.selectWithParent('audio', el);
            }
            if (items !== null && items.length > 0) {
                this.audio(items);
            }
            items = null;
            if (isLazy === true) {
                if (el[0].classList.contains('masonry')) {
                    items = el;
                }
            } else {
                items = this.selectWithParent('masonry', el);
            }
            if (items !== null && items.length > 0) {
                this.isoTop(items);
            }
        },
        fontAwesome:function (icons) {
            if(icons){
                if(typeof icons==='string'){
                    icons=[icons];
                }
                else if(!Array.isArray(icons)){
                    if(icons instanceof jQuery){
                        icons = icons[0];
                    }
                    icons=this.selectWithParent('tf_fa',icons);
                }
            }
            else{
                icons=document.getElementsByClassName('tf_fa');
            }
            const Loaded = {},
                needToLoad = [],
				parents=[],
                svg = document.getElementById('tf_svg').firstChild,
                loadedIcons = svg.getElementsByTagName('symbol');
            for (let i = loadedIcons.length - 1; i > -1; --i) {
                Loaded[loadedIcons[i].id] = true;
            }
            for (let i = icons.length - 1; i > -1; --i) {
                let id = icons[i].classList?icons[i].classList[1]:icons[i];
                if (id && !Loaded[id]) {
					if(!this.fontsQueue[id]){
						this.fontsQueue[id]=true;
						let tmp=id.replace('tf-', ''),
						tmp2 = tmp.split('-');
						if(tmp2[0]==='fas' || tmp2[0]==='far' || tmp2[0]==='fab'){
								let pre=tmp2[0];
								tmp2.shift();
								tmp = pre+' '+tmp2.join('-');
						}
						needToLoad.push(tmp);
					}
					if(icons[i].classList){
						let p=icons[i].parentNode;
						p.classList.add('tf_lazy');
						parents.push(p);
					}
                }
            }
            if (needToLoad.length > 0) {
                const time = this.is_builder_active ? 5 :2000,
                    self=this;
                setTimeout(function () {
                    const request = new Headers({
                        'Accept':'application/json',
                        'X-Requested-With':'XMLHttpRequest'
                    }),
                    data = new FormData();
                    data.append('action', 'tf_load_icons');
                    data.append('icons', JSON.stringify(needToLoad));

                    fetch(themify_vars.ajax_url, {method:'POST', headers:request, body:data})
                            .then(res => res.json())
                            .then(data => {
                                const fr = document.createDocumentFragment(),
                                    ns = 'http://www.w3.org/2000/svg';
                                let st = [];
                                for (let i in data) {
                                    let s = document.createElementNS(ns, 'symbol'),
                                            p = document.createElementNS(ns, 'path'),
                                            k = 'tf-' + i.replace(' ','-'),
                                            viewBox = '0 0 ';
                                    viewBox += data[i].vw ? data[i].vw :'32';
                                    viewBox += ' 32';
                                    s.id = k;
                                    s.setAttributeNS(null, 'viewBox', viewBox);
                                    p.setAttributeNS(null, 'd', data[i]['p']);
                                    s.appendChild(p);
                                    fr.appendChild(s);
                                    if (data[i].w) {
                                        st.push('.tf_fa.' + k + '{width:' + data[i].w + 'em}');
                                    }
                                }
                                svg.appendChild(fr);
                                if (st.length > 0) {
                                    let css = document.getElementById('tf_fonts_style');
                                    if (css === null) {
                                        css = document.createElement('style');
                                        css.id = 'tf_fonts_style';
                                        css.cssText = '';
                                    }
                                    css.cssText += st.join('');
                                }
                                self.fontsQueue={};
								for(let i=parents.length-1;i>-1;--i){
									if(parents[i]){
										parents[i].classList.remove('tf_lazy');
									}
								}
								
                            });
                }, time);
            }
            return;
        },
        loadFonts() {
            const self = this;
            if (!self.cssLazy['framework-css'] && (self.is_builder_active === true || document.getElementsByClassName('shortcode')[0])) {
                const el = document.getElementById('themify-framework-css');
                if (el !== null) {
                    self.LoadCss(el.getAttribute('data-href'), false, el, null, function () {
                        self.cssLazy['framework-css'] = true;
                    });
                } else {
                    self.cssLazy['framework-css'] = false;
                }
            } else {
                self.cssLazy['framework-css'] = false;
            }
            this.requestIdleCallback(function () {
                self.fontAwesome();
            }, 200);
            if (themify_vars['commentUrl']) {
                this.requestIdleCallback(function () {
                    self.loadComments();
                }, 3000);
            }
            if (themify_vars.wp_emoji) {
                this.requestIdleCallback(function () {
                    self.loadEmoji();
                }, 3000);
            }
        },
        loadComments(callback) {
            if (!window['addComment'] && themify_vars['commentUrl']) {
				let comments = document.getElementById('cancel-comment-reply-link');
				if(comments){
					comments=comments.closest('#comments');
					if(comments){
						const self=this,
							load=function(){
								this.removeEventListener('focusin',load,{once:true,passive:true});
								this.removeEventListener((self.isTouch?'touchstart':'mouseenter'),load,{once:true,passive:true});
								self.LoadAsync(themify_vars.commentUrl, callback, themify_vars.wp, null, function () {
									return !!window['addComment'];
								});
								themify_vars['commentUrl'] = null;
							};
						comments.addEventListener('focusin',load,{once:true,passive:true});
						comments.addEventListener((this.isTouch?'touchstart':'mouseenter'),load,{once:true,passive:true});
					}
				}
            }
        },
        loadEmoji() {
            if (themify_vars.wp_emoji) {
                this.loadExtra(themify_vars.wp_emoji, null, false, function () {
                    window._wpemojiSettings['DOMReady'] = true;
                });
                themify_vars.wp_emoji = null;
            }
        },
        InitCarousel(items, options) {
            if (items) {
                if (!this.jsLazy['tf_carousel']) {
                    const self = this;
                    this.LoadAsync(this.js_modules.tc, function () {
                        self.jsLazy['tf_carousel'] = true;
                        self.trigger('tf_carousel_init', [items, options]);
                    }, null, null, function () {
                        return !!self.jsLazy['tf_carousel'];
                    });
                } else {
                    this.trigger('tf_carousel_init', [items, options]);
                }
            }
        },
        InitMap(items) {
            if (items.length > 0) {
                if (!this.jsLazy['tf_map']) {
                    const self = this;
                    this.LoadAsync(this.js_modules.map, function () {
                        self.jsLazy['tf_map'] = true;
                        self.trigger('themify_map_init', [items]);
                    }, null, null, function () {
                        return !!window['ThemifyGoogleMap'];
                    });
                } else {
                    this.trigger('themify_map_init', [items]);
                }
            }
        },
        LoadAsync(src, callback, version, extra, test,async) {
            const id = this.hash(src); // Make script path as ID
            let exist = this.jsLazy[id] ? true :false;
            if (exist === false) {
                this.jsLazy[id] = true;
            }
            if (exist === true || document.getElementById(id) !== null) {
                if (callback) {
                    if (test) {
                        if (test() === true) {
                            callback();
                            return;
                        }
                        if (!this.jsCallbacks[id]) {
                            this.jsCallbacks[id] = [];
                        }
                        this.jsCallbacks[id].push(callback);
                    } else {
                        callback();
                    }
                }
                return;
            } else if (test && test() === true) {
                if (extra) {
                    this.loadExtra(extra);
                }
                if (callback) {
                    callback();
                }
                return;
            }
            if (this.is_min === true && src.indexOf('.min.js') === -1 && src.indexOf(window.location.hostname) !== -1) {
                src = src.replace('.js', '.min.js');
            }
            if (!version && version !== false) {
                version = themify_vars.version;
            }
            const s = document.createElement('script'),
                    self = this;
            s.setAttribute('id', id);
            if(async!==false){
                async='async';
            }
            s.setAttribute('async', async);
            if (version) {
                src += '?ver=' + version;
            }
            s.onload = function () {
                if (callback) {
                    callback();
                }
                const key = this.getAttribute('id');
                if (self.jsCallbacks[key]) {
                    for (let i = 0, len = self.jsCallbacks[key].length; i < len; ++i) {
                        self.jsCallbacks[key][i]();
                    }
                    delete self.jsCallbacks[key];
                }
            };
            document.head.appendChild(s);
            s.setAttribute('src', src);
            if (extra) {
                this.loadExtra(extra, s);
            }
        },
        loadExtra(data, handler, inHead, callback) {
            if (data) {
                if (typeof handler === 'string') {
                    handler = document.querySelector('script#' + handler);
                    if (handler === null) {
                        return;
                    }
                }
                let str = '';
                if (handler) {
                    if (data['before']) {
                        if (typeof data['before'] !== 'string') {
                            for (let i in data['before']) {
                                if (data['before'][i]) {
                                    str += data['before'][i];
                                }
                            }
                        } else {
                            str = data['before'];
                        }
                        if (str !== '') {
                            const before = document.createElement('script');
                            before.type = 'text/javascript';
                            before.text = str;
                            handler.parentNode.insertBefore(before, handler);
                        }
                    }
                }
                if (typeof data !== 'string') {
                    str = '';
                    for (let i in data) {
                        if (i !== 'before' && data[i]) {
                            str += data[i];
                        }
                    }
                } else {
                    str = data;
                }
                if (str !== '') {
                    const extra = document.createElement('script');
                    extra.type = 'text/javascript';
                    extra.text = str;
                    if (inHead === undefined || inHead === true) {
                        document.head.appendChild(extra);
                    } else {
                        document.body.appendChild(extra);
                    }
                    if (callback) {
                        callback();
                    }
                }
            }
        },
        LoadCss(href, version, before, media, callback) {
            if (!version && version !== false) {
                version = themify_vars.version;
            }
            const id = this.hash(href);
            let  fullHref = version ? href + '?ver=' + version :href;
            if (this.is_min === true && href.indexOf('.min.css') === -1 && href.indexOf(window.location.hostname) !== -1) {
                fullHref = fullHref.replace('.css', '.min.css');
            }
            if (this.cssLazy[id] !== true) {
                this.cssLazy[id] = true;
            } else {
                if (callback) {
                    const el = document.getElementById(id);
                    if (el !== null && el.getAttribute('media') !== 'only_x') {
                        callback();
                    } else {
                        if (!this.cssCallbacks[id]) {
                            this.cssCallbacks[id] = [];
                        }
                        this.cssCallbacks[id].push(callback);
                    }
                }
                return false;
            }

            if (!media) {
                media = 'all';
            }
            const ss = document.createElement('link'),
                    self = this,
                    onload = function () {
                        this.setAttribute('media', media);
                        const key = this.getAttribute('id'),
                                checkApply = function () {
                                    const sheets = document.styleSheets;
                                    let found = false;
                                    for (let i = sheets.length - 1; i > -1; --i) {
                                        if (sheets[i].ownerNode.id === key) {
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (found === true) {
                                        if (callback) {
                                            callback();
                                        }
                                        if (self.cssCallbacks[key]) {
                                            for (let i = 0, len = self.cssCallbacks[key].length; i < len; ++i) {
                                                self.cssCallbacks[key][i]();
                                            }
                                            delete self.cssCallbacks[key];
                                        }
                                    } else {
                                        setTimeout(checkApply, 80);
                                    }
                                };
                        if (callback || self.cssCallbacks[key] !== undefined) {
                            checkApply();
                        }
                    };
            if (fullHref.indexOf('http') === -1) {
                // convert protocol-relative url to absolute url
                const placeholder = document.createElement('a');
                placeholder.href = fullHref;
                fullHref = placeholder.href;
            }
            ss.setAttribute('href', fullHref);
            ss.setAttribute('rel', 'stylesheet');
            ss.setAttribute('importance', 'low');
            ss.setAttribute('media', 'only_x');
            ss.setAttribute('id', id);
            if ('isApplicationInstalled' in navigator) {
                ss.onloadcssdefined(onload);
            } else {
                ss.addEventListener('load', onload, {passive:true, once:true});
            }
			let ref=before;
			if(!ref){
				const critical_st = document.getElementById( 'tf_lazy_common' );
				ref=critical_st?critical_st.nextSibling:document.head.firstElementChild;
			}
            ref.parentNode.insertBefore(ss, (before ? ref :ref.nextSibling));
        },
        InitGallery() {
            const lbox = this.is_builder_active === false && themify_vars['lightbox'] ? themify_vars.lightbox :false;
            if (lbox !== false && lbox['lightboxOn'] !== false && !this.jsLazy['tf_gallery_init']) {
				this.jsLazy['tf_gallery_init']=true;
                const self = this,
				hash = window.location.hash.replace('#',''),
			p=self.body.parent(),
                        args = {
                            'extraLightboxArgs':themify_vars['extraLightboxArgs'],
                            'lightboxSelector':lbox['lightboxSelector'] ? lbox['lightboxSelector'] :'.themify_lightbox',
                            'gallerySelector':lbox['gallerySelector']?lbox['gallerySelector']:'.gallery-item a',
                            'contentImagesAreas':lbox['contentImagesAreas']
                        };
                if(lbox['disable_sharing']){
                    args['disableSharing']=lbox['disable_sharing'];
                }
                let isWorking = false;
                const isImg = function (url) {
                    return url.match(/\.(gif|jpg|jpeg|tiff|png|webp|apng)(\?fit=\d+(,|%2C)\d+)?(\&ssl=\d+)?$/i);
                },
                _click = function (e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    if (isWorking === true) {
                        return;
                    }
                    isWorking = true;
                    const _this = $(e.currentTarget),
                            link = _this[0].getAttribute('href'),
                            loaderP = document.createElement('div'),
                            loaderC = document.createElement('div'),
                            checkLoad = function () {
                                if (self.cssLazy['tf_lightbox'] === true && self.jsLazy['tf_lightbox'] === true && self.jsLazy['tf_gallery'] === true) {
                                    p.off('click.tf_gallery');
                                    self.trigger('tf_gallery_init', args);
                                    _this.click();
                                    loaderP.remove();
                                }
                            };
                    loaderP.className = 'tf_lazy_lightbox tf_w tf_h';
                    if (link && isImg(link)) {
                        loaderP.textContent = 'Loading...';
                        const img = new Image();
                        img.decoding = 'async';
                        img.src = link;
                    } else {
                        loaderC.className = 'tf_lazy tf_w tf_h';
                        loaderP.appendChild(loaderC);
                    }
                    self.body[0].appendChild(loaderP);
                    if (!self.cssLazy['tf_lightbox']) {
                        self.LoadCss(self.css_modules.lb, null, null, null, function () {
                            self.cssLazy['tf_lightbox'] = true;
                            checkLoad();
                        });
                    }
                    if (!self.jsLazy['tf_lightbox']) {
                        self.LoadAsync(self.js_modules.lb, function () {
                            self.jsLazy['tf_lightbox'] = true;
                            checkLoad();
                        }, '1.1.0', null, function () {
                            return 'undefined' !== typeof $.fn.magnificPopup;
                        });
                    }
                    if (!self.jsLazy['tf_gallery']) {
                        self.LoadAsync(self.js_modules.gal, function () {
                            self.jsLazy['tf_gallery'] = true;
                            checkLoad();
                        }, null, null, function () {
                            return !!self.jsLazy['tf_gallery'];
                        });
                    }
                    checkLoad();
                };
                p.on('click.tf_gallery', args['lightboxSelector'], _click);
				if ( args['gallerySelector'] ) {
					p.on('click.tf_gallery', args['gallerySelector'], function( e ) {
						if ( isImg( this.getAttribute( 'href' ) ) ) {
							_click( e );
						}
					} );
				}
                if (lbox['contentImagesAreas']) {
                    p.on('click.tf_gallery', '.post-content a', function (e) {
                        if (isImg(this.getAttribute('href')) && $(this).closest(args.contentImagesAreas)) {
                            _click(e);
                        }
                    });
                }
				if(hash && hash!=='#'){
					let item = document.querySelector('img[alt="'+decodeURI(hash)+'"]');
					if(item){
						item = item.closest('.themify_lightbox');
						if(item){
							item.click();
						}
					}
				}
            }
        },
        parseVideo(url) {
            const m = url.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/i);
            return{
                type:m !== null ? (m[3].indexOf('youtu') > -1 ? 'youtube' :(m[3].indexOf('vimeo') > -1 ? 'vimeo' :false)) :false,
                id:m !== null ? m[6] :false
            };
        },
        hash(s) {
            let hash = 0;
            for (let i = s.length - 1; i > -1; --i) {
                hash = ((hash << 5) - hash) + s.charCodeAt(i);
                hash = hash & hash; // Convert to 32bit integer
            }
            return hash;
        },
        scrollTo(val, speed, complete,progress) {
            if (!speed) {
                speed = 800;
            }
            if (!val) {
                val = 0;
            }
            const doc = $('html,body'),
                    hasScroll = doc.css('scroll-behavior') === 'smooth';
            if (hasScroll) {
                doc.css('scroll-behavior','auto')
            }
            doc.stop().animate({
                scrollTop:val
            }, {
				progress:progress,
                duration:speed,
                done:function () {
                    if (hasScroll) {
                        doc.css('scroll-behavior','');
                    }
                    if (complete) {
                        complete();
                    }
                }
            });
        },
        imagesLoad(items, callback) {
            const init = function (items, callback) {
                if (!callback && typeof items === 'function') {
                    items();
                } else if (items !== null) {
                    if (items instanceof jQuery) {
                        items.imagesLoaded().always(callback);
                    } else {
                        imagesLoaded(items, callback);
                    }
                } else if (typeof callback === 'function') {
                    callback();
                }
            };
            if (!window['imagesLoaded']) {
                this.LoadAsync(this.js_modules.img, init.bind(null, items, callback), themify_vars['i_v'], null, function () {
                    return !!window['imagesLoaded'];
                });
            } else {
                init(items, callback);
            }
        },
        autoTiles(items, callback) {
            if (!items || items.length === 0) {
                return;
            }
            if (!this.jsLazy['tf_autotiles']) {
                const self = this;
                this.LoadAsync(this.js_modules.at, function () {
                    self.jsLazy['tf_autotiles'] = true;
                    self.trigger('tf_autotiles_init', [items, callback]);
                }, null, null, function () {
                    return !!self.jsLazy['tf_autotiles'];
                });
            } else {
                this.trigger('tf_autotiles_init', [items, callback]);
            }
        },
        isoTop(items, options) {
            if(typeof items==='string'){
                return;
            }
            if (items instanceof jQuery) {
                items=items.get();
            }
            else if(items.length===undefined){
                    items=[items];
            }
            const res=[];
            for(let i=items.length-1;i>-1;--i){
                let cl=items[i].classList;
                if(!cl.contains('masonry-done') &&  (!cl.contains('auto_tiles')|| !cl.contains('list-post') || !items[i].previousElementSibling || items[i].previousElementSibling.classList.contains('post-filter'))){
                    res.push(items[i]);
                }
            }
            if(res.length>0){
                if (!this.jsLazy['tf_isotop']) {
                    const self = this;
                    if (!window['imagesLoaded']) {
                        self.imagesLoad(null);
                    }
                    this.LoadAsync(this.js_modules.iso, function () {
                        self.jsLazy['tf_isotop'] = true;
                        self.trigger('tf_isotop_init', [res, options]);
                    }, null, null, function () {
                        return !!self.jsLazy['tf_isotop'];
                    });
                } else {
                    this.trigger('tf_isotop_init', [res, options]);
                }
            }
        },
        reLayoutIsoTop() {
            this.trigger('tf_isotop_layout');
        },
        infinity(container, options) {
            if (!container || container.length === 0 || this.is_builder_active === true || (!options['button'] && options.hasOwnProperty('button')) || (options['path'] && typeof options['path'] === 'string' && document.querySelector(options['path']) === null)) {
                return;
            }
            // there are no elements to apply the Infinite effect on
            if (options['append'] && !$(options['append']).length) {
                // show the Load More button, just in case.
                if (options['button']) {
                    options['button'].style.display = 'block';
                }
                return;
            }
            if (!this.jsLazy['tf_infinite']) {
                const self = this;
                this.LoadAsync(this.js_modules.inf, function () {
                    self.jsLazy['tf_infinite'] = true;
                    self.trigger('tf_infinite_init', [container, options]);
                }, null, null, function () {
                    return !!self.jsLazy['tf_infinite'];
                });
            } else {
                this.trigger('tf_infinite_init', [container, options]);
            }
        },
        lax(items, is_live) {
            if ((is_live !== true && this.is_builder_active) || items.length === 0) {
                return;
            }
            if (!this.jsLazy['tf_lax']) {
                const self = this;
                this.LoadAsync(this.js_modules.lax, function () {
                    self.jsLazy['tf_lax'] = true;
                    self.trigger('tf_lax_init', [items]);
                }, null, null, function () {
                    return !!self.jsLazy['tf_lax'];
                });
            } else {
                this.trigger('tf_lax_init', [items]);
            }
        },
        mediaCssLoad(callback) {
            if (themify_vars['media'] && themify_vars['media']['css']) {
                const len = Object.keys(themify_vars['media']['css']).length,
                        self = this;
                let j = 0;
                if (callback) {
                    self.on('tf_media_css_loaded', callback, true);
                }
                for (let i in themify_vars['media']['css']) {
                    if (!this.cssLazy['tf_media_' + i] && document.querySelector('link#' + i + '-css') === null) {
                        this.cssLazy['tf_media_' + i] = true;
                        this.LoadCss(themify_vars['media']['css'][i], false, null, null, function () {
                            ++j;
                            if (j === len) {
                                self.trigger('tf_media_css_loaded');
                                delete themify_vars['media']['css'];
                            }
                        });
                    }
                }

            } else if (callback) {
                callback();
            }
        },
        media(items, callback) {
            if (!items || items.length === 0 || !themify_vars['media']) {
                return false;
            }
            if (items instanceof jQuery) {
                items = items.get();
            } else if (items.length === undefined) {
                items = [items];
            }
            this.mediaCssLoad();
            const self = this,
                    init = function () {
                        let settings = window['_wpmejsSettings'];
                        if (!settings) {
                            if (themify_vars['media']['_wpmejsSettings']) {
                                self.loadExtra(themify_vars['media']['_wpmejsSettings']);
                                settings = window['_wpmejsSettings'];
                            } else {
                                settings = {};
                            }
                        }
						for (let i = items.length - 1; i > -1; --i) {
							if (items[i].tagName !== 'DIV') {
								new window['MediaElementPlayer'](items[i], settings);
							}
						}
                        if (callback) {
                            callback();
                        }
                    };
            if (!window.wp || !window.wp.mediaelement) {
                let currentIndex = 0;
                const jsKeys = Object.keys(themify_vars['media']['js']),
                        len = jsKeys.length,
                        recurSiveLoad = function (index, force) {
                            const key = jsKeys[index];
                            if (key !== 'wp-mediaelement' || force === true) {
                                self.LoadAsync(themify_vars['media']['js'][key]['src'], function () {
                                    ++currentIndex;
                                    if (currentIndex < len) {
                                        recurSiveLoad(currentIndex);
                                    } else {
                                        setTimeout(init, 100);
                                    }
                                },
                                        (themify_vars['media']['js'][key]['v'] ? themify_vars['media']['js'][key]['v'] :themify_vars.wp),
                                        themify_vars['media']['js'][key]['extra'],
                                        (key === 'mediaelement-core' ? (function () {
                                            return !!window['MediaElementPlayer'];
                                        }) :null)
                                        );
                            } else {
                                self.mediaCssLoad(function () {
                                    recurSiveLoad(currentIndex, true);
                                });
                            }
                        };
                recurSiveLoad(currentIndex);
            } else {
                init();
            }
        },
		video(items, options) {
            if (!items || items.length === 0) {
                return false;
            }
            if (!this.jsLazy['tf_video']) {
                const self = this,
                        check = function () {
                            if (self.cssLazy['tf_video'] === true && self.jsLazy['tf_video'] === true) {
                                self.trigger('tf_video_init', [items, options]);
                            }
                        };
                this.LoadCss(self.css_modules.video, null, null, null, function () {
                    self.cssLazy['tf_video'] = true;
                    check();
                });
                this.LoadAsync(this.js_modules.video, function () {
                    self.jsLazy['tf_video'] = true;
                    check();
                }, null, null, function () {
                    return !!self.jsLazy['tf_video'];
                });
            } else {
                this.trigger('tf_video_init', [items, options]);
            }
        },
        audio(items, options) {
            if (!items || items.length === 0) {
                return false;
            }
            if (!this.jsLazy['tf_audio']) {
                const self = this,
                        check = function () {
                            if (self.cssLazy['tf_audio'] === true && self.jsLazy['tf_audio'] === true) {
                                self.trigger('tf_audio_init', [items, options]);
                            }
                        };
                this.LoadCss(self.css_modules.audio, null, null, null, function () {
                    self.cssLazy['tf_audio'] = true;
                    check();
                });
                this.LoadAsync(this.js_modules.audio, function () {
                    self.jsLazy['tf_audio'] = true;
                    check();
                }, null, null, function () {
                    return !!self.jsLazy['tf_audio'];
                });
            } else {
                this.trigger('tf_audio_init', [items, options]);
            }
        },
		lazyLoading(parent) {
			if (this.lazyDisable === true) {
                return;
			}
			if(!parent){
				parent=document;
			}
            const items = (parent instanceof HTMLDocument || parent instanceof HTMLElement)?parent.querySelectorAll('[data-lazy]'):parent,
				len = items.length;
            if (len > 0) {
                const self = this,
                        lazy = function (entries, _self, init) {
					for (let i = entries.length - 1; i > -1; --i) {
						if (self.lazyScrolling === null && entries[i].isIntersecting === true) {
							_self.unobserve(entries[i].target);
							self.requestIdleCallback(function () {
								self.lazyScroll([entries[i].target], init);
							}, 70);
						}
					}
				};
				let observerInit;
				if (self.observer === null) {
					observerInit = new window['IntersectionObserver'](function (entries, _self) {
						lazy(entries, _self, true);
						_self.disconnect();
						let intersect2=false;
						const ev=self.isTouch?'touchstart':'mousemove',
							oneScroll = function () {
								if(intersect2){
									intersect2.disconnect();
								}
								intersect2=null;
								window.removeEventListener(ev, oneScroll, {once:true, passive:true});
								window.removeEventListener('scroll', oneScroll, {once:true, passive:true});
								self.observer  = new window['IntersectionObserver'](function (entries, _self) {
									lazy(entries, _self);
								}, {
									rootMargin:'300px 0px 300px 0px'
								});
								for (let i = 0; i < len; ++i) {
									if (items[i].hasAttribute('data-lazy') && !items[i].hasAttribute('data-tf-not-load')) {
										self.observer.observe(items[i]);
									}
								}
								setTimeout(function () {//pre cache after one scroll/mousemove
									const prefetched = [];
									let j=0;
									for (let i = 0; i < len; ++i) {
										if (items[i].hasAttribute('data-tf-src') && items[i].hasAttribute('data-lazy')) {
											if(j<10){
												let src = items[i].getAttribute('data-tf-src');
												if(src && !prefetched[src]){
													prefetched[src] = true;
													let img = new Image();
													img.decoding = 'async';
													img.src = src;
													++j;
												}
											}
											else{
												break;
											}
										}
									}
									if (document.getElementsByClassName('wow')[0]) {
										self.loadWowJs();
									}
								}, 1500);
							};
						window.addEventListener('beforeprint', function(){
							self.lazyScroll(document.querySelectorAll('[data-lazy]'),true);
						}, {passive:true});
						
						window.addEventListener('scroll',oneScroll, {once:true, passive:true});
						window.addEventListener(ev, oneScroll, {once:true, passive:true});
						setTimeout(function () {
							if(intersect2===false){
								intersect2 = new window['IntersectionObserver'](function (entries, _self) {
									if(intersect2!==null){
										lazy(entries, _self, true);
									}
									_self.disconnect();
								}, {
									threshold:.1
								});
								const len2=len>15?15:len;
								for (let i = 0; i < len2; ++i) {
									if (items[i] && items[i].hasAttribute('data-lazy') && !items[i].hasAttribute('data-tf-not-load')) {
										intersect2.observe(items[i]);
									}
								}
							}
						},1600);
					});
				}
				else{
					observerInit =self.observer;
				}
                for (let i = 0; i < len; ++i) {
                    if (!items[i].hasAttribute('data-tf-not-load')) {
                        observerInit.observe(items[i]);
                    }
                }
            }
        },
        lazyScroll(items, init) {
		
            let len = 0;
            if (items) {
                len = items.length;
                if (len === undefined) {
                    items = [items];
                    len = 1;
                } else if (len === 0) {
                    return;
                }
            }
			const svg_callback=function(){
				this.classList.remove('tf_svg_lazy_loaded','tf_svg_lazy');
			};
            for (let i = len - 1; i > -1; --i) {
                let el = items[i],
                        tagName = el.tagName;
                if (!el || !el.hasAttribute('data-lazy')) {
                    if (el) {
                        el.removeAttribute('data-lazy');
                    }
                } else {
                    el.removeAttribute('data-lazy');
                    if (tagName!=='IMG' && (tagName === 'DIV' || !el.hasAttribute('data-tf-src'))) {
                        let $el = $(el);
                        try {
                            el.classList.remove('tf_lazy');
                            this.reRun($el, null, true);
                            this.trigger('tf_lazy', $el);
                        } catch (e) {
                            console.log(e);
                        }
                    }
					else if (tagName !== 'svg') {
						let src = el.getAttribute('data-tf-src'),
							srcset = el.getAttribute('data-tf-srcset');
                        if (src) {
                            el.setAttribute('src', src);
                            el.removeAttribute('data-tf-src');
                        }
                        if (srcset) {
							let sizes=el.getAttribute('data-tf-sizes');
							if(sizes){
								el.setAttribute('sizes', sizes);
								el.removeAttribute('data-tf-sizes');
							}
                            el.setAttribute('srcset', srcset);
                            el.removeAttribute('data-tf-srcset');
                        }
						el.removeAttribute('loading');
                        if (el.classList.contains('tf_svg_lazy')) {
                            this.imagesLoad(el, function (instance) {
                                const svg = instance.elements[0];
								requestAnimationFrame(function(){
									svg.addEventListener('transitionend', svg_callback, {once:true, passive:true});
									svg.classList.add('tf_svg_lazy_loaded');
								});
                            });
                        } 
						else if (tagName !== 'IFRAME' && init !== true && el.parentNode !== this.body[0]) {
                            el.parentNode.classList.add('tf_lazy');
                            this.imagesLoad(el, function (instance) {
                                instance.elements[0].parentNode.classList.remove('tf_lazy');
                            });
                        }
                    }
                }
                if (this.observer !== null && el) {
                    this.observer.unobserve(el);
                }
            }
        },
        reRun(el, type, isLazy) {
            if (isLazy !== true) {
                this.loadFonts();
            }
            if (typeof ThemifyBuilderModuleJs !== 'undefined') {
                ThemifyBuilderModuleJs.loadOnAjax(el, type, isLazy);
                this.initComponents(el, isLazy);
            } else if (!this.is_builder_loaded && themify_vars && !themify_vars['is_admin'] && window['tbLocalScript'] && document.getElementsByClassName('module_row')[0]) {
                const self = this;
                self.LoadAsync(window['tbLocalScript'].builder_url + '/js/themify.builder.script.js', function () {
                    self.is_builder_loaded = true;
                    ThemifyBuilderModuleJs.loadOnAjax(el, type, isLazy);
                    self.initComponents(el, isLazy);
                }, null, null, function () {
                    return typeof ThemifyBuilderModuleJs !== 'undefined';
                });
            } else {
                this.initComponents(el, isLazy);
            }
        },
        sideMenu(items, options, callback) {
            if (!items || items.length === 0) {
                return;
            }
            if (!this.jsLazy['tf_sidemenu']) {
                const self = this;
                this.LoadAsync(this.js_modules.side, function (items, options, callback) {
                    self.jsLazy['tf_sidemenu'] = true;
                    self.trigger('tf_side_menu_init', [items, options, callback]);

                }.bind(null, items, options, callback), null, null, function () {
                    return !!self.jsLazy['tf_sidemenu'];
                });
            } else {
                this.trigger('tf_side_menu_init', [items, options, callback]);
            }
        },
        edgeMenu() {
            if (!this.jsLazy['tf_edgeMenu']) {
                this.jsLazy['tf_edgeMenu'] = true;
                if (document.getElementsByClassName('sub-menu')[0]) {
                    this.LoadAsync(this.js_modules.edge);
                }
            }
        },
        wayPoints(callback) {
            if (!this.jsLazy['wayPoints']) {
                const self = this;
                this.LoadAsync(self.url + '/js/waypoints.min.js', function (callback) {
                    self.jsLazy['wayPoints'] = true;
                    callback();
                }.bind(null, callback), '4.0.0', null, function () {
                    return 'undefined' !== typeof $.fn.waypoint;
                });
            } else {
                callback();
            }
        },
        loadAnimateCss(callback) {
            if (!this.cssLazy['animate']) {
                const self = this;
                this.LoadCss(self.css_modules.an, themify_vars['a_v'], null, null, function () {
                    self.cssLazy['animate'] = true;
                    if (callback) {
                        callback();
                    }
                });
            } else if (callback) {
                callback();
            }
        },
        loadWowJs(callback) {
            if (!this.jsLazy['tb_wow']) {
                const self = this,
                        check = function () {
                            if (self.cssLazy['animate'] === true && self.jsLazy['tf_wow'] === true && callback) {
                                callback();
                            }
                        };
                this.loadAnimateCss(check);
                this.LoadAsync(this.js_modules.wow, function () {
                    self.jsLazy['tf_wow'] = true;
                    check();
                }, null, null, function () {
                    return !!self.jsLazy['tf_wow'];
                });
            } else if (callback) {
                callback();
            }
        },
        sharer(type, url, title) {
            if (!this.jsLazy['tf_sharer']) {
                const self = this;
                this.LoadAsync(this.js_modules.share, function () {
                    self.jsLazy['tf_sharer'] = true;
                    self.trigger('tf_sharer_init', [type, url, title]);
                }, null, null, function () {
                    return !!self.jsLazy['tf_sharer'];
                });
            } else {
                this.trigger('tf_sharer_init', [type, url, title]);
            }
        },
           loadDropDown(items, callback, load_stylesheet) {
            if (!items || items.length === 0) {
                return;
            }
            const self = this;
			if ( load_stylesheet!==false ) {
				this.LoadCss(self.css_modules.drop);
			}
            this.LoadAsync(this.js_modules.drop, function () {
                self.jsLazy['tf_dropdown'] = true;
                self.trigger('tf_dropdown_init', [items]);
                if (callback) {
                    callback();
                }
            }, null, null, function () {
                return !!self.jsLazy['tf_dropdown'];
            });
        },
        initResizeHelper() {
            let running = false,
                    timeout = null;
            const self = this,
                    ev = 'onorientationchange' in window ? 'orientationchange' :'resize';
            window.addEventListener(ev, function () {
                if (running) {
                    return;
                }
                running = true;
                if (timeout) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(function () {
                    requestAnimationFrame(function () {
                        const w = window.innerWidth,
                                h = window.innerHeight;
                        if (h !== self.h || w !== self.w) {
                            const params = {w:w, h:h, type:'tfsmartresize','origevent':ev};
                            self.trigger('tfsmartresize', params);
                            $(window).triggerHandler('tfsmartresize', [params]);
                            self.w = w;
                            self.h = h;
                        }
                        running = false;
                    });
                }, 150);
            }, {passive:true});
        },
        mobileMenu() {
            if (themify_vars.menu_point) {
                const self = this,
                        w = parseInt(themify_vars.menu_point),
                        _init = function (e) {
                            if ((!e && self.w <= w) || (e && e.w <= w)) {
                                self.body[0].classList.add('mobile_menu_active');
                            } else if (e !== undefined) {
                                self.body[0].classList.remove('mobile_menu_active');
                            }
                        };
                _init();
                Themify.on('tfsmartresize', _init);
            }
        },
        initWC(force) {
            if (themify_vars.wc_js) {
				const self = this;
                setTimeout(function () {
					document.addEventListener((self.isTouch?'touchstart':'mousemove'),function(){
						const fr = document.createDocumentFragment();
						for (let i in themify_vars.wc_js) {
							let link = document.createElement('link'),
									href = themify_vars.wc_js[i];
							if (href.indexOf('ver', 12) === -1) {
								href += '?ver=' + themify_vars.wc_version;
							}
							link.as = 'script';
							link.rel = 'prefetch';
							link.href = href;
							fr.appendChild(link);
						}
						document.head.appendChild(fr);
					},{once:true,passive:true});
                }, 1800);
                if (!this.jsLazy['tf_wc']) {
                    this.LoadAsync(this.js_modules.wc, function () {
                        self.jsLazy['tf_wc'] = true;
                        self.trigger('tf_wc_init', force);
                    }, null, null, function () {
                        return !!self.jsLazy['tf_wc'];
                    });
                } else {
                    this.trigger('tf_wc_init', force);
                }
            }
        },
        megaMenu(menu,disable) {
            if (menu) {
                const isDisabled = disable || themify_vars.disableMega,
                        self = this,
                        maxW = 1 * themify_vars.menu_point + 1,
                    removeDisplay=function (e){
                        const el=e instanceof jQuery?e:this,
                            w=e instanceof jQuery?self.w:e.w;
                        if(w>maxW){
                            el.css('display','');
                        }else{
                            Themify.on('tfsmartresize',removeDisplay.bind(el),true);
                        }
                    },
                    closeDropdown=function (e){
                        const el=e instanceof jQuery?e:this;
                        if(e.target && !el[0].parentNode.contains(e.target)){
                            el.css('display','');
                            el[0].parentNode.classList.remove('toggle-on');
                        }else{
                            document.addEventListener('touchstart',closeDropdown.bind(el),{once:true});
                        }
                    };
                if (!isDisabled && menu.getElementsByClassName('mega-link')[0]) {
                    const loadMega = function () {
                        const check = function () {
                            if (self.cssLazy['tf_megamenu'] === true && self.jsLazy['tf_megamenu'] === true) {
                                self.trigger('tf_mega_menu', [menu, maxW]);
                            }
                        };
                        if (!self.cssLazy['tf_megamenu']) {
                            self.LoadCss(self.css_modules.mega, null, null, 'screen and (min-width:' + maxW + 'px)', function () {
                                self.cssLazy['tf_megamenu'] = true;
                                check();
                            });
                        }
                        if (!self.jsLazy['tf_megamenu']) {
                            self.LoadAsync(self.js_modules.mega, function () {
                                self.jsLazy['tf_megamenu'] = true;
                                check();
                            });
                        }
                        check();
                    };
                    if (this.w >= maxW || !this.isTouch) {
                        loadMega();
                    } else if (this.isTouch) {
                        const _resize = function () {
                            const ori = typeof this.screen!=='undefined' && typeof this.screen.orientation!=='undefined'?this.screen.orientation.angle:this.orientation,
                                    w = (ori === 90 || ori === -90) ? this.innerHeight :this.innerWidth;
                            if (w >= maxW) {
                                this.removeEventListener('orientationchange', _resize, {passive:true});
                                loadMega();
                            }
                        };
                        window.addEventListener('orientationchange', _resize, {passive:true});
                    }
                }
                menu.addEventListener('click', function (e) {
                    if (e.target.classList.contains('child-arrow') || (e.target.tagName === 'A' && (e.target.getAttribute('href') === '#' || e.target.parentNode.classList.contains('themify_toggle_dropdown')))) {
                        let el = $(e.target);
                        if (el[0].tagName === 'A') {
                            if (!el.find('.child-arrow')[0]) {
                                return;
                            }
                        } else {
                            el = el.parent();
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        const li = el.parent();
                        let els = null,
                            is_toggle = undefined != themify_vars.m_m_toggle && !li.hasClass('toggle-on') && self.w < maxW;
                        if (is_toggle) {
                            els = li.siblings('.toggle-on');
                            is_toggle = els.length > 0;
                        }
                        if (self.w < maxW || e.target.classList.contains('child-arrow') || el.find('.child-arrow:visible').length>0) {
                            const items=el.next('div, ul'),
                                ist=items[0].getAttribute('style');
                            if(self.w < maxW && (ist===null || ist==='')){
                                removeDisplay(items);
                            }
                            if(maxW < self.w && Themify.isTouch && !li.hasClass('toggle-on') && !Themify.body[0].classList.contains('mobile-menu-visible') && document.getElementById('headerwrap').offsetWidth>400){
                                closeDropdown(items);
                                li.siblings('.toggle-on').removeClass('toggle-on');
                            }
                            items.toggle('fast');
                            if (is_toggle) {
                                const slbs=els.find('>div,>ul'),
                                    sst=slbs[0].getAttribute('style');
                                if(self.w < maxW && (sst===null || sst==='')){
                                    removeDisplay(slbs);
                                }
                                slbs.toggle('fast');
                            }
                        }
                        if (is_toggle) {
                            els.removeClass('toggle-on');
                        }
                        li.toggleClass('toggle-on');
                    }
                });
            }
        }
    };
    Themify.Init();

}(window, document, jQuery));
