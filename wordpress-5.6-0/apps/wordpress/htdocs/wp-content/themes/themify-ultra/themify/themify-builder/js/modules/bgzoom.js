/**
 * backgroundZooming for row/column/subrow
 */
;
(function (Themify,document,window) {
    'use strict';
    let clientHeight = document.documentElement.clientHeight,
        bclientHeight = document.body.clientHeight,
        isInit=false,
        allItems=null,
        height = Themify.h;
    const zoomingClass = 'active-zooming',
        isZoomingElementInViewport = function (item) {
            const rect = item.getBoundingClientRect();
            return (
                    rect.top + item.clientHeight >= (height || clientHeight || bclientHeight) / 2 &&
                    rect.bottom - item.clientHeight <= (height || clientHeight || bclientHeight) / 3
                );
        },
        resize=function (e) {
            if(e){
                clientHeight = document.documentElement.clientHeight;
                bclientHeight = document.body.clientHeight;
                height=e.h;
            }
        },
        scroll=function(){
            if(allItems===null){
                allItems=document.getElementsByClassName('builder-zooming');
            }
            if(allItems[0]){
                doZooming(allItems);
            }
            else{
                window.removeEventListener('scroll', scroll,{passive:true,capture: true});
                Themify.off('tfsmartresize',resize);
                allItems=null;
                isInit=false;
            }
        },
        doZooming=function (items) {
            for(let i=items.length-1;i>-1;--i){
                if (items[i] && !items[i].classList.contains(zoomingClass)&& isZoomingElementInViewport(items[i])) {
                    items[i].classList.add(zoomingClass);
                }
            }
        };
        Themify.LoadCss(ThemifyBuilderModuleJs.cssUrl + 'bgzoom.css');
        Themify.on('tb_bgzoom_init',function(items){
            if(items instanceof jQuery){
                items=items.get();
            }
            doZooming(items);
            if(isInit===false){
                isInit=true;
                window.addEventListener('scroll', scroll,{passive:true,capture: true});
                Themify.on('tfsmartresize',resize);
            }
        });

})(Themify,document,window);