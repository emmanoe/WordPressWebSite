/**
 *  parallaxScroll module
 */
;
(function (Themify,document,window) {
    'use strict';
	
	let isAdded = null,
        prevScroll=null,
        hasOpacity=null,
        hasNoOpacity=null,
		style=document.getElementById('tb_inline_styles'),
        positions=[],
        blurs=[],
        isInit=null;
        const done={'p':{},'b':{}},
        createCss=function(){
                const cssText=[];
                if(hasOpacity===true){
                        hasOpacity=false;
                        cssText.push('[data-lax-opacity].tf_lax_done{opacity:0}');
                }
                if(hasNoOpacity===true){
                        hasNoOpacity=false;
                        cssText.push('[data-lax-no-op].tf_lax_done{opacity:1!important}');
                }
                for (let i = positions.length - 1; i > -1; --i) {
                    if(!done['p'][positions[i]]){
                        done['p'][positions[i]]=true;
                        cssText.push('[data-box-position="'+positions[i]+'"].tf_lax_done{transform-origin:'+positions[i]+'}');
                    }
                }
                positions=[];
                for (let i = blurs.length - 1; i > -1; --i) {
                    if(!done['b'][blurs[i]]){
                        done['b'][blurs[i]]=true;
                        cssText.push('[data-lax-b="'+blurs[i]+'"].tf_lax_done{filter:blur('+blurs[i]+'px)}');
                    }
                }
                blurs=[];
                if(cssText.length>0){
                    style.textContent+=cssText.join('');
                }
        },
        _init = function (items) {
            const inner_h = Themify.h,
                values=[];
            let top = document.body.getBoundingClientRect().top;
            for (let i = items.length - 1; i > -1; --i) {
                    let item = items[i];
                    if(!item.hasAttribute('data-lax')){
                            continue;
                    }
                    item.removeAttribute('data-lax');
					let wrap=item.cloneNode(false),
						zIndex=wrap.style['zIndex'];
					wrap.className='tf_lax_done tf_rel';
					wrap.removeAttribute('style');
					if(zIndex){
						wrap.style['zIndex']=zIndex;
					}
                    if (wrap.hasAttribute('data-box-position')) {
                        let pos=wrap.getAttribute('data-box-position');
                        if(pos.indexOf('%') !== -1){
                            wrap.style.transformOrigin = pos;
                        }
                        else{
                            positions.push(pos);
                        }
						item.removeAttribute('data-box-position');
                    }
                    if (wrap.hasAttribute('data-lax-b')) {
                        blurs.push(wrap.getAttribute('data-lax-b'));
						item.removeAttribute('data-lax-b');
                    }
                    if (wrap.hasAttribute('data-lax-scale')) {
                            let entryContent = item.closest('.entry-content');
                            if (entryContent !== null) {
                                    entryContent.classList.add('themify-no-overflow-x');
                            }
                            if (isAdded === null) {
                                    Themify.body[0].classList.add('themify-no-overflow-x');
                                    top = document.body.getBoundingClientRect().top;
                                    isAdded = true;
                            }
                    }
					if(wrap.hasAttribute('data-lax-no-op')){
						item.removeAttribute('data-lax-b');
						if(hasNoOpacity===null){
							hasNoOpacity=true;
						}
					}
					item.removeAttribute('data-lax-opacity');
                    // item.style.animationFillMode = 'none';
                    let elTop = item.getBoundingClientRect().top - top;
                    if ((elTop + 130) < inner_h) {
                            elTop = elTop < 0 ? inner_h : Math.floor(elTop);
							
							item.removeAttribute('data-lax-anchor');
							wrap.removeAttribute('data-lax-anchor');
                            // Vertical
                            if (wrap.hasAttribute('data-lax-translate-y')) {
                                    let t_y = wrap.getAttribute('data-lax-translate-y').split(','),
                                                    t_y_start = t_y[0].split(' '),
                                                    t_y_end = t_y[1].split(' ');
                                    wrap.setAttribute('data-lax-translate-y', t_y_end[0] + ' ' + t_y_start[1] + ',' + elTop + ' ' + t_y_end[1]);
                            }
                            // Horizontal
                            if (wrap.hasAttribute('data-lax-translate-x')) {
                                    let t_x = wrap.getAttribute('data-lax-translate-x').split(','),
                                                    t_x_start = t_x[0].split(' '),
                                                    t_x_end = t_x[1].split(' ');
                                    wrap.setAttribute('data-lax-translate-x', t_x_end[0] + ' ' + t_x_start[1] + ',' + elTop + ' ' + t_x_end[1]);
                            }
                            // Opacity
                            if (wrap.hasAttribute('data-lax-opacity')) {
                                    if(hasOpacity===null){
                                            hasOpacity=true;
                                    }
                                    let t_o = wrap.getAttribute('data-lax-opacity').split(','),
                                                    t_o_start = t_o[0].split(' '),
                                                    t_o_end = t_o[1].split(' ');
                                    wrap.setAttribute('data-lax-opacity', t_o_end[0] + ' ' + t_o_start[1] + ',' + elTop + ' ' + t_o_end[1]);
                            }
                            // Blur
                            if (wrap.hasAttribute('data-lax-blur')) {
                                    let t_b = wrap.getAttribute('data-lax-blur').split(','),
                                                    t_b_start = t_b[0].split(' '),
                                                    t_b_end = t_b[1].split(' ');
                                    wrap.setAttribute('data-lax-blur', t_b_end[0] + ' ' + t_b_start[1] + ',' + elTop + ' ' + t_b_end[1]);
                            }
                            // Rotate
                            if (wrap.hasAttribute('data-lax-rotate')) {
                                    let t_r = wrap.getAttribute('data-lax-rotate').split(','),
                                                    t_r_start = t_r[0].split(' '),
                                                    t_r_end = t_r[1].split(' ');
                                    wrap.setAttribute('data-lax-rotate', t_r_end[0] + ' ' + t_r_start[1] + ',' + elTop + ' ' + t_r_end[1]);
                            }
                            // Scale
                            if (wrap.hasAttribute('data-lax-scale')) {
                                    let t_s = wrap.getAttribute('data-lax-scale').split(','),
                                                    t_s_start = t_s[0].split(' '),
                                                    t_s_end = t_s[1].split(' ');
                                    wrap.setAttribute('data-lax-scale', t_s_end[0] + ' ' + t_s_start[1] + ',' + elTop + ' ' + t_s_end[1]);
                            }
                    }
					item.parentNode.insertBefore(wrap, item);
					wrap.appendChild(item);
					values.push(wrap);
            }
            createCss();
			for (let i = values.length - 1; i > -1; --i) {
				window['lax'].addElement(values[i]);
			}
            if(isInit===null){
				isInit=true;
				const update = function () {
						let top=window.scrollY;
						if(prevScroll!==top){
								prevScroll=top;
								window['lax'].update(top);
						}
						
					window.requestAnimationFrame(update);
				},
				onceScroll=function(){
					window.requestAnimationFrame(update);
				};
				window.addEventListener('scroll',onceScroll,{once:true,passive:true});
				Themify.on('tfsmartresize', function () {
					window['lax'].updateElements();
				});
            }
            
            };
	if(!style){
		style=document.createElement('style');
		style.id='tb_inline_styles';
		document.head.appendChild(style);
	}
    style.textContent+='.themify-no-overflow-x{overflow-x:hidden}';
    Themify.on('tf_lax_init',function(items){
        if (!window['lax']) {
            Themify.LoadAsync(Themify.jsUrl + 'themify.lax.min.js', function(){
                _init(items);
            }, '1.0', null, function () {
                return !!window['lax'];
            });
        } else {
            _init(items);
        }
    });

})(Themify,document,window);