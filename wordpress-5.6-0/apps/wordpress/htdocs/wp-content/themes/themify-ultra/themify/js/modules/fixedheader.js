/**
 * FixedHeader module
 */
;
(function (Themify,document) {
    'use strict';
	let stickyLogo=false;
    const addStickyImage=function(){
            if (!stickyLogo && typeof themifyScript!=='undefined' && themifyScript.sticky_header && themifyScript.sticky_header.src) {
				stickyLogo=true;
                const img = new Image();
				let logo = document.getElementById('site-logo');
				if(logo){
					const a=logo.getElementsByTagName('a')[0];
					if(a){
						logo=a;
					}
				}
				if(logo){
					img.src = themifyScript.sticky_header.src;
					img.className = 'tf_sticky_logo';
					if (themifyScript.sticky_header.imgwidth) {
						img.width = themifyScript.sticky_header.imgwidth;
					}
					if (themifyScript.sticky_header.imgheight) {
						img.height = themifyScript.sticky_header.imgheight;
					}
					if (Themify.hasDecode) {
						img.decode().then(function () {
							logo.prepend(img);
						});
					}
					else {
						logo.prepend(img);
					}
				}
            }
		},
		ThemifyFixedHeader = {
        active:false,
        isTransparent:false,
        headerWrap:null,
        type:'sticky',
        height:0,
        init(options) {
            if(typeof options!=='object'){
                options={};
            }
            this.headerWrap = !options['headerWrap']?document.getElementById('headerwrap'):options['headerWrap'];
            if (this.headerWrap === null || this.headerWrap.length === 0) {
                return;
            }

            if(options['hasHeaderRevealing'] || Themify.body[0].classList.contains('revealing-header')){
                this.headerRevealing(options['revealingInvert']);
            }
			if(!options['disableWatch']){
				const self = this,
				dummy=document.createElement('div');
				this.type=getComputedStyle(this.headerWrap).getPropertyValue('position');
                                if(!this.type){
                                    this.type='static';
                                }
				dummy.className='tf_hidden tf_w';
				dummy.style['height']='0';
				dummy.style['contain']='strict';
				this.isTransparent=options['isTransparent']?true:(this.type==='fixed' || Themify.body[0].classList.contains('transparent-header'));
				if(this.isTransparent){
					dummy.className+=' tf_rel';
					this.calculateTop(dummy);
				}
				this.headerWrap.after(dummy);
				
				(new IntersectionObserver((records, observer) => {
						const targetInfo = records[0].boundingClientRect,
							rootBoundsInfo = records[0].rootBounds;
						if(rootBoundsInfo){
							if (self.active===false && targetInfo.bottom < rootBoundsInfo.top) {
							  self.enable();
							}
							else if (self.active===true && targetInfo.bottom < rootBoundsInfo.bottom) {
							  self.disable();
							}
						}
						else{
							observer.disconnect();
						}
				},{
                                    threshold:[0,1]
				})).observe(dummy);
				
				if(this.type!=='sticky' && this.type!=='-webkit-sticky'){
					(new MutationObserver((mutations, observer) => {
						if(Themify.is_builder_active){
							observer.disconnect();
							return;
						}
						setTimeout(function(){
							self.calculateTop(dummy);
						},300);
					}))
					.observe(this.headerWrap, {
							subtree:true,
							childList:true, 
							characterData:true
					});
					Themify.on('tfsmartresize', function () {
						setTimeout(function () {
								self.calculateTop(dummy);
						}, 400);
					});
					window.addEventListener('scroll', function(){
						self.calculateTop(dummy);
					}, {passive:true,once:true});
				}
			}
            Themify.trigger('tf_fixed_header_ready',this.headerWrap);
        },
		setPadding(){
			if(this.active && this.height>0 && (this.type==='relative' || this.type==='static')){
                            this.headerWrap.parentNode.style['paddingTop']=this.height+'px';
			}
		},
        calculateTop(dummy){
			let headerWrap=this.headerWrap;
                        const calculate=this.active===true && (this.type==='relative' || this.type==='static');
			if(calculate){
				headerWrap=headerWrap.cloneNode(true);
				const header=headerWrap.querySelector('#header');
				headerWrap.classList.remove('fixed-header');
				headerWrap.classList.add('tf_hidden','tf_opacity');
				headerWrap.style['position']='fixed';
				headerWrap.style['top']='-1000%';
				if(!header.previousElementSibling){
					header.style['margin-top']=0;
				}
				if(!header.nextElementSibling){
					header.style['margin-bottom']=0;
				}
				this.headerWrap.parentNode.insertBefore(headerWrap,this.headerWrap);
			}
			const box=headerWrap.getBoundingClientRect();
			this.height=box.height;
			if(this.isTransparent){
				let bottom=box.bottom,
				wp_admin=document.getElementById('wpadminbar');
				if(wp_admin){
					bottom-=wp_admin.offsetHeight;
				}
				dummy.style['top']=bottom+'px';
			}
			Themify.trigger('tf_fixed_header_calculate',[this.headerWrap,this.height]);
			if(calculate){
				headerWrap.remove();
				this.setPadding();
			}
			
        },
        headerRevealing(invert) {
            let previousY = 0;
                const self = this,
                events = ['scroll'],
				bodyCl=Themify.body[0].classList,
                onScroll = function () {
                    if (self.active===false || previousY === this.scrollY) {
                        return;
                    }
                    const dir = invert?(previousY<this.scrollY):(previousY>=this.scrollY);
                    previousY = this.scrollY;
                    if (dir || 0 === previousY || bodyCl.contains('mobile-menu-visible') || bodyCl.contains('slide-cart-visible')) {
                        self.headerWrap.classList.remove('hidden');
                    } else if (0 < previousY && !self.headerWrap.classList.contains('hidden')) {
                        self.headerWrap.classList.add('hidden');
                    }
                };
            if (Themify.isTouch) {
                events.push('touchstart');
                events.push('touchmove');
            }
            for (let i = events.length - 1; i > -1; --i) {
                window.addEventListener(events[i], onScroll, {passive:true});
            }
            onScroll.call(window);
        },
        enable(){
            if(this.active===false){
                this.active=true;
				addStickyImage();
                Themify.body[0].classList.add('fixed-header-on');
                this.headerWrap.classList.add('fixed-header');
                this.setPadding();
            }
        },
        disable(){
            if(this.active===true){
				this.active=false;
				Themify.body[0].classList.remove('fixed-header-on');
				this.headerWrap.classList.remove('fixed-header');
				if(this.height>0 && (this.type==='relative' || this.type==='static')){
					this.headerWrap.parentNode.style['paddingTop']='';
				}
            }
        }
    };
	
    Themify.on('tf_fixed_header_init', function (options) {
        if(Themify.is_builder_active===false){
            ThemifyFixedHeader.init(options);
        }
    })
    .on('tf_fixed_header_enable',function(){
        if(Themify.is_builder_active===false){
            ThemifyFixedHeader.enable();
        }
    })
    .on('tf_fixed_header_disable',function(){
        ThemifyFixedHeader.disable();
    })
	.on('tf_fixed_header_remove_revelaing',function(){
		if ( ThemifyFixedHeader.headerWrap !== null ) {
			ThemifyFixedHeader.headerWrap.classList.remove('hidden');
		}
    });
	
})(Themify,document);
