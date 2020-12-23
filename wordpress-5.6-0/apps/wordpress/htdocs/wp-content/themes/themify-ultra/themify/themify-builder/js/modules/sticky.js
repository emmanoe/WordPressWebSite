/**
 * sticky js
 */
;
(function ($,Themify,window,document) {
    'use strict';
	let isDisable=false;
    const slice = Array.prototype.slice, // save ref to original slice()
    splice = Array.prototype.splice, // save ref to original slice()
	tablet=tbLocalScript['is_sticky']==='m'?parseInt(tbLocalScript.breakpoints.tablet[1]):false,
    defaults = {
        topSpacing: 0,
        bottomSpacing: 0,
        className: 'is-sticky',
        wrapperClassName: 'sticky-wrapper',
        center: false,
        getWidthFrom: '',
        widthFromWrapper: true, // works only when .getWidthFrom is empty
        responsiveWidth: false
    },
    $window = $(window),
    $document = $(document);
    let sticked = [],
        unsticked = [],
    windowHeight = window.innerHeight,
    mutationObserver;
    const scroller = function () {
		if(isDisable===true){
			return;
		}
        const l=sticked.length;
        if(l===0){
           window.removeEventListener('scroll',scroller,{passive:true});
           if (window.MutationObserver && mutationObserver) {
                mutationObserver.disconnect();
           }
           sticked=[];
           return;
        }
        const scrollTop = $window.scrollTop(),
            documentHeight = $document.height(),
            dwh = documentHeight - windowHeight,
            extra = (scrollTop > dwh) ? dwh - scrollTop : 0;

            for (let i = 0;i < l; ++i) {
                let s = sticked[i],
                        elementTop = s.stickyWrapper.offset().top,
                        height = s.stickyElement.outerHeight(),
                        etse = elementTop - s.topSpacing - extra;

                //update height in case of dynamic content
                s.stickyWrapper.css('height', height);

                if (scrollTop <= etse) {
                    if (s.currentTop !== null) {
                        s.stickyElement
                                .css({
                                    'width': '',
                                    'position': '',
                                    'top': ''
                                }).parent().removeClass(s.className);
                        s.stickyElement.trigger('sticky-end', [s]);
                        s.currentTop = null;
                    }
                }
                else {
                    let newTop = documentHeight - height - s.topSpacing - s.bottomSpacing - scrollTop - extra;
                    if (newTop < 0) {
                        newTop = newTop + s.topSpacing;
                    } else {
                        newTop = s.topSpacing;
                    }
                    if (s.currentTop !== newTop) {
                        let newWidth=s.stickyElement.width();
                        if (s.getWidthFrom) {
                            let padding = s.stickyElement.innerWidth() - newWidth;
                            newWidth = ($(s.getWidthFrom).width() - padding) || newWidth;
                        } else if (s.widthFromWrapper) {
                            newWidth = s.stickyWrapper.width();
                        }
                        s.stickyElement.css({'width':newWidth,'position':'fixed','top':newTop}).parent().addClass(s.className);

                        if (s.currentTop === null) {
                            s.stickyElement.trigger('sticky-start', [s]);
                        } else {
                            // sticky is started but it have to be repositioned
                            s.stickyElement.trigger('sticky-update', [s]);
                        }

                        if (s.currentTop === s.topSpacing && s.currentTop > newTop || s.currentTop === null && newTop < s.topSpacing) {
                            // just reached bottom || just started to stick but bottom is already reached
                            s.stickyElement.trigger('sticky-bottom-reached', [s]);
                        } else if (s.currentTop !== null && newTop === s.topSpacing && s.currentTop < newTop) {
                            // sticky is started && sticked at topSpacing && overflowing from top just finished
                            s.stickyElement.trigger('sticky-bottom-unreached', [s]);
                        }

                        s.currentTop = newTop;
                    }

                    // Check if sticky has reached end of container and stop sticking
                    let stickyWrapperContainer = s.stickyWrapper.parent(),
                            top = s.stickyElement.offset().top,
                            unstick = (top + height >= stickyWrapperContainer.offset().top + stickyWrapperContainer.outerHeight()) && (top < s.topSpacing);

                    if (unstick) {
                        s.stickyElement.css({'position': 'absolute', top: '', bottom: 0});
                    } else {
                        s.stickyElement.css({'position': 'fixed', top: newTop, bottom: ''});
                    }
                }
            }
    },
    resizer = function (e) {
        const l = sticked.length;
		isDisable = !!(tablet && e && tablet>=e.w);
        if(l>0){
            if(e){
                windowHeight = e.h;
            }
            for (let i = l-1; i>-1; --i) {	
				let s = sticked[i],
					newWidth = null;
				if(isDisable===false){
					if (s.getWidthFrom && s.responsiveWidth) {
						newWidth = $(s.getWidthFrom).width();
					} else if (s.widthFromWrapper) {
						newWidth = s.stickyWrapper.width();
					}
					if (newWidth !== null) {
						s.stickyElement.css('width', newWidth);
					}
				}
				else{
					unsticked.push(s.stickyElement.get(0));
                    s.stickyElement.unstick();
				}
            }
        }
		else if(!isDisable && unsticked.length>0){
            init(unsticked);
            unsticked=[];
        }
    },
    methods = {
        init: function (options) {
            return this.each(function () {
                let o = $.extend({}, defaults, options),
                    wrapper = document.createElement('div');
                    wrapper.className=o.wrapperClassName;
					this.parentNode.insertBefore(wrapper, this);
					wrapper.appendChild(this);
				let stickyElement = $(this),
					stickyWrapper = stickyElement.parent();

                if (o.center) {
                    stickyWrapper.css({width:stickyElement.outerWidth(), marginLeft:'auto', marginRight:'auto'});
                }

                if (stickyElement.css('float') === 'right') {
                    stickyElement.css({'float':'none'}).parent().css({'float':'right'});
                }

                o.stickyElement = stickyElement;
                o.stickyWrapper = stickyWrapper;
                o.currentTop = null;

                sticked.push(o);

                methods.setWrapperHeight(this);
                methods.setupChangeListeners(this);
            });
        },
        setWrapperHeight: function (stickyElement) {
            const element = $(stickyElement),
                    stickyWrapper = element.parent();
            if (stickyWrapper) {
                stickyWrapper.css('height', element.outerHeight());
            }
        },
        setupChangeListeners: function (stickyElement) {
			mutationObserver = new window.MutationObserver(function (mutations) {
				if (mutations[0].addedNodes.length || mutations[0].removedNodes.length) {
					methods.setWrapperHeight(stickyElement);
				}
			});
			mutationObserver.observe(stickyElement, {subtree: true, childList: true});
        },
        update: scroller,
        unstick: function () {
            return this.each(function () {
                let that = this,
                        unstickyElement = $(that),
                        removeIdx = -1,
                        i = sticked.length;
                while (i-- > 0) {
                    if (sticked[i].stickyElement[0] === that) {
                        splice.call(sticked, i, 1);
                        removeIdx = i;
						break;
                    }
                }
                if (removeIdx !== -1) {
                    unstickyElement.unwrap()
                            .css({
                                'width': '',
                                'position': '',
                                'top': '',
                                'float': ''
                            });
                }
            });
        }
    };


    $.fn.sticky = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.sticky');
        }
    };

    $.fn.unstick = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.unstick.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.sticky');
        }
    };
	setTimeout(scroller, 0);
	window.addEventListener('scroll',scroller,{passive:true});
    
    const init = function(items){
           const body = document.body,
                wH=Themify.h,
                html = document.documentElement,
                documentHeight = Math.max(body.scrollHeight, body.offsetHeight,html.clientHeight, html.scrollHeight, html.offsetHeight);

            for(let i=items.length-1;i>-1;--i){
                $(items[i]).unstick();
                let $this=$(items[i]),
                    opts=$this.data('sticky-active'),
                    stickVal=opts.stick.value?parseInt(opts.stick.value):0,
                    topSpacing='px'===opts.stick.val_unit || !opts.stick.val_unit?stickVal:((stickVal/100)*wH),
                    stickArgs={topSpacing:topSpacing,zIndex:null,className:'tb_sticky_scroll_active'};

                if('bottom'===opts.stick.position){
                    stickArgs.topSpacing=wH-items[i].offsetHeight-topSpacing;
                }

                if(opts.unstick){
                    if(!opts.unstick.el_type || 'builder_end'===opts.unstick.el_type){
                        let $builder=$this.closest('.themify_builder_content'),
                            tmp=$builder.closest('#tbp_header');
                        if(tmp[0]){
                            tmp=document.getElementById('tbp_content');
                            tmp=tmp!==null?tmp.getElementsByClassName('themify_builder_content')[0]:body.getElementsByClassName('themify_builder_content')[1];
                            if(tmp){
                                $builder=$(tmp);
                            }
                        }
                        stickArgs.bottomSpacing=documentHeight-($builder.offset().top+$builder.outerHeight(true));
                    }else{
                        let targetEl='row'===opts.unstick.el_type?(opts.unstick.el_row_target?opts.unstick.el_row_target:'row'):(opts.unstick.el_mod_target?opts.unstick.el_mod_target:''),
                            $target=$('.tb_'+targetEl).first(),
                            unstickVal=opts.unstick.value?parseInt(opts.unstick.value):0,
                            targetTop;

                        if('%'===opts.unstick.val_unit){
                            unstickVal=((unstickVal/100)*wH);
                        }

                        if($target[0]){
                            targetTop=documentHeight-($target.offset().top+items[i].offsetHeight+topSpacing);
							let cur=opts.unstick.current || 'this',
								r=opts.unstick.rule || 'hits';
                            if('bottom'===cur){
                                if('hits'===r){
                                    targetTop+=wH-unstickVal;
                                }else{
                                    targetTop+=wH-($target.outerHeight(true)+unstickVal);
                                }
                            }else if('this'===cur){
                                targetTop=documentHeight-$target.offset().top;

                                if('passes'===r){
                                    targetTop-=items[i].offsetHeight;
                                }
                            }else{
                                if('hits'===r){
                                    targetTop+=unstickVal;
                                }else{
                                    targetTop-=unstickVal;
                                }
                            }
                            stickArgs.bottomSpacing=targetTop;
                        }
                    }
                }
                $this.sticky(stickArgs).sticky('update');
            }
    };
    Themify.on('tb_sticky_init',function(items){
        if(items instanceof jQuery){
            items = items.get();
        }
        init(items);
    })
    .on('tfsmartresize',resizer);

})(jQuery,Themify,window,document);
