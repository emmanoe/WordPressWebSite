/**
 * Audio player module
 */
;
(function (Themify,document) {
    'use strict';
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
		generateTracks=function(opt,el){
			const tracks=opt['tracks'],
				showArtists=!!opt['artists'],
				showImage=!!opt['images'],
				showNumbers=!!opt['tracknumbers'],
				currentClicked=document.createElement('div'),
				container=document.createElement('div');
				container.className='tf_audio_playlist';
				currentClicked.className='tf_playlist_current';
				for(let i=0,len=tracks.length;i<len;++i){
					if(tracks[i].src){
						tracks[i].src=tracks[i].src.trim();
						let item=document.createElement('div'),
						link=document.createElement('a'),
						audio = new Audio(tracks[i].src),
						duration=document.createElement('div'),
						title=document.createElement('span');
						if(!tracks[i].type || audio.canPlayType(tracks[i].type)){
							item.className='tf_playlist_item tf_w tf_rel';
							link.href=tracks[i].src;
							link.className='tf_playlist_caption tf_w';
							duration.className='tf_playlist_length';
							if(!isNaN(audio.duration)|| (tracks[i].meta && tracks[i].meta.length_formatted)){
								duration.textContent=!isNaN(audio.duration)?humanTime(audio.duration):tracks[i].meta.length_formatted;
								audio=null;
							}
							else{
								item.className+=' tf_lazy';
								audio.addEventListener('durationchange',function(){
									duration.textContent=humanTime(this.duration);
									audio=null;
									item.classList.remove('tf_lazy');
								},{passive:true,once:true});
								
							}
							if(showNumbers===true){
								link.textContent=(i+1)+'.';
							}
							title.className='tf_playlist_title';
						
							if(tracks[i].caption){
								title.textContent=tracks[i].caption;
							}
							else if(tracks[i].title){
								title.textContent=tracks[i].title;
							}
							if(showArtists===true && tracks[i].meta && tracks[i].meta.artists){
								let artists=document.createElement('span');
								artists.className='tf_playlist_artist';
								artists.textContent='-'+tracks[i].meta.artists;
								link.appendChild(artists);
							}
							link.appendChild(title);
							item.appendChild(link);
							item.appendChild(duration);
							container.appendChild(item);
						}
						else{
							tracks.slice(i,1);
						}
					}
					else{
						tracks.slice(i,1);
					}
				}
				let firstClick=true;
				container.addEventListener('click',function(e){
					const clicked=e.target.closest('.tf_playlist_caption'),
						isCurrent=clicked.parentNode.classList.contains('tf_audio_current');
					if(clicked){
						e.preventDefault();
						e.stopPropagation();
						if(!isCurrent || el.paused){
							if(!isCurrent){
								const prev =this.getElementsByClassName('tf_audio_current')[0],
									index=Themify.convert(this.children).indexOf(clicked.parentNode),
									caption=document.createElement('div'),
									title=document.createElement('span');
									caption.className='tf_playlist_caption';
									title.className='tf_playlist_title';
								if(firstClick===false){
									el.pause();
									el.addEventListener('loadedmetadata',function(){
										this.play();
									},{passive:true,once:true});
									el.setAttribute('src',clicked.getAttribute('href'));
									el.load();
								}
								if(prev){
									prev.classList.remove('tf_audio_current');
								}
								clicked.parentNode.classList.add('tf_audio_current');
								currentClicked.innerHTML='';
								if(tracks[index]){
									const track=tracks[index];
									if(showImage && track.thumb && track.thumb.src){
										const img = new Image();
										img.src=track.thumb.src;
										img.width=track.thumb.width;
										img.height=track.thumb.height;
										img.decode='async';
										currentClicked.appendChild(img);
									}
									title.textContent=track.title?track.title:(track.caption?track.caption:'');
									caption.appendChild(title);
									if(tracks.meta){
										if(tracks.meta.album){
											const album =document.createElement('span');
												album.className=' tf_playlist_album';
												album.textContent=tracks.meta.album;
												caption.appendChild(album);
										}
										if(showArtists && tracks.meta.artists){
											const artist =document.createElement('span');
											artist.className=' tf_playlist_artist';
											artist.textContent=tracks.meta.artists;
											caption.appendChild(artist);
										}
									}
									currentClicked.appendChild(caption);
								}	
							}
							else{
								el.play();
							}
						}
						firstClick=false;
					}
				});
				el.parentNode.insertBefore(currentClicked,el);
				container.getElementsByClassName('tf_playlist_caption')[0].click();
				return container;
		},
		loadMetaData=function(el,opt){
			const container = document.createElement('div'),
				wrap = document.createElement('div'),
				progressWrap=document.createElement('div'),
				progressLoaded=document.createElement('div'),
				progressCurrent=document.createElement('div'),
				progressWaiting=document.createElement('div'),
				hoverHandler=document.createElement('div'),
				range=document.createElement('input'),
				volumeRange=document.createElement('input'),
				volumeWrap=document.createElement('div'),
				volumeInner=document.createElement('div'),
				controls=document.createElement('div'),
				mute=document.createElement('button'),
				play=document.createElement('button'),
				currentTime = document.createElement('div'),
				trackWrap=el.parentNode.closest('.track'),
				totalTime=document.createElement('div'),
				isPlayList=opt && opt['tracks'] && (true || opt['tracklist']);
				let paused=true,//For error play-request-was-interrupted
					sliding=false;
				
				container.className='tf_audio_container tf_w tf_rel tf_box';
				wrap.className='tf_audio_wrap tf_w tf_rel tf_box';
				controls.className='tf_audio_controls';
				progressWrap.className='tf_audio_progress_wrap tf_rel tf_textl';
				progressLoaded.className='tf_audio_progress_loaded tf_w tf_h tf_abs';
				progressCurrent.className='tf_audio_progress_current tf_w tf_h tf_abs';
				range.className='tf_audio_progress_range tf_w tf_h tf_abs';
				volumeRange.min=range.min=0;
				volumeRange.max=range.max=100;
				volumeRange.type=range.type='range';
				range.value=0;
				volumeRange.value='50%';
				volumeWrap.className='tf_audio_volumn_wrap';
				volumeInner.className='tf_audio_volumn_inner';
				volumeRange.className='tf_audio_volumn_range';
				mute.className='tf_audio_mute';
				play.className='tf_auido_play';
				play.tabIndex=mute.tabIndex=0;
				if(el.muted){
					mute.className+=' tf_muted';
				}
				currentTime.className='tf_audio_current_time';
				totalTime.className='tf_audio_total_time';
				hoverHandler.className='tf_audio_hover tf_abs tf_hide tf_box tf_textc';
				currentTime.textContent=humanTime(el.currentTime); 
				totalTime.textContent=humanTime(el.duration); 
				
				play.addEventListener('click',function(e){
					if(e.type==='click'){
						e.preventDefault();
						e.stopPropagation();
					}
					if(el.paused){
						el.play();
					}
					else{
						el.pause();
					}
				});
				if(trackWrap){
					const trackTitle=trackWrap.getElementsByClassName('track-title')[0];
					if(trackTitle){
						trackTitle.addEventListener('click',function(e){
							e.preventDefault();
							e.stopPropagation();
							play.click();
						});
					}
				}
				mute.addEventListener(_click,function(e){
					if(e.type==='click'){
						e.preventDefault();
						e.stopPropagation();
					}
					el.muted  =!el.muted;
				},{passive:_click!=='click'});
				if(!Themify.isTouch){
					progressWrap.addEventListener('mouseenter',function(){
						if(!isNaN(el.duration)){
							hoverHandler.classList.remove('tf_hide');
							const w =this.clientWidth,
							hoverW=parseFloat(hoverHandler.clientWidth/2),
							duration=el.duration,
							move=function(e){
								const X=e.layerX!==undefined?e.layerX:e.offsetX;
								if((X-hoverW)>0 && e.layerX<=w){
									hoverHandler.style['transform']='translateX('+(X-hoverW)+'px)';
									hoverHandler.textContent=humanTime(parseFloat((X/w))*duration);
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
					e.stopPropagation();
					if(!isNaN(el.duration)){
						if(!el.paused && paused===true){
							el.pause();
						}
						sliding=true;
						const v=parseInt(this.value);
						el.currentTime=v===100?(el.duration-1):parseFloat((v*el.duration)/100).toFixed(4);
					}
				});
				
				range.addEventListener('change',function(e){
					e.preventDefault();
					e.stopPropagation();
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
				
				el.addEventListener('waiting', function() {
					progressWrap.classList.add('tf_audio_waiting');
					this.addEventListener('playing', function(){
						progressWrap.classList.remove('tf_audio_waiting');
					},{passive:true,once:true});
				},{passive:true});
				
				el.addEventListener('emptied', function(){
					progressWrap.classList.add('tf_audio_waiting');
					this.addEventListener('playing', function(){
						progressWrap.classList.remove('tf_audio_waiting');
					},{passive:true,once:true});
				},{passive:true});
				
				el.addEventListener('pause',function(){
					play.classList.remove('tf_audio_playing');
				},{passive:true});
				
				el.addEventListener('play',function(){
					play.classList.add('tf_audio_playing');
					const allAudios = document.getElementsByTagName('audio');
					for(let i=allAudios.length-1;i>-1;--i){
						if(allAudios[i]!==this){
							allAudios[i].pause();
						}
					}
				},{passive:true});
				
				el.addEventListener('timeupdate',function(){
					if(!isNaN(this.duration)){
						currentTime.textContent=humanTime(this.currentTime); 
						let v=parseFloat(this.currentTime/this.duration);
						progressCurrent.style['transform']='scaleX('+v.toFixed(4)+')';
						if(sliding===false){
							range.value=parseInt(v*100);
						}
					}
				},{passive:true});
				
				if(!IS_IOS){
					volumeRange.addEventListener('input',function(e){
						e.preventDefault();
						e.stopPropagation();
						el.volume=parseFloat(this.value/100).toFixed(3);
					});
				}
				el.addEventListener('volumechange',function(){
					if(this.volume!==0){
						mute.classList.remove('tf_mute_disabled');
					}
					if(this.muted===true || this.volume===0){
						if(this.volume===0){
							mute.classList.add('tf_mute_disabled');
						}
						mute.classList.add('tf_muted');
					}
					else{
						mute.classList.remove('tf_muted');
					}
				},{passive:true});
				progressWrap.appendChild(progressLoaded);
				progressWrap.appendChild(progressCurrent);
				progressWrap.appendChild(range);
				progressWrap.appendChild(hoverHandler);
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
				container.appendChild(wrap);
				if(isPlayList){
					const playList = container.appendChild(generateTracks(opt,el)),
						prev=document.createElement('button'),
						next=document.createElement('button');
					prev.className='tf_playlist_prev tf_play_disabled';
					next.className='tf_playlist_next';
					if(playList.children.length<=1){
						next.className+=' tf_play_disabled';
					}
					prev.tabIndex=next.tabIndex=0;
					controls.addEventListener('click',function(e){
						const clicked=e.target,
						cl=clicked.classList;
						if(!cl.contains('tf_play_disabled') && (cl.contains('tf_playlist_prev') ||cl.contains('tf_playlist_next'))){
							e.preventDefault();
							e.stopPropagation();
							const current = playList.getElementsByClassName('tf_audio_current')[0];
							if(current){
								const nextTrack = cl.contains('tf_playlist_prev')?current.previousElementSibling:current.nextElementSibling;
								if(nextTrack){
									nextTrack.getElementsByClassName('tf_playlist_caption')[0].click();
									if(cl.contains('tf_playlist_prev')){
										next.classList.remove('tf_play_disabled');
										cl.toggle('tf_play_disabled',!nextTrack.previousElementSibling);
									}
									else{
										prev.classList.remove('tf_play_disabled');
										cl.toggle('tf_play_disabled',!nextTrack.nextElementSibling);
									}
								}
							}
						}
					});
					el.addEventListener('ended',function(){
						if(!next.classList.contains('tf_play_disabled')){
							next.click();
						}
						else if(el.hasAttribute('data-loop') || el.hasAttribute('loop')){
							const first = playList.getElementsByClassName('tf_playlist_caption')[0];
							if(first){
								prev.classList.add('tf_play_disabled');
								next.classList.toggle('tf_play_disabled',playList.children.length<=1);
								first.click();
							}
						}
						
					},{passive:true});
					
					controls.appendChild(prev);
					controls.appendChild(play);
					controls.appendChild(next);
				}
				else{
					controls.appendChild(play);
				}
				el.parentNode.classList.remove('tf_lazy');
				el.parentNode.insertBefore(container,el);
		},
		init=function(items,options){
			for(let i=items.length-1;i>-1;--i){
                                let item=items[i];
				if(item.previousElementSibling===null || !item.previousElementSibling.classList.contains('tf_audio_container')){
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
    Themify.on('tf_audio_init',function(items,options){
        if(items instanceof jQuery){
           items=items.get();
        }
		else if(items.length===undefined){
			items=[items];
		}
       init(items,options);
    });

})(Themify,document);
