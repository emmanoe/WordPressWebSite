/* Themify Scroll to element based on its class and highlight it when a menu item is clicked.*/
(function($,Themify, window, document) {
	'use strict';
        
	let isScrolling=false,
            observer=null,
            isFixedHeader=true,
            isFirst=true,
            isInit=false,
            currentUrl=null;
        const options=Object.assign({
			speed:900,
			element:'module_row',
			offset:null,
			navigation:'#main-nav,.module-menu .nav',
			updateHash:true
        },tbLocalScript['scrollHighlight']),
		_OFFSET=options['offset'],
        w=window.top,
		header=document.getElementById('headerwrap'),
        TB_ScrollHighlight={
            init(el){
                isFixedHeader=(header!==null && Themify.body[0].classList.contains('fixed-header-enabled')) || _OFFSET;
                if(isInit===false){
                    const hash = w.location.hash.replace('#','');
                    if(hash && hash!=='#'){
                            let item=getCurrentViewItem(document.querySelectorAll('.'+options['element']+'[data-anchor="'+hash+'"]'));
                            if(!item){
                                    const modules = ['tab','accordion'];
                                    for(let i=modules.length-1;i>-1;--i){
                                            let items=document.querySelectorAll('.' + modules[i] +'-content[data-id="'+hash+'"]'),
												l=items.length,
												parents=[];
											if(l>0){
												for(let j=0;j<l;++j){
													parents.push(items[j].closest('.module'));
												}
												item=getCurrentViewItem(parents);
												if(item){
													let target = document.querySelector('a[href="#' + hash + '"]');
													if(target){
															const callback=function(){
																	target.click();
															};
															if(Themify.jsLazy['tb_'+modules[i]]){
																	callback();
															}
															else{
																Themify.on('tb_'+modules[i]+'_init',function(){
																	setTimeout(callback,100);
																},true);
															}
															break;
													}
												}
											}
                                    }
                            }
                            if(item){
                                    this.scrollTo(item,hash);
                            }
                    }
                    isInit=true;
                }
                this.createObserver(el);
            },
            changeHash(){
                if(isScrolling===false){	
                        const hash = w.location.hash.replace('#',''),
                        menus =  document.querySelectorAll(options.navigation);	
                        for(let i=menus.length-1;i>-1;--i){
							let selected=menus[i].getElementsByClassName('current-menu-item');
							for(let j=selected.length-1;j>-1;--j){
								if(currentUrl===null){
									currentUrl=selected[j].getElementsByTagName('a')[0].getAttribute('href');
								}
								selected[j].classList.remove('current_page_item','current-menu-item');
							}
							selected=hash!=='' && hash!=='#'?menus[i].querySelectorAll('a[href*="#' + hash + '"]'):null;
							if(!selected || selected.length===0){
								selected =menus[i].querySelectorAll('a[href="' + currentUrl + '"]');
							}
							for(let j=selected.length-1;j>-1;--j){
								let p =selected[j].parentNode;
								p.classList.add('current-menu-item');
								if(p.classList.contains('menu-item-object-page')){
									p.classList.add('current_page_item');
								}
							}
                        }
						if(currentUrl===null){
							currentUrl=w.location.href.split('#')[0];
						}
                }
            },
            calculatePosition(item){
                let offset=$(item).offset().top+2;
                if(isFixedHeader===true){
                    if(_OFFSET){
                            offset-=_OFFSET-2;
                    }
                    else if(header.classList.contains('fixed-header')){
                            const bottom=header.getBoundingClientRect().bottom+2;
                            if(offset>=bottom){
                                  offset-=bottom;
                            }
                    }
                }
              return offset;
            },
            scrollTo(item,hash){
                    isScrolling=true;
                    if(item.hasAttribute('data-lazy')){
						Themify.lazyScroll(Themify.convert(Themify.selectWithParent('[data-lazy]',item)).reverse(),true);
                    }
                    const isDisabled=Themify.lazyScrolling,
						self=this,
						_isInit=isInit===false,
						complete=function(){
                            //browsers bug intersection sometimes doesn't work after page scrolling on the prev/next row
                            const type=getCurrentView(),
								items=document.getElementsByClassName(options.element),
								obs2=new window['IntersectionObserver'](function (entries, _self) {
									for (let i = entries.length-1; i>-1;--i) {
										if (entries[i].isIntersecting === true) {
											Themify.lazyScroll(Themify.convert(Themify.selectWithParent('[data-lazy]',entries[i].target)).reverse(),true);
                                        }
                                    }
								   _self.disconnect();
								},{
									threshold:.1
								});
							for(let i=items.length-1;i>-1;--i){
								if(items[i].hasAttribute('data-lazy') && !items[i].classList.contains('hide-'+type)){
									obs2.observe(items[i]);
								}
							}
							if(isFixedHeader===true && (_OFFSET || header.classList.contains('fixed-header'))){
								Themify.scrollTo(self.calculatePosition(item), options['speed']);  
							}
							Themify.lazyScrolling=isDisabled;
							isScrolling=false;
							if(_isInit===false){
								hash=item.hasAttribute('data-hide-anchor')?'':('#' + hash.replace('#',''));
								w.history.replaceState(null, null,hash);
							}
							changeHash();
                    },
					progress=isFixedHeader===true && (!header.classList.contains('fixed-header') || _OFFSET)?
					function(){
						if(_OFFSET || header.classList.contains('fixed-header')){
							Themify.scrollTo(self.calculatePosition(item), options['speed'],complete);  
						}
					}:null;
                    Themify.lazyScrolling=true;
                    Themify.scrollTo(self.calculatePosition(item), options['speed'],complete,progress);
            },
            createObserver(el){
                if (options.updateHash) {
                    if(observer===null){
                        observer=new window['IntersectionObserver'](function (entries, _self) {
                            if(isScrolling===false){
                                    let intersect=false;
                                    for (let i = 0,len=entries.length; i<len;++i) {
                                        if (entries[i].isIntersecting === true) {
                                            intersect=entries[i].target.getAttribute('data-anchor');
                                        }
                                    }
                                    if(intersect===false){	
                                            if(isFirst===false){
                                                w.history.replaceState(null, null, ' ');
                                            }
                                            else{
                                                isFirst=false;
                                            }
                                    }
                                    else{
										w.history.replaceState(null, null, '#' + intersect);
										changeHash();
                                    }
                            }
                        }, {
                            rootMargin:'0px 0px -100%',
                            thresholds:[0,1]
                        });
                    }
                    const items=Themify.selectWithParent(options.element,el);
                    for(let i=items.length-1;i>-1;--i){
                        if(!items[i].hasAttribute('data-hide-anchor')){
                            let hash=items[i].getAttribute('data-anchor');
                            if(hash && hash!=='#'){
                                observer.observe(items[i]);
                            }
                        }
                    }
                }
            }
        },
		getCurrentView=function(){
			const w = Themify.w,
				bp=tbLocalScript.breakpoints;
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
		getCurrentViewItem=function(items){
			if(!items[1]){
				return items[0]?items[0]:null;
			}
			let type=getCurrentView();
			for(let i=0,l=items.length;i<l;++i){
				if(!items[i].classList.contains('hide-'+type)){
					return items[i];
				}
			}
			return null;
		},
        changeHash=function(){
                TB_ScrollHighlight.changeHash();
        };
        Themify.on('tb_scroll_highlight_enable',function(){
            w.addEventListener('hashchange',changeHash,{passive:true});
            Themify.body.on('click.tb_scroll_highlight','[href*="#"]',function(e){
                let href = this.getAttribute('href');
                if(href!=='' && href!==null && href!=='#'){
                    const parseUrl=new URL(href,w.location);
                    if(parseUrl.hostname===w.location.hostname && parseUrl.hash && parseUrl.pathname===w.location.pathname){
                        const hash = parseUrl.hash;
                        if(hash!=='' && hash!=='#'){
                            const item=getCurrentViewItem(document.querySelectorAll('.'+options['element']+'[data-anchor="'+hash.replace('#','')+'"]'));
                            if(item){
                                e.preventDefault();
                                e.stopPropagation();
								Themify.trigger('tf_side_menu_hide_all');
                                TB_ScrollHighlight.scrollTo(item,hash);
                            }
                        }
                    }
                }
            });
        })
        .on('tb_scroll_highlight_disable',function(){
            if(observer){
                observer.disconnect();
                observer=null;
            }
            w.removeEventListener('hashchange',changeHash,{passive:true});
            Themify.body.off('click.tb_scroll_highlight');
        })
        .on('tb_init_scroll_highlight',function(el){
            TB_ScrollHighlight.init(el);
        }).trigger('tb_scroll_highlight_enable');
        
        
})(jQuery,Themify, window, document);
