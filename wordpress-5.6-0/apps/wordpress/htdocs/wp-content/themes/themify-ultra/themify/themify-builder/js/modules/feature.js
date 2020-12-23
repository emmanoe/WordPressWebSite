/**
 * feature module
 */
;
(function (Themify) {
    'use strict';
    const style_url=ThemifyBuilderModuleJs.cssUrl+'feature_styles/',
        sizes={'small':100,'medium':150,large:200},
        init =function (item) {
            const p=item.closest('.module-feature');
            if(p){
                const cl = p.classList;
                if(!Themify.cssLazy['tb_feature_left'] && cl.contains('layout-icon-left')){
                    Themify.cssLazy['tb_feature_left']=true;
                    Themify.LoadCss(style_url+'left.css');
                }
                else if(!Themify.cssLazy['tb_feature_right'] && cl.contains('layout-icon-right')){
                    Themify.cssLazy['tb_feature_right']=true;
                    Themify.LoadCss(style_url+'right.css');
                }
                const svgItem=item.getElementsByClassName('tb_feature_stroke')[0],
                    progress = svgItem?svgItem.getAttribute('data-progress'):null;
                if(progress){
                    if(!Themify.cssLazy['tb_feature_overlay'] && cl.contains('with-overlay-image')){
                        Themify.cssLazy['tb_feature_overlay']=true;
                        Themify.LoadCss(style_url+'overlay.css');
                    }
                    let w=0;
					if(!cl.contains('size-custom')){
						for(let i in sizes){
							if(cl.contains('size-'+i)){
								w=sizes[i];
								break;
							}
						}
					}
					else{
						w=parseInt(item.style['width']) || 0;
					}
                    if(w===0){
                        w=item.offsetWidth;
                    }
                    w=parseFloat(w/2)-parseFloat(svgItem.getAttribute('stroke-width')/2);
                    svgItem.setAttribute('stroke-dasharray', (parseFloat((2*Math.PI*w*progress)/100)+',10000'));
                }
            }
        },
        observer=new IntersectionObserver(function (entries, _self){
            for (let i = entries.length - 1; i>-1; --i){
                if (entries[i].isIntersecting=== true){
                    _self.unobserve(entries[i].target);
                    init(entries[i].target);
                }
            }
        },{
            threshold:.9
        });
    Themify.on('tb_feature_init',function(items){
        if(items instanceof jQuery){
            items=items.get();
        }
        else if(items.length===undefined){
                items=[items];
        }
        for(let i=items.length-1;i>-1;--i){
            let item=items[i].getElementsByClassName('module-feature-chart-html5')[0];
            if(item){
                observer.observe(item);
            }
        }
    });
})(Themify);
