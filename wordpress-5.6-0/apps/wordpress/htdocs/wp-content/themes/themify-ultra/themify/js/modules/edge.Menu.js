/**
 *Edge menu module
 */
;
(function ($, document,window) {
    let menu = document.getElementById('main-nav');
    const mouseEnter=function (e) {
            /* prevent "edge" classname being removed by mouseleave event when flipping through menu items really fast */
            const timeout= this.getAttribute('data-edge_menu_t');
            if(timeout){
                window.clearTimeout(timeout);
            }
            const elm = $('ul:first', this);

            if ((elm.offset().left+elm.width()) > Themify.w) {
                this.classList.add('edge');
            }
        },
        mouseLeave=function () {
                const t = setTimeout(function () {
                    this.classList.remove('edge');
                }.bind(this), 300);
                this.setAttribute('data-edge_menu_t', t);
        },
        apply=function(items){
            for(let i=items.length-1;i>-1;--i){
                if(items[i].getElementsByTagName('ul')[0]){
                    items[i].addEventListener('mouseenter',mouseEnter,{passive:true});
                    items[i].addEventListener('mouseleave',mouseLeave,{passive:true});
                    $(items[i]).on('dropdown_open',mouseEnter).on('dropdown_close',mouseLeave);
                }
            }
        };
    if(menu!==null){
        apply(menu.getElementsByTagName('li'));
    }
    menu=document.getElementById('footer-nav');
    if(menu!==null){
        apply(menu.getElementsByTagName('li'));
    }

})(jQuery,document, window);