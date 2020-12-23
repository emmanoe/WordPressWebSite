/**
 * tabs module
 */
;
(function ($,Themify,document) {
    'use strict';
    let isAttached=false;
    const style_url=ThemifyBuilderModuleJs.cssUrl+'tab_styles/',
        init=function(){
            let listeners=$._data( Themify.body[0], 'events' );
			if(listeners && listeners['click']){
			    listeners=listeners['click'];
				for(let i=listeners.length-1;i>-1;--i){
					if(listeners[i].namespace==='tb_tabs'){
						return;
					}
				}
			}
           Themify.body.on('click.tb_tabs', '.tab-nav a,.tab-nav-current-active', function (e) {
               e.preventDefault();
               e.stopPropagation();
               if(this.classList.contains('tab-nav-current-active')){
                   const $this = $(this);
                       if ($this.hasClass('clicked')) {
                                       $this.removeClass('clicked');
                       } else {
                               const left = $this.position().left,
                                       w=$this.closest('.module-tab').width()/2,
                                       nav= $this.next('.tab-nav');
                                       if (left>0 && left <= w) {
                                                       nav.removeClass('right-align').addClass('center-align');
                                       } else if (left> w) {
                                                       nav.removeClass('center-align').addClass('right-align');
                                       } else {
                                                       nav.removeClass('center-align right-align');
                                       }
                                       $this.addClass('clicked');

                       }
               }
               else{
                   const  current=this.parentNode,
                           tabId=this.getAttribute('href').replace('#',''),
                           p = current.closest('.builder-tabs-wrap'),
                           li=p.getElementsByClassName('tab-nav')[0].getElementsByTagName('li'),
                           nav = p.getElementsByClassName('tab-nav-current-active')[0],
                           contents = p.getElementsByClassName('tab-content');
                   for(let i=li.length-1;i>-1;--i){
                           let expanded='false';
                           if(li[i]!==current){
                               li[i].classList.remove('current');
                           }
                           else{
                               li[i].classList.add('current');
                               expanded='true';
                           }
                           li[i].setAttribute('aria-expanded', expanded);
                   }
                   let cont=null;
                   for(let i=contents.length-1;i>-1;--i){
                           if(contents[i].parentNode===p){
                               let expanded='true';
                               if(contents[i].getAttribute('data-id')===tabId){
                                   cont=contents[i];
                                   expanded='false';
                               }
                               contents[i].setAttribute('aria-hidden', expanded);
                           }
                   }
                   nav.innerText=this.innerText;
                   nav.click();
                   Themify.trigger('tb_tabs_switch', [cont,this, tabId]);
               }
           });
           isAttached=true;
    };
    Themify.on('tfsmartresize',function(e){
        if(e){
          const items =document.querySelectorAll('.module-tab[data-tab-breakpoint]'),
                len=items.length;
            if (len> 0) {
                const w = e.w;
                for(let i=len-1;i>0;--i){
                    if (parseInt(items[i].getAttribute('data-tab-breakpoint')) >= w) {
                        Themify.LoadCss(style_url+'responsive.css',null,null,null,function(){
                            items[i].classList.add('responsive-tab-style');
                        });
                    } else {
                        items[i].classList.remove('responsive-tab-style');
                        let nav = items[i].getElementsByClassName('tab-nav');
                        for(let j=nav.length-1;j>-1;--j){
                            nav[j].classList.remove('right-align'); 
                            nav[j].classList.remove('center-align'); 
                        }
                    }
                }
            }
        }
    });
    Themify.on('tb_tab_init',function(items,isLazy){
        if(items instanceof jQuery){
            items=items.get();
        }
        for(let i=items.length-1;i>-1;--i){
             let tab =$(items[i].getElementsByClassName('tab-nav')[0]),
                height = tab.outerHeight();
            if (height > 200) {
                tab.siblings('.tab-content').css('min-height', height);
            }
            let cl=items[i].classList,
                    type='';
            if(!Themify.cssLazy['tb_tab_transparent'] && cl.contains('transparent')){
                    Themify.cssLazy['tb_tab_transparent']=true;
                    Themify.LoadCss(style_url+'transparent.css');
            }
            if(cl.contains('minimal')){
                type='minimal';
            }
            else if(cl.contains('panel')){
                type='panel';
            }
            else if(cl.contains('vertical')){
                type='vertical';
            }
            if(type!=='' && !Themify.cssLazy['tb_tab_'+type]){
                    Themify.cssLazy['tb_tab_'+type]=true;
                    Themify.LoadCss(style_url+type+'.css');
            }
        }
        if(isLazy!==true || isAttached===false){
            Themify.requestIdleCallback(init,50);
        }
    });
})(jQuery,Themify,document);
