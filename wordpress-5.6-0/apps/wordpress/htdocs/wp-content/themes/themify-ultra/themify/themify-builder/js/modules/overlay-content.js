/**
 * overlay content module
 */
;
(function(Themify){
	'use strict';
        let hasOverlay=null;
	const InitOverlay=function(el){
                el=el.getElementsByClassName('sidemenu')[0];
                if(el){
                    const id=el.id, 
                        item=document.querySelector('a[href="#'+id+'"]');
                    if(item){
                        Themify.sideMenu(item,{
                                panel:'#'+id,
                                close:'#'+id+'_close'
                        });
                        el.style.display='block';
                    }
                }
        },
        InitExpandable=function(el){
                el=el.getElementsByClassName('tb_ov_co_icon_wrapper')[0];
                if(el){
                    el.addEventListener('click',function(e){
                            e.preventDefault();
                            const container=this.closest('.module-overlay-content'),
                                    belowExpand=container.getElementsByClassName('tb_oc_expand_below')[0];
                            if(belowExpand){
                                belowExpand.style.minHeight=container.classList.contains('tb_oc_open')?0:belowExpand.scrollHeight+"px";
                            }
                            container.classList.toggle('tb_oc_open');
                    });
                }
        },
        init=function(items){
            for(let i=items.length-1; i>=0; --i){
                    if('overlay'===items[i].getAttribute('data-overlay')){
                        if(hasOverlay===null){
                            hasOverlay=true;
                        }
                        InitOverlay(items[i]);
                    }
                    else{
                        InitExpandable(items[i]);
                    }
            }
            if(true===hasOverlay){
                const bodyOverlay=document.getElementsByClassName('body-overlay')[0];
                hasOverlay=false;
                if(bodyOverlay){
                    const overlay=document.getElementsByClassName('tb_oc_overlay_layer')[0];
                    if(overlay){
                        const ev=Themify.isTouch?'touchend':'click';     
                        overlay.addEventListener(ev,function(){
                            bodyOverlay.click();
                        },{passive:true});
                    }
                }
            }
        };
	Themify.on('tb_overlay_content_init',function(items){
		if(items instanceof jQuery){
			items=items.get();
		}
		init(items);
	});
})(Themify);
