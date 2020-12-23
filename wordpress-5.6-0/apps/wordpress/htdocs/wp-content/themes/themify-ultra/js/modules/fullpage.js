/* fullpage */
;
(function ($, Themify, document, window, themifyScript) {
    'use strict';
    let initFullPage = false,
		initOnce=false,
        fullPageOptions;
    const updateFullPage = function(options){
            const rows = document.querySelectorAll(options['sectionsWrapper']),
                cl = options['usesRows']?'module_row':options['sectionClass'].replace('.',''),
				getCurrentView=function(){
					const w = Themify.w,
						bp=themifyScript.breakpoints;
					for(let k in bp){
						if(Array.isArray(bp[k])){
							if(w>=bp[k][0] && w<=bp[k][1]){
								return k;
							}
						}
						else if(w<=bp[k]){
							return k;
						}
					}
					return 'desktop';
				},
				view=getCurrentView();	
					
            for(let i = rows.length - 1; i > - 1; -- i){
                let childs = rows[i].children;
                for(let j = childs.length - 1; j > - 1; -- j){
					if(childs[j].classList.contains(cl) && (childs[j].classList.contains('hide-'+view) || (childs[j].offsetWidth === 0 && childs[j].offsetHeight === 0))){
						childs[j].parentNode.removeChild(childs[j]);
					}
                }
            }
            // Set default row column alignment
            window.top._rowColAlign = 'col_align_middle';
        },
        lazyLoad = function(el){
            if(el !== null && el !== undefined && ! el.hasAttribute('data-done')){
                el.setAttribute('data-done',true);
                Themify.lazyScroll(Themify.convert(Themify.selectWithParent('[data-lazy]',el)).reverse(),true);
            }
        },
        afterRender = function(el,hash){
            $.fn.fullpage.setAutoScrolling(true);
            const rows = el.getElementsByClassName('module_row'),
                videos = el.getElementsByTagName('video');
            for(let i = rows.length - 1; i > - 1; -- i){
                let items = [rows[i].getElementsByClassName('builder_row_cover')[0],rows[i].getElementsByClassName('row-slider')[0]];
                for(let j = items.length - 1; j > - 1; -- j){
                    if(items[j]){
                        let p = items[j].parentNode;
                        if(! p.classList.contains('module_row') && ! p.classList.contains('module_column') && ! p.classList.contains('module_subrow')){
                            rows[i].insertBefore(items[j],rows[i].firstChild);
                        }
                    }
                }
            }
            for(let i = videos.length - 1; i > - 1; -- i){
                videos[i].setAttribute('data-autoplay',true);
            }
            const allLazy = document.querySelectorAll('[data-lazy]'),
                lazyItems = [];
            for(let i = allLazy.length - 1; i > - 1; -- i){
                if(! el.contains(allLazy[i])){
                    lazyItems.push(allLazy[i]);
                }
            }
            Themify.lazyDisable = null;
            Themify.lazyLoading(lazyItems);
            Themify.lazyDisable = true;
            if(hash !== '' && scrollTo(el,hash)){
                initFullPage = true;
                return;
            }
            initFullPage = true;
            $.fn.fullpage.getFullpageData()['options'].afterLoad.call([$.fn.fullpage.getInstance()[0].querySelector('.active')],'',1);
        },
        scrollTo = function(el,anchor){
            if(anchor.indexOf('/') !== - 1){
                anchor = anchor.substring(0,anchor.indexOf('/'));
            }
            if(anchor && '#' !== anchor){
                anchor = anchor.replace('#','');
                let sectionEl = el.querySelector('[data-anchor="' + anchor + '"]');
                if(! sectionEl){
                    sectionEl = document.getElementById(anchor);
                }
                if(sectionEl !== null){
                    sectionEl = $(sectionEl);
                    const section = sectionEl.closest('.section-container');
                    if(section.length < 1){
                        return false;
                    }
                    const sectionIndex = section.index() + 1,
                        slideIndex = sectionEl.index();
                    if(! section[0].classList.contains('active') || ! sectionEl[0].classList.contains('active')){
                        if(initFullPage === false){
                            $.fn.fullpage.silentMoveTo(sectionIndex,slideIndex);
                        }else{
                            $.fn.fullpage.moveTo(sectionIndex,slideIndex);
                        }
                        return true;
                    }
                }
            }
            return false;
        },
        setActiveMenu = function(menu,anchor){
            if(menu !== null){
                const items = menu.getElementsByTagName('li');
                let aSectionHref = menu.querySelector('a[href="#' + anchor.replace('#','') + '"]');
                if(aSectionHref !== null){
                    aSectionHref = aSectionHref.parentNode;
                }
                for(let i = items.length - 1; i > - 1; -- i){
                    if(aSectionHref === items[i]){
                        items[i].classList.add('current-menu-item');
                    }else{
                        items[i].classList.remove('current_page_item','current-menu-item');
                    }
                }
            }
        },
        getAnchor = function(row){// Get builder rows anchor class to ID //
            if(! row.hasAttribute('data-hide-anchor')){
                let anchor = row.getAttribute('data-anchor');
                if(! anchor){
                    anchor = row.getAttribute('id');
                    if(! anchor){
                        anchor = '';
                    }
                }
                return anchor;
            }
            return '';
        },
        setAnchor = function(row){
            if(row){
                const anchor = getAnchor(row);
                if(anchor && anchor !== '#'){
                    if(window.location.hash !== anchor){
                        window.location.hash = anchor;
                    }
                }else{
                    history.replaceState(null,null,location.pathname);
                }
            }
        },
        createFullScrolling = function(options){
            const usesRows = options['usesRows'],
                slideClass = options['slideClass'],
                sectionClass = options['sectionClass'],
                is_Horizontal = options['is_horizontal'],
                $body = Themify.body,
                $wrapper = $(options['sectionsWrapper']),
                slideCl = slideClass.replace('.',''),
                menu = usesRows?document.getElementById('main-nav'):null,
                rows = usesRows?document.getElementsByClassName('module_row'):null,
                sectionAnchors = [],
                items = document.getElementsByClassName(slideCl);
            let currentHash = location.hash.replace('#','').replace('!/','');
            if(rows && rows[0]){
                const temp = items[0];//don't remove this will break horizontal scrolling
                if(temp !== undefined){
                    temp.classList.remove(slideCl);
                }
                $wrapper.find('>' + sectionClass).each(function(){
                    let wrap = document.createElement('div');
                    wrap.className = 'section-container';
                    while(true){
                        let next = this.nextElementSibling;
                        if(next !== null && next.classList.contains(slideCl)){
                            wrap.appendChild(next);
                        }else{
                            break;
                        }
                    }
                    this.parentNode.insertBefore(wrap,this);
                    this.classList.add(slideCl);
                    wrap.prepend(this);
                });
                for(let i = 0,len = rows.length; i < len; ++ i){
                    sectionAnchors.push(getAnchor(rows[i]));
                }
            }

            const wowItems = $wrapper[0].getElementsByClassName('wow');
            for(let i = wowItems.length - 1; i > - 1; -- i){
                if(! wowItems[i].hasAttribute('data-tf-animation_delay')){
                    wowItems[i].setAttribute('data-tf-animation_delay','.3');
                }
            }
            $wrapper.fullpage({
                resize:false,
                sectionSelector:'.section-container',
                slideSelector:slideClass,
                navigationTooltips:sectionAnchors,
                scrollOverflow:true,
                recordHistory:false,
                navigation:true,
                lazyLoading:false,
                lockAnchors:false,
                verticalCentered:true,
                autoScrolling:false,
                /* horizontal scrolling is only disabled on vertical-direction pages with Snake-style scrolling disabled */
                scrollHorizontally:! ($body[0].classList.contains('full-section-scrolling-single') && ! $body[0].classList.contains('full-section-scrolling-horizontal')),
                scrollHorizontallyKey:'QU5ZX1UycmMyTnliMnhzU0c5eWFYcHZiblJoYkd4NWhLbA==',
                slidesNavigation:true,
                parallax:$body[0].classList.contains('section-scrolling-parallax-enabled'),
                parallaxKey:'QU5ZX0FodGNHRnlZV3hzWVhnPXY1bA==',
                parallaxOptions:{
                    type:'reveal',
                    percentage:62,
                    property:'translate'
                },
                scrollOverflowOptions:{
                    hideScrollbars:true,
                    preventDefault:false
                },
                afterRender:function(){
					if(initOnce===false){
						initOnce=true;
						if(initFullPage === false && currentHash !== ''){
							afterRender($wrapper[0],currentHash);
							setActiveMenu(menu,currentHash);
						}
						let prevHash = currentHash;
						const changeHash = function(hash){
							if(hash && hash !== '#' && prevHash !== hash){
								prevHash = hash;
								setActiveMenu(menu,hash);
								if(scrollTo($wrapper[0],hash) && Themify.body[0].classList.contains('mobile-menu-visible')){
									/* in Overlay header style, when a menu item is clicked, close the overlay */
									const menu = document.getElementById('menu-icon');
									if(menu){
										menu.click();
									}
								}

							}
						};
						if(rows && rows[0]){
							for(let i = rows.length-1; i>-1;--i){
								let bg=document.createElement('div');
								if(!rows[i].getElementsByClassName('fp-bg')[0]){
									bg.className='fp-bg';
								}
								rows[i].prepend(bg);
							}
						}
						window.addEventListener('hashchange',function(e){
							changeHash(this.location.hash);
						},{passive:true});
						Themify.body.on('click','a[href]',function(e){
							let url = this.getAttribute('href');
							if(url && url !== '#' && url.indexOf('#') !== - 1){
								let path = new URL(url);
								if(path.hash && (url.indexOf('#') === 0 || (path.pathname === location.pathname && path.hostname === location.hostname))){
									e.preventDefault();
									changeHash(path.hash);
								}
							}
						});
					}
                },
                afterLoad:function(anchorLink,index){
                    if(initFullPage === false){
                        afterRender($wrapper[0],currentHash);
                        setActiveMenu(menu,currentHash);
                        return;
                    }
                    const slide = this[0].querySelector('.active' + slideClass);
                    setAnchor(slide);
                    if(slide !== null){
                        if(slide.hasAttribute('data-lazy')){
                            lazyLoad(slide);
                        }
                        if(slide.nextElementSibling !== null && slide.nextElementSibling.hasAttribute('data-lazy')){
                            lazyLoad(slide.nextElementSibling);
                        }
                        if(slide.previousElementSibling !== null && slide.previousElementSibling.hasAttribute('data-lazy')){
                            lazyLoad(slide.previousElementSibling);
                        }
                    }
                    if(this[0].nextElementSibling !== null){
                        lazyLoad(this[0].nextElementSibling.querySelector('[data-lazy]'));
                    }
                    if(this[0].previousElementSibling !== null){
                        lazyLoad(this[0].previousElementSibling.querySelector('[data-lazy]'));
                    }
                    if(index === 1){
                        Themify.trigger('tf_fixed_header_disable');
                    }else{
                        Themify.trigger('tf_fixed_header_enable');
                    }
                    Themify.trigger('themify_onepage_afterload',[slide]);

                },
                onLeave:function(index,nextIndex,direction){
                    // when lightbox is active, prevent scrolling the page
                    if($body.find('> .mfp-wrap').length > 0){
                        return false;
                    }
                    const sections = this[0].parentNode.children;
                    for(let i = sections.length - 1; i > - 1; -- i){
                        if(i === (nextIndex - 1)){
                            lazyLoad(sections[i].querySelector('[data-lazy]'));
                            break;
                        }
                    }
                },
                afterSlideLoad:function(section,origin,destination,direction){
                    if(! section){
                        section = '';
                    }
                    if(this[0].hasAttribute('data-lazy')){
                        lazyLoad(this[0]);
                    }
                    if(this[0].nextElementSibling !== null && this[0].nextElementSibling.hasAttribute('data-lazy')){
                        lazyLoad(this[0].nextElementSibling);
                    }
                    if(this[0].previousElementSibling !== null && this[0].previousElementSibling.hasAttribute('data-lazy')){
                        lazyLoad(this[0].previousElementSibling);
                    }
                    setAnchor(this[0]);
                    Themify.trigger('themify_onepage_afterload',[this[0]]);

                },
                onSlideLeave:function(anchorLink,sectionIndex,prevSlideIndex,direction,nextIndex,index){
                    const sections = this[0].parentNode.children;
                    for(let i = sections.length - 1; i > - 1; -- i){
                        if(i === (nextIndex - 1)){
                            if(sections[i].hasAttribute('data-lazy')){
                                lazyLoad(sections[i]);
                            }
                            break;
                        }
                    }
                }
            });
        },
        _resizer = function(e){
            const isMobile = themifyScript['f_s_d'] && e.w <= parseInt(themifyScript['f_s_d']);
            if(initFullPage===true && isMobile){
                Themify.lazyDisable=null;
                Themify.lazyLoading();
                $.fn.fullpage.destroy('all');
				if(typeof tbLocalScript!=='undefined' && tbLocalScript['scrollHighlight']){
					delete tbLocalScript['scrollHighlight']['scroll'];
					if(typeof ThemifyBuilderModuleJs!=='undefined'){
						ThemifyBuilderModuleJs.InitScrollHighlight();
					}
				}
				else{
					Themify.trigger('tb_scroll_highlight_enable');
				}
				Themify.body[0].classList.remove('full-section-scrolling');
                initFullPage=false;
            }
			else if (!isMobile && initFullPage===false){
			
				Themify.trigger('tb_scroll_highlight_disable').body[0].classList.add('full-section-scrolling');
                Themify.lazyDisable=true;
                _init(fullPageOptions);
            }
        },
        _init = function(options){
            updateFullPage(options);
            if(! Themify.is_builder_loaded && window['tbLocalScript'] !== undefined){
                Themify.body.one('themify_builder_loaded',function(){
                    createFullScrolling(options);
                });
            }else{
                createFullScrolling(options);
            }
        };

    Themify.on('themify_theme_fullpage_init', function (options) {

        fullPageOptions = options;
        const loaded = {},
            v = themifyScript['f_s_v'],
            check = function () {
                if (loaded['wow'] === true && loaded['scrolloverflow'] === true && loaded['parallax'] === true && loaded['horizontal'] === true && loaded['extensions'] === true) {
                    _init(options);
                    if (themifyScript['f_s_d']){
                        Themify.on('tfsmartresize',_resizer);
                    }
                }
            };
        Themify.loadWowJs(function () {
            loaded['wow'] = true;
            check();
        });
        Themify.LoadAsync(themify_vars.theme_url + '/js/modules/fullpage/fullpage.scrollHorizontally.min.js', function () {
            loaded['horizontal'] = true;
            check();
        }, v, null, function () {
            return window['fp_scrollHorizontallyExtension'] !== undefined;
        });

        Themify.LoadAsync(themify_vars.theme_url + '/js/modules/fullpage/scrolloverflow.min.js', function () {
            loaded['scrolloverflow'] = true;
            check();
        }, v, null, function () {
            return window['IScroll'] !== undefined;
        });
        if (themifyScript['fullpage_parallax'] !== undefined) {
            Themify.LoadAsync(themify_vars.theme_url + '/js/modules/fullpage/fullpage.parallax.min.js', function () {
                loaded['parallax'] = true;
                check();
            }, v, null, function () {
                return window['fp_parallaxExtension'] !== undefined;
            });
        } else {
            loaded['parallax'] = true;
        }
        Themify.LoadAsync(themify_vars.theme_url + '/js/modules/fullpage/jquery.fullpage.extensions.min.js', function () {
            loaded['extensions'] = true;
            check();
        }, v, null, function () {
            return 'undefined' !== typeof $.fn.fullpage;
        });
    }, true);

})(jQuery, Themify, document, window, themifyScript);
