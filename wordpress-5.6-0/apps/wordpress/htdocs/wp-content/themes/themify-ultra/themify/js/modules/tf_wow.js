/**
 * wow module
 */
;
(function (Themify) {
    'use strict';
    let is_working=false;
        const TF_Wow = {
            stop:null,
            observer: null,
            options:null,
            init(items,options) {
                if (items instanceof jQuery) {
                    items = items.get();
                }
                this.options=options;
                const self = this;
                if (this.observer === null) {
                    this.observer = new window['IntersectionObserver'](function (entries, _self) {
                        if(self.stop===null){
                            for (let i = entries.length - 1; i > -1; --i) {
                                if (entries[i].isIntersecting === true) {
                                    _self.unobserve(entries[i].target);
                                    self.animate(entries[i].target);
                                }
                            }
                        }
                    }, {
                        threshold: .1
                    });

                }	
                for (let i = items.length - 1; i > -1; --i) {
                    this.observer.observe(items[i]);
                }
            },
            animate(el) {
                const self=this;
                Themify.imagesLoad(el, function (instance) {
                    const item =instance.elements[0];
                    item.style['visibility'] = 'visible';
                    if (item.hasAttribute('data-tf-animation')) {
                            if (item.hasAttribute('data-tf-animation_repeat')) {
                                    item.style['animationIterationCount'] = item.getAttribute('data-tf-animation_repeat');
                            }
                            if (item.hasAttribute('data-tf-animation_delay')) {
                                    item.style['animationDelay'] = item.getAttribute('data-tf-animation_delay') + 's';
                            }
							const cl=item.getAttribute('data-tf-animation');
							item.classList.add(cl);
                            item.style['animationName'] = cl;
                            item.addEventListener('animationend', function () {
								this.style['animationIterationCount']=this.style['animationDelay']='';
								this.classList.remove('animated',cl);
								this.removeAttribute('data-tf-animation');
                            }, {passive: true, once: true});
                            if(self.options && self.options['timer']){
                                setTimeout(function(){
                                        item.classList.add('animated');
                                },self.options['timer']);
                            }
                            else{
                                    item.classList.add('animated');
                            }
                    }
                    if (item.classList.contains('hover-wow')) {
						TF_Wow.hover(item);
                    }
                });
            },
            hover(el) {
                const ev=Themify.isTouch?'touchstart':'mouseenter',
				events = [ev,'tf_custom_animate'];
                for (let i = events.length - 1; i > -1; --i) {
                    el.removeEventListener(events[i], this.hoverCallback, {passive: true});
                    el.addEventListener(events[i], this.hoverCallback, {passive: true});
                }
            },
            hoverCallback() {
                if (is_working === false) {
                    is_working = true;
                    const animation = this.style['animationName'],
						hover=this.getAttribute('data-tf-animation_hover');
                    if (animation) {
                        this.style['animationIterationCount']=this.style['animationDelay']=this.style['animationName'] = '';
                        this.classList.remove(animation);
                    }
                    this.addEventListener('animationend',function(e){
						this.classList.remove('animated','tb_hover_animate',e.animationName);
						this.style['animationName'] = '';
						is_working = false;
					},{passive:true,once:true});
					this.style['animationName'] = hover;
                    this.classList.add('animated','tb_hover_animate',hover);
                }
            }
        };
    Themify.on('tf_wow_init', function ( items, options) {
        if (!Themify.cssLazy['animate']) {
            Themify.loadAnimateCss(function () {
                TF_Wow.init(items, options);
            });
        }
        else {
            TF_Wow.init(items, options);
        }
    });

})(Themify);