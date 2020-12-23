/**
 * isotop module
 */
;
(function (Themify, window, document) {
    'use strict';
    let st = null;
    const config = {
        attributes:true,
        attributeOldValue:false,
        characterDataOldValue:false,
        childList:true,
        subtree:true,
        attributeFilter:['data-lazy', 'src', 'class']
    },
    isoTopItems = [],
    sizes = {
        'list-post':100,
        'list-large-image':100,
        'list-thumb-image':100,
        'grid2':48.4,
        'grid2-thumb':48.4,
        'grid3':31.2,
        'grid4':22.6,
		'grid5':17.44,
		'grid6':14
    },
    styles = {},
    mutationObserver = new MutationObserver(function (mutationsList, observer) {
		if(mutationsList[0] && mutationsList[0].target){
			const wrap = mutationsList[0].target.closest('.masonry-done');
			if (wrap) {
				setTimeout(function () {
					Themify.imagesLoad(wrap, function () {
						const iso = window['Isotope'].data(wrap);
						if (iso) {
							requestAnimationFrame(function(){
								iso.layout();
							});
						}
					});
				}, 1200);
			}
        }
    }),
    reLayoutIsoTop = function () {
        for (let i = isoTopItems.length - 1; i > -1; --i) {
            try {
                if(isoTopItems[i].element.classList.contains('masonry-done')){
                    isoTopItems[i].layout();
                }
                else{
                    isoTopItems.splice(i, 1);
                }
            } catch (er) {
                isoTopItems.splice(i, 1);
            }
        }
    },
    init = function (item, options) {
        if (!options || typeof options !== 'object') {
            options = {
                layoutMode:item.getAttribute('data-layout'),
                gutter:item.getAttribute('data-gutter'),
                columnWidth:item.getAttribute('data-column'),
                itemSelector:item.getAttribute('data-selector'),
                fitWidth:item.getAttribute('data-fit') === '1',
                percentPosition:item.getAttribute('data-percent') !== '0'
            };
            if (options['gutter'] === '0') {
                options['gutter'] = false;
            }
            if (options['columnWidth'] === '0') {
                options['columnWidth'] = false;
        }
        }
        if (!options['layoutMode'] && item.classList.contains('packery-gallery')) {
            options['layoutMode'] = 'packery';
            options['columnWidth'] = options['gutter'] = false;
        }
        const opt = {
            originLeft:!Themify.isRTL,
            resize:false,
            containerStyle:null,
            onceLayoutComplete:options['onceLayoutComplete'],
            layoutComplete:options['layoutComplete'],
            arrangeComplete:options['arrangeComplete'],
            removeComplete:options['removeComplete'],
            filterCallback:options['filterCallback']
        },
        mode = options['layoutMode'] ? options['layoutMode'] :'masonry';
        opt['layoutMode'] = mode;
        opt[mode] = {};
        opt[mode]['columnWidth'] = options['columnWidth'];
        opt[mode]['gutter'] = options['gutter'];
        if (!options['itemSelector']) {
            opt['itemSelector'] = item.classList.contains('products') ? '.products>.product' :(item.classList.contains('gallery-wrapper') ? '.item' :'.loops-wrapper > .post');
        } else {
            opt['itemSelector'] = options['itemSelector'];
        }
        opt['stagger'] = options['stagger'] ? options['stagger'] :30;
        if (options['fitWidth'] === true) {
            opt[mode]['fitWidth'] = true;
        }
        if (options['stamp']) {
            opt['stamp'] = options['stamp'];
        }
        if (options['fitWidth'] === true) {
            opt['percentPosition'] = false;
        } else {
            opt['percentPosition'] = options['percentPosition'] === undefined ? true :options['percentPosition'];
        }

        const finish = function () {
            Themify.imagesLoad(item, function (instance) {
                const wrap = instance.elements[0],
                        postFilter = wrap.previousElementSibling;
                let size = '',
                        gutter = 0,
                        hasGutter = opt[mode]['gutter'] === false ? false :!wrap.classList.contains('no-gutter'),
						isGutter=wrap.getElementsByClassName('gutter-sizer')[0];
						const check = Isotope.data( wrap ),
						removeGutter=function(){
							if(isGutter){
								isGutter.remove();
								isGutter=false;
							}
						};
						if(check){
								check.destroy();
								wrap.classList.remove('masonry-done');
								removeGutter();
						}
                if (wrap.classList.contains('auto_tiles')) {
                    if (postFilter !== null && postFilter.classList.contains('post-filter')) {
                        Themify.trigger('themify_isotop_filter', [postFilter, undefined, opt['filterCallback']]);
                    }
                    return;
                }
                for (let cl = wrap.classList, i = cl.length - 1; i > -1; --i) {
                    if (sizes[cl[i].trim()] !== undefined) {
                        size = cl[i].trim();
                        break;
                    }
                }
				if (size === 'list-post' || size === 'list-large-image' || size === 'list-thumb-image' || size==='grid2-thumb') {
					if (postFilter === null || !postFilter.classList.contains('post-filter')) {
						removeGutter();
						return;
					}
					hasGutter = false;
				}
				if(!styles['masonry_done']){
					styles['masonry_done']=true;
					const stText='.masonry.masonry-done>.post,.products.masonry-done>.product{animation-fill-mode:backwards;transition:none;animation:none;clear:none!important;margin-right:0!important;margin-left:0!important}.masonry-done{opacity:1}';
					if (st === null) {
						st = document.createElement('style');
						st.innerText = stText;
						document.head.prepend(st);
					}
					else{
						st.innerText+= stText;
					}
				}
				if (hasGutter === true) {
					if(!isGutter){
						gutter = document.createElement('div');
						gutter.className = 'gutter-sizer';
						wrap.insertBefore(gutter, wrap.firstChild);
					}
					else{
						gutter=isGutter;
					}
					
					if (!wrap.classList.contains('tf_fluid')) {
						let stylesText = '';
						const isProduct = wrap.classList.contains('products'),
							gutterSize=wrap.classList.contains('gutter-narrow')?1.6:3.2;
					
						if(!styles[gutterSize+isProduct]){
							styles[gutterSize+isProduct]=true;
							const sel=isProduct?'.products>':'';
							stylesText += sel+'.gutter-sizer{width:'+gutterSize+'%}';
						}	
						if(!styles['contain']){
							styles['contain']=true;
							stylesText += '.gutter-sizer{contain:paint style size}@media (max-width:680px){.gutter-sizer{width:0}}';
						}
						if (stylesText) {
							st.innerText= stylesText+st.innerText;
						}
					}
				}
				else{
					removeGutter();
				}
				opt[mode]['gutter'] = gutter;
                wrap.classList.add('masonry-done','tf_rel');
                const iso = new Isotope(wrap, opt);
                isoTopItems.push(iso);
                mutationObserver.observe(wrap, config);
                if (postFilter !== null && postFilter.classList.contains('post-filter')) {
                    Themify.trigger('themify_isotop_filter', [postFilter, iso,opt['filterCallback']]);
                }
                iso.revealItemElements(iso.items);

                if (opt['onceLayoutComplete']) {
                    iso.once('layoutComplete', opt['onceLayoutComplete']);
                }
                if (opt['layoutComplete']) {
                    iso.on('layoutComplete', opt['layoutComplete']);
                }
                if (opt['arrangeComplete']) {
                    iso.on('arrangeComplete', opt['arrangeComplete']);
                }
                if (opt['removeComplete']) {
                    iso.on('removeComplete', opt['removeComplete']);
                }
                iso.layout();
            });
        };
        if (mode === 'packery' && !window['Packery']) {
            Themify.LoadAsync(Themify.jsUrl + 'isotop-packery.min.js', finish, '2.0.1', null, function () {
                return !!window['Packery'];
            });
        } else {
            finish();
        }
    },
    check = function (items, options) {
        if (window['imagesLoaded'] && window['Isotope']) {
            if (items.length === undefined) {
                items = [items];
            }
            for (let i = items.length - 1; i > -1; --i) {
                Themify.requestIdleCallback(function () {
                    init(items[i], options);
                }, 500);
            }
        }
    };

Themify.on('tf_isotop_init', function (items, options) {
if (!window['imagesLoaded']) {
    Themify.imagesLoad(function () {
        check(items, options);
    });
}
if (!window['Isotope']) {
    Themify.LoadAsync(Themify.jsUrl + 'jquery.isotope.min.js', function () {
        check(items, options);
    }, '3.0.6', null, function () {
        return !!window['Isotope'];
    });
}
check(items, options);
})
.on('themify_isotop_filter', function (postFilter, hasIso, callback) {
		if(postFilter.hasAttribute('data-done')){
			return;
		}
		postFilter.setAttribute('data-done',1);
        const children = postFilter.children,
			len = children.length,
			wrap = postFilter.nextElementSibling;
        let count = 0;
        if (!styles['post_filter']) {
            styles['post_filter'] = true;
            const stylesText = '.post-filter{transition:opacity .2s ease-in-out}';
            if (st === null) {
                st = document.createElement('style');
                st.innerText = stylesText;
                document.head.prepend(st);
            } else {
                st.innerText += stylesText;
            }
        }
        for (let i = len - 1; i > -1; --i) {
            let cat = children[i].getAttribute('class').replace(/(current-cat)|(cat-item)|(-)|(active)/g, '').replace(' ', ''),
                    post = wrap.querySelector('.cat-' + cat);
            if (post === null || post.parentNode !== wrap) {
                children[i].style['display'] = 'none';
                ++count;
            } else {
                children[i].style['display'] = '';
            }
        }
        if ((len - count) > 1) {
            postFilter.classList.remove('tf_opacity');
            postFilter.style['display'] = '';
        } else {
            postFilter.style['display'] = 'none';
        }
        if (hasIso || wrap.classList.contains('auto_tiles')) {
            const _filter = function (e) {
                e.preventDefault();
                const target =e.target.closest('.cat-item');
                if (target) {
                    let value = '*';
                    if (!target.classList.contains('active')) {
						const active = this.querySelector('.active');
						if(active){
							active.classList.remove('active');
						}
                        value = target.getAttribute('class').replace(/(current-cat)|(cat-item)|(-)|(active)/g, '').replace(' ', '');
						target.className+=' active';
                        value = '.cat-' + value.trim();
                    } else {
                        target.classList.remove('active');
                    }
                    const wrap = this.nextElementSibling;
                    if (wrap !== null) {
                        let iso = window['Isotope'].data(wrap);
                        if (wrap.classList.contains('auto_tiles')) {
                            const posts = wrap.children;
                            for (let i = posts.length - 1; i > -1; --i) {
                                if (posts[i].classList.contains('post') && !posts[i].style['width']) {
                                    posts[i].style['width'] = posts[i].offsetWidth + 'px';
                                    posts[i].style['height'] = posts[i].offsetHeight + 'px';
                                }
                            }
                            wrap.classList.add('masonry-done');
                            if (!iso) {
                                let gutter;
                                if (Themify.w < 680) {
                                    gutter = 0;
                                } else {
                                    gutter = window.getComputedStyle(wrap).getPropertyValue('grid-row-gap');
                                    if (gutter) {
                                        gutter = parseFloat(gutter);
                                    } else if (gutter != '0') {
                                        gutter = 5;
                                    }
                                }
                                iso = new Isotope(wrap, {
                                    masonry:{
                                        'gutter':gutter
                                    },
                                    resize:false
                                });
                            }
                            if (value === '*') {
                                const _arrange = function () {
									const _this=this;
                                    this.off('arrangeComplete', _arrange);
                                    setTimeout(function () {
                                        if (value === '*') {
                                            const posts = _this.element.children;
                                            for (let i = posts.length - 1; i > -1; --i) {
                                                if (posts[i].classList.contains('post')) {
                                                    posts[i].style['width'] = posts[i].style['height'] = posts[i].style['position'] = posts[i].style['left'] = posts[i].style['top'] = '';
                                                }
                                            }
                                            _this.element.classList.remove('masonry-done');
                                            _this.element.style['height'] = _this.element.style['position'] = '';
                                        }
                                    }, 20);
                                };
                                iso.once('arrangeComplete', _arrange);
                            }
                        }
                        if (iso) {
                            iso.arrange({filter:(value !== '*' ? (value + ',.cat-all') :value)});
                            if (callback) {
                                callback.call(iso, target, value);
                            }
                        }
                    }
                }
            };
			postFilter.addEventListener('click',_filter);
        }
    }).
    on('tf_isotop_layout tfsmartresize', reLayoutIsoTop);

})(Themify, window, document);
