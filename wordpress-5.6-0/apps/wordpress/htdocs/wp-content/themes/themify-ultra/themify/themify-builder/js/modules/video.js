/**
 * video module
 */
;
(function(Themify){
	'use strict';
	const css_url=ThemifyBuilderModuleJs.cssUrl+'video_styles/',
		_click=function(e){
			e.preventDefault();
			e.stopPropagation();
			const wrap=this.closest('.module-video');
			wrap.setAttribute('data-auto',1);
			wrap.setAttribute('data-clicked',1);
			this.remove();

			Themify.trigger('tb_video_init',[[wrap]]);
		};
	Themify.on('tb_video_init',function(items){
		if(items instanceof jQuery){
			items=items.get();
		}
		for(let i=items.length-1; i> -1; --i){
			let item=items[i],
				url=item.getAttribute('data-url'),
				btn=item.getElementsByClassName('tb_video_overlay')[0];
			if(url){
				if(!Themify.cssLazy['tb_video_overlay'] && item.classList.contains('video-overlay')){
					Themify.cssLazy['tb_video_overlay']=true;
					Themify.LoadCss(css_url+'overlay.css');
				}
				if(btn){
					if(!Themify.cssLazy['tb_video_play_button']){
						Themify.cssLazy['tb_video_play_button']=true;
						Themify.LoadCss(css_url+'play_button.css');
					}
					btn.addEventListener('click',_click,{once:true});
				}else{
					let attr=Themify.parseVideo(url),
						wrap=item.getElementsByClassName('video-wrap')[0],
						iframe,
						autoplay=item.hasAttribute('data-auto'),
						muted=autoplay && !item.hasAttribute('data-clicked')?true:item.hasAttribute('data-muted');
					if(wrap.querySelector('iframe,video')===null){
						if(attr.type==='youtube' || attr.type==='vimeo'){
							let src='',
								allow='';
							iframe=document.createElement('iframe');
							if(attr.type==='youtube'){
								src='https://www.youtube.com/embed/'+attr.id+'?autohide=1&border=0&wmode=opaque&playsinline=1';
								let queryStr=url.split('?')[1];
								if(queryStr){
									let params=new URLSearchParams(queryStr),
										t=params.get('t'),
										list=params.get('list'),
										rel=params.get('rel');
									if(t){
										src+='&start='+t;
									}
									if(list){
										src+='&list='+list;
									}
									if(null!==rel){
										src+='&rel='+rel;
									}
								}
								allow='accelerometer;encrypted-media;gyroscope;picture-in-picture';
							}else{
								src='https://player.vimeo.com/video/'+attr.id+'?portrait=0&title=0&badge=0';
								allow='fullscreen';
							}
							if(muted){
								src+='&mute=1';
							}
							if(autoplay){
								allow+=';autoplay';
								src+='&autoplay=1';
							}
							iframe.setAttribute('allowfullscreen','');
							iframe.setAttribute('allow',allow);
							iframe.setAttribute('src',src);
						}else{
							iframe=document.createElement('video');
							iframe.src=url;
							iframe.controls=true;
							iframe.setAttribute('webkit-playsinline', 1);
							iframe.setAttribute('playsinline', true);
							if(autoplay){
								iframe.autoplay=true;
							}
							if(muted){
								iframe.muted=true;
							}
						}
						iframe.className='tf_abs tf_w tf_h';
						wrap.appendChild(iframe);
					}
				}
				item.classList.remove('tf_lazy');
			}
		}
	});

})(Themify);
