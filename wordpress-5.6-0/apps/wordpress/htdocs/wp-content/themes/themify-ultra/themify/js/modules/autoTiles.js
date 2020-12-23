/**
 * autoTiles module
 */
;
(function ($,Themify,window) {
    'use strict';
    Themify.on('tf_autotiles_init',function(items,callback){
        if(items instanceof jQuery){
                items=items.get();
        }
        const reCalculate=function(children,smaller){
            let count=0;
            for(let j=children.length;j>-1;--j){
                if(children[j] && (children[j].classList.contains('post') || children[j].classList.contains('product'))){
                    ++count;
                    let $ch=$(children[j]),
                            w=$ch.outerWidth(),
                            h=$ch.outerHeight();
                            if((w-10)<=smaller){
                                if(w===h || (w>h && (w-h)<10) || (h>w && (h-w)<10)){
                                    children[j].classList.add('tiled-square-small');
                                }
                                else{
                                    children[j].classList.add('tiled-portrait');
                                }
                            }
                            else{
                                if(w>h){
                                    children[j].classList.add('tiled-landscape');
                                }
                                else{
                                    children[j].classList.add('tiled-square-large');
                                }
                            }
                    }
            }
            return count;
        },
        _init = function (items,callback) {
            for (let i = 0, len = items.length; i < len; ++i) {
                if(null !== items[i].querySelector('.ptb_loops_wrapper')){
                    items[i].classList.remove('auto_tiles','tf_lazy');
                    continue;
                }
                let children = items[i].children,
                        length=children.length;
                if(!items[i].classList.contains('tf_tiles_more')){
                    if(length===5 || length===6){
                        items[i].classList.add('tf_tiles_'+length);
                    }
                    else{
                        items[i].classList.add('tf_tiles_more');
                    }
                }
                let count=reCalculate(children,parseInt(window.getComputedStyle(items[i]).getPropertyValue('grid-auto-rows')));
                if(count>0){
                    if(length!==count){
                        let cl=items[i].classList;
                        if(!cl.contains('tf_tiles_more') || count<6){
                                for(var j=cl.length-1;j>-1;--j){
                                    if(cl[j].indexOf('tf_tiles_')===0){
                                        cl.remove(cl[j]);
                                    }
                                }
                                if(count===5 || count===6){
                                    cl.remove('tb_tiles_more');
                                    cl.add('tf_tiles_'+count);
                                }
                                else{
                                    cl.add('tf_tiles_more');
                                }
                        }
                        reCalculate();
                    }
                    if (items[i].previousElementSibling !== null && items[i].previousElementSibling.classList.contains('post-filter')) {
                            Themify.trigger('themify_isotop_filter',items[i].previousElementSibling);
                    }
                    items[i].classList.add('tf_auto_tiles_init');
                    if ( callback) {
                        callback(items[i]);
                    }
					items[i].classList.remove('tf_lazy');
                }
            }
        };
        if(!Themify.cssLazy['tf_grid_auto_tiles']){
            for (let i =items.length-1;i>-1;--i) {
                items[i].classList.add('tf_lazy');
            }
            Themify.LoadCss(Themify.url + '/css/grids/auto_tiles.css', null, null, null, function(){
                Themify.cssLazy['tf_grid_auto_tiles'] = true;
                _init(items, callback);
            });
        }
        else{
            _init(items,callback);
        }
    });

})(jQuery,Themify,window);
