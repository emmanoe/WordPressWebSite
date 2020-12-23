/**
 * Video player module
 */
;
(function (Themify,document) {
    'use strict';
	let isdone=null;
    const _click=Themify.isTouch?'touchstart':'click',
		IS_IOS=!!navigator.userAgent.match(/iPhone|iPad|iPod/i),
		humanTime=function(time){
			time=Infinity===time?0:time;
    		const tmp = new Date(time*1000).toISOString().substr(11, 8).split(':');
			if(tmp[0]==='00'){
				tmp.splice(0,1);
			}
			return tmp.join(':');
		},
		requestFullscreen=function(el){
			if(el.requestFullscreen) {
				return el.requestFullscreen();
			}
			if(el.webkitEnterFullscreen){
				  return el.webkitEnterFullscreen();
			}
			if(el.webkitrequestFullscreen) {
				return el.webkitRequestFullscreen();
			} 
			if(el.mozRequestFullscreen) {
				return el.mozRequestFullScreen();
			}
		},
		getPrefix=function(el){;
			if (document.exitFullscreen) {
				return '';
			} 
			if (document.webkitExitFullscreen || el.webkitSupportsFullscreen) {
				return 'webkit';
			} 
			if (document.mozCancelFullScreen) {
				return 'moz';
			} 
			if (document.msExitFullscreen) {
				return 'ms';
			}
			return false;
		},
		getFullScreenElement=function(el){
			const pre=getPrefix(el);
			if(pre===false){
				return false;
			}
			if(el.hasOwnProperty('webkitDisplayingFullscreen')){
				return el.webkitDisplayingFullscreen;
			}
			return pre===''?document.fullscreenElement:document[pre+'FullscreenElement'];
		},
		createSvg=function(icon){
			const ns='http://www.w3.org/2000/svg',
				use=document.createElementNS(ns,'use'),
				svg=document.createElementNS(ns,'svg');
			icon='tf-'+icon;
			svg.setAttribute('class','tf_fa '+icon);
			use.setAttributeNS(null, 'href','#'+icon);
			svg.appendChild(use);
			return svg;
		},
		exitFullscreen=function(){
			if (document.exitFullscreen) {
				return document.exitFullscreen();
			} 
			if (document.webkitExitFullscreen) {
				return document.webkitExitFullscreen();
			} 
			if (document.webkitExitFullscreen) {
				return document.webkitExitFullscreen();
			} 
			if (document.mozCancelFullScreen) {
				return document.mozCancelFullScreen();
			} 
			if (document.msExitFullscreen) {
				return document.msExitFullscreen();
			}
		},
		loadMetaData=function(el,opt){
			const fr=document.createDocumentFragment(),
			pre=getPrefix(el),
				parentNode=el.parentNode, 
				container = document.createElement('div'),
				wrap = document.createElement('div'),
				loader=document.createElement('div'),
				progressWrap=document.createElement('div'),
				progressLoaded=document.createElement('div'),
				progressCurrent=document.createElement('div'),
				hoverHandler=document.createElement('div'),
				range=document.createElement('input'),
				volumeRange=document.createElement('input'),
				volumeWrap=document.createElement('div'),
				volumeInner=document.createElement('div'),
				controls=document.createElement('div'),
				mute=document.createElement('button'),
				bigPlay=document.createElement('button'),
				play=document.createElement('button'),
				currentTime = document.createElement('div'),
				trackWrap=parentNode.closest('.track'),
				totalTime=document.createElement('div'),
				fullscreen=document.createElement('button'),
				seekLeft=document.createElement('button'),
				seekRight=document.createElement('button'),
				isPlayList=opt && opt['tracks'];
				let paused=true,//For error play-request-was-interrupted
					sliding=false,
					firstPlay=false,
					timeout=null;
				loader.className='tf_loader';
				container.className='tf_video_container tf_w tf_rel tf_box';
				wrap.className='tf_video_wrap tf_w tf_box';
				controls.className='tf_video_controls';
				progressWrap.className='tf_video_progress_wrap tf_rel tf_textl';
				progressLoaded.className='tf_video_progress_loaded tf_w tf_h tf_abs';
				progressCurrent.className='tf_video_progress_current tf_w tf_h tf_abs';
				range.className='tf_video_progress_range tf_w tf_h tf_abs';
				volumeRange.min=range.min=0;
				volumeRange.max=range.max=100;
				volumeRange.type=range.type='range';
				range.value=0;
				volumeRange.value=50;
				volumeWrap.className='tf_video_volumn_wrap tf_rel';
				volumeInner.className='tf_video_volumn_inner';
				volumeRange.className='tf_video_volumn_range';
				mute.className='tf_video_mute tf_rel tf_overflow';
				play.className='tf_video_play';
				bigPlay.className='tf_video_play tf_big_video_play';
				parentNode.tabIndex=0;
				if(el.muted){
					mute.className+=' tf_muted';
				}
				seekLeft.className='tf_video_seek tf_video_seek_left tf_abs';
				seekRight.className='tf_video_seek tf_video_seek_right tf_abs';
				currentTime.className='tf_video_current_time';
				totalTime.className='tf_video_total_time';
				hoverHandler.className='tf_video_hover tf_abs tf_hide tf_box tf_textc';
				fullscreen.className='tf_video_fullscreen';
				currentTime.textContent=humanTime(el.currentTime); 
				totalTime.textContent=humanTime(el.duration); 
				
				const waitingEvent=function(e){
					parentNode.classList.add('tf_video_waiting');
					const ev=e.type==='seeking'?'seeked':'playing';
					this.addEventListener(ev, function(){
						parentNode.classList.remove('tf_video_waiting');
					},{passive:true,once:true});
				},
				setinteraction=function(){
					parentNode.classList.add('tf_video_touch');
					parentNode.classList.remove('tf_hide_controls');
					if(timeout){
						clearTimeout(timeout);
					}
					timeout=setTimeout(function(){
						parentNode.classList.remove('tf_video_touch');
					},2500);
				},
				playVideo=function(){
					if(firstPlay===false && Themify.device!=='desktop'){
						firstPlay=true;
						el.muted=true;
					}
					el.play();
				};
				
				wrap.addEventListener(_click,function(e){
					e.stopPropagation();
				},{passive:true});
				parentNode.addEventListener(_click,function(e){
					const _this=e.target.closest('.tf_video_seek');
					e.stopImmediatePropagation();
					if(el.paused || e.type==='click' || (!_this && this.classList.contains('tf_video_touch'))){
						this.classList.remove('tf_video_touch');
						if(el.paused){
							playVideo();
						}
						else{
							el.pause();
						}
					}
					else{
						setinteraction();
						if(_this){
							el.currentTime+=_this.classList.contains('tf_video_seek_left')?-10:10;
						}
					}
				},{passive:true});
				play.addEventListener(_click,function(e){
					if(el.paused){
						playVideo();
					}
					else{
						el.pause();
					}
				},{passive:true});
				
				mute.addEventListener(_click,function(e){
					el.muted  =!el.muted;
					if(!el.muted && el.volume===0){
						volumeRange.value=50;
						Themify.triggerEvent(volumeRange,'input');
					}
				},{passive:true});
				
				
				if(!Themify.isTouch){
					progressWrap.addEventListener('mouseenter',function(e){
						if(!isNaN(el.duration)){
							hoverHandler.classList.remove('tf_hide');
							const w =this.clientWidth,
							hoverW=parseFloat(hoverHandler.clientWidth/2),
							duration=el.duration,
							move=function(e){
								const X=e.layerX!==undefined?e.layerX:e.offsetX;
								if((X-hoverW)>0 && X<=w){
									hoverHandler.style['transform']='translateX('+(X-hoverW)+'px)';
									if(sliding===false){
										hoverHandler.textContent=humanTime(parseFloat((X/w))*duration);
									}
								}
							};
							this.addEventListener('mouseleave',function(){
								hoverHandler.classList.add('tf_hide');
								this.removeEventListener('mousemove',move,{passive:true});
							},{passive:true,once:true});
							this.addEventListener('mousemove',move,{passive:true});
						}
					},{passive:true});
					
				}
				range.addEventListener('input',function(e){
					e.preventDefault();
					if(!isNaN(el.duration)){
						if(!el.paused && paused===true){
							el.pause();
						}
						sliding=true;
						const v=parseInt(this.value),
						t=v===100?(el.duration-1):parseFloat((v*el.duration)/100).toFixed(4);
						el.currentTime=t;
						if(!Themify.isTouch){
							hoverHandler.textContent=humanTime(t);
						}
					}
				});
				
				range.addEventListener('change',function(e){
					e.preventDefault();
					if(!isNaN(el.duration)){
						sliding=paused=false;
						if(el.paused){
							el.play().then(_ => {
								paused=true;
							}).catch(er => {
								 paused=true;
							});
						}
					}
				});
				
				el.addEventListener('progress', function() {
					if (this.buffered.length > 0) {
						progressLoaded.style['transform']='scaleX('+parseFloat((this.buffered.end(0))/this.duration).toFixed(4)+')';
					}
				},{passive:true});
				
				el.addEventListener('durationchange',function() {
					totalTime.textContent=humanTime(this.duration); 
				},{passive:true});
				
				
				el.addEventListener('seeking',waitingEvent,{passive:true});
				el.addEventListener('waiting',waitingEvent,{passive:true});
				el.addEventListener('emptied',waitingEvent,{passive:true});
				
				el.addEventListener('pause',function(){
					parentNode.classList.remove('tf_video_is_playing');
				},{passive:true});
				
				el.addEventListener('play',function(){
					parentNode.classList.add('tf_video_is_playing');
					const allAudios = document.getElementsByTagName('video');
					for(let i=allAudios.length-1;i>-1;--i){
						if(allAudios[i]!==this){
							allAudios[i].pause();
						}
					}
				},{passive:true});
				
				el.addEventListener('timeupdate',function(){
					if(!isNaN(this.duration)){
						currentTime.textContent=humanTime(this.currentTime); 
						const v=parseFloat(this.currentTime/el.duration);
						progressCurrent.style['transform']='scaleX('+v.toFixed(4)+')';
						if(sliding===false){
							range.value=parseInt(v*100);
						}
					}
				},{passive:true});
				
				if(!IS_IOS){
					volumeRange.addEventListener('input',function(e){
						e.preventDefault();
						const v=parseFloat(this.value/100).toFixed(3);
						el.volume=v;
						el.muted=v>0?false:true;
					});
				}
				el.addEventListener('volumechange',function(){
					if(this.muted===true || this.volume===0){
						mute.classList.add('tf_muted');
					}
					else{
						mute.classList.remove('tf_muted');
					}
				},{passive:true});
				if(pre!==false){
					let isAdd=false,
						timeout2=false;
					const mouseMove=function(){
						toggleControls(true);
						checkState();
					},
					toggleControls=function(isMoved){
						if(isAdd===true || isMoved===true){
							isAdd=false;
							parentNode.classList.remove('tf_hide_controls');
							
						}
						else{
							isAdd=true;
							parentNode.classList.add('tf_hide_controls');
						}
					},
					checkState=function(){
						if(timeout2){
							clearTimeout(timeout2);
						}
						timeout2=setTimeout(toggleControls,3000);
					},
					showFullscreen=function(e){
						e.preventDefault();
						if(getFullScreenElement(el)){
							exitFullscreen(el);
						}
						else{
							const promise=requestFullscreen(parentNode);
							if(!promise){
								requestFullscreen(el);
							}
							else if(typeof promise.then==='function'){
								promise.catch(err=>{requestFullscreen(el);});
							}
						}
					};
					fullscreen.addEventListener(_click,showFullscreen);
					if(!Themify.isTouch){
						parentNode.addEventListener('dblclick',showFullscreen);
					}
					parentNode.addEventListener(pre+'fullscreenchange',function(e){
						if(!getFullScreenElement(el)){
							parentNode.classList.remove('tf_is_fullscreen','tf_hide_controls');
							if(timeout2){
								clearTimeout(timeout2);
							}
							el.removeEventListener('pause',mouseMove,{passive:true});
							parentNode.removeEventListener('mousemove',mouseMove,{passive:true});
						}
						else{
							parentNode.classList.add('tf_is_fullscreen');
							parentNode.addEventListener('mousemove',mouseMove,{passive:true});
							el.addEventListener('pause',mouseMove,{passive:true});
							checkState();
						}
					},{passive:true});
				}
				else{
					fullscreen.className+=' tf_fullscreen_disabled tf_play_disabled';
				}
				progressWrap.appendChild(progressLoaded);
				progressWrap.appendChild(range);
				progressWrap.appendChild(progressCurrent);
				progressWrap.appendChild(hoverHandler);
				mute.appendChild(createSvg('fas-volume-up'));
				mute.appendChild(createSvg('fas-volume-mute'));
				volumeWrap.appendChild(mute);
				if(!IS_IOS){
					volumeInner.appendChild(volumeRange);
					volumeWrap.appendChild(volumeInner);
				}
				wrap.appendChild(controls);
				wrap.appendChild(currentTime);
				wrap.appendChild(progressWrap);
				wrap.appendChild(totalTime);
				wrap.appendChild(volumeWrap);
				fullscreen.appendChild(createSvg('ti-fullscreen'));
				wrap.appendChild(fullscreen);
				controls.appendChild(play);
				seekRight.innerHTML=seekLeft.innerHTML='<span>10</span>';
				seekRight.appendChild(createSvg('fas-redo-alt'));
				seekLeft.appendChild(createSvg('fas-undo-alt'));
				fr.appendChild(seekLeft);
				fr.appendChild(seekRight);
				fr.appendChild(wrap);
				fr.appendChild(bigPlay);
				fr.appendChild(loader);
				parentNode.appendChild(fr);
				el.setAttribute('webkit-playsinline','1');
				el.setAttribute('playsinline','1');
				el.removeAttribute('controls');
				parentNode.classList.remove('tf_lazy');
				if(isdone===null){
					isdone=true;
					Themify.fontAwesome(['tf-fas-volume-mute','tf-fas-volume-up','tf-fas-undo-alt','tf-fas-redo-alt','tf-far-closed-captioning','tf-ti-fullscreen']);
				}
		},
		init=function(items,options){
			for(let i=items.length-1;i>-1;--i){
				let item=items[i];
				if(item.previousElementSibling===null || !item.previousElementSibling.classList.contains('tf_video_container')){
					
					if(!options){
						let p=item.parentNode.parentNode;
						if(p.classList.contains('wp-audio-playlist')){
							let playlist = p.getElementsByClassName('tf-playlist-script')[0];
							if(!playlist){
								playlist=p.getElementsByClassName('wp-playlist-script')[0];
							}
							if(playlist){
								options=JSON.parse(playlist.textContent);
								if(options['type']!=='audio'){
									options=false;
								}
							}
						}
					}
					if(!item.hasAttribute('src') && !item.getElementsByTagName('source')[0]){
						if(!options || !options['tracks']){
                                                    continue;
						}
						let track=options['tracks'][0]['src'];
						if(!track){
							for(let j=1,len=options['tracks'].length;j<len;++j){
								if(options['tracks'][j]['src']){
									track=options['tracks'][j]['src'];
									break;
								}
							}
						}
						if(!track){
							continue;
						}
						item.setAttribute('src',track);
					}
					if(item.readyState===4){
						loadMetaData(item,options);
					}
					else{
						Themify.requestIdleCallback(function(){
							item.addEventListener('loadedmetadata',function(){
								loadMetaData(this,options);
							},{passive:true,once:true});
							item.setAttribute('preload','metadata'); 
							if(IS_IOS===true){
								item.load();
							}
						},200);
					}
				}
			}
		};
    Themify.on('tf_video_init',function(items,options){
        if(items instanceof jQuery){
           items=items.get();
        }
		else if(items.length===undefined){
			items=[items];
		}
		init(items,options);
    });

})(Themify,document);