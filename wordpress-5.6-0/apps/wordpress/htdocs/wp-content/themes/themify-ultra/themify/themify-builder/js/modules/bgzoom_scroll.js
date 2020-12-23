/**
 * backgroundZoomScrolling for row/column/subrow
 */
;
(function (Themify,document,window) {
    'use strict';
    let height = Themify.h,
        isInit=false,
        allItems=null;
    const scroll=function(){
        if(allItems===null){
            allItems=document.getElementsByClassName('builder-zoom-scrolling');
        }
        if(allItems[0]){
            doZoom(allItems);
        }
        else{
            window.removeEventListener('scroll', scroll,{passive:true,capture: true});
            Themify.off('tfsmartresize',resize);
            allItems=null;
            isInit=false;
        }
    },
    resize=function (e) {
        if(e){
            height=e.h;
        }
    },
    doZoom=function (items) {
        for(let i=items.length-1;i>-1;--i){
            let rect = items[i].getBoundingClientRect();
            if (rect.bottom >= 0 && rect.top <= height) {
                items[i].style['backgroundSize']= (140 - (rect.top + items[i].offsetHeight) / (height + items[i].offsetHeight) * 40) + '%';
            }
        }
    };
    Themify.LoadCss(tbLocalScript.css_module_url + 'bgzoom_scroll.css');
    
    Themify.on('tb_bgzoom_scroll_init',function(items){
        if(items instanceof jQuery){
            items=items.get();
        }
        doZoom(items);
        if(isInit===false){
            isInit=true;
            window.addEventListener('scroll', scroll,{passive:true,capture: true});
            Themify.on('tfsmartresize',resize);
        }
    });  

})(Themify,document,window);