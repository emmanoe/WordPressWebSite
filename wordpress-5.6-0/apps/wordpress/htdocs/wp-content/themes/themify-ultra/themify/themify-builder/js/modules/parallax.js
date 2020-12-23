/**
 * builderParallax for row/column/subrow
 */
;
(function ($,Themify,window,document) {
    'use strict';
    
    const $window = $(window),
        className = 'builder-parallax-scrolling',
        items=[],
        def = {
            xpos: '50%',
            speedFactor:.1
        },
        scrollEvent=function(){
			for (let i=items.length-1;i>-1;--i) {
                if(items[i] && items[i]['element']){
                    items[i].update(i);
                }
                else{
                    destroy(i);
                }
            }  
        },
        resize=function(e){
            if(e){
                wH = e.h;
            }
            for (let i=items.length-1;i>-1;--i) {
                if(items[i] && items[i]['element']){
                    items[i].top = items[i].element.offset().top;
                    items[i].update(i);
                }
                else{
                    destroy(i);
                }
            }
            
        },
        destroy=function(index){
            if (items[index]) {
                if(items[index].classList){
                    items[index].classList.remove(className);
                }
                items.splice(index, 1);
                if (items.length===0) {
                    Themify.off('tfsmartresize',resize);
                    window.removeEventListener('scroll', scrollEvent,{passive:true});
                    isInitialized = null;
                }
            }
		};
    let wH = null,
        isInitialized = null;
    function Plugin(element) {
        this.element = element;
        this.init();
    }
    Plugin.prototype = {
        top: 0,
        init() {
            this.top = this.element.offset().top;
			const src = this.element.css( 'background-image' ).replace(/(url\(|\)|")/g, '');
			if(src && src!=='none'){
				const image = new Image(),
					self=this;
				image.src = src;
				Themify.imagesLoad( image, function(instance) {
					const img=instance.elements[0];
					img.w = img.width;
					img.h = img.height;
					items.push(self);
					self.update();
				});
			}
			else{
				items.push(self);
				this.update();
			}
            if (isInitialized===null) {
                wH = Themify.h;
                Themify.on('tfsmartresize',resize);
                window.addEventListener('scroll', scrollEvent,{passive:true});
                isInitialized = true;
            }
        },
        update(i) {
        	if (document.body.contains(this.element[0]) === false || !this.element[0].classList.contains(className)) {
                destroy(i);
                return;
            }
            const pos = $window.scrollTop(),
                    top = this.element.offset().top,
                    outerHeight = this.element.outerHeight(true),
					posY=(top - pos) * def.speedFactor;
            // Check if totally above or totally below viewport
            if ((top + outerHeight) < pos || top > (pos + wH)) {
                return;
            }
			this.element[0].style['backgroundPositionY']= 'calc(50% + ' + Math.round(posY) + 'px)';

			// calculate background-size: cover
			const coverRatio = Math.max( (this.element.outerWidth(true) / this.w), (outerHeight / this.h) );
			let newImageWidth = Math.round( this.w * coverRatio ),
				newImageHeight = Math.round( this.h * coverRatio );

			if ( newImageHeight === Math.round( outerHeight ) ) {
				// image is the exact height as the row, this will cause gap when backgroundPositionY changes; enlarge the image
				newImageWidth *= 1.3;
				newImageHeight *= 1.3;
				this.element[0].style['backgroundSize'] = Math.round( newImageWidth ) + 'px ' + Math.round( newImageHeight ) + 'px';
			} else {
				this.element[0].style['backgroundSize'] = '';
			}

        }
    };
    Themify.on('tb_parallax_init',function(items){
		if(items instanceof jQuery){
			items=items.get();
		}
		if(items.length===undefined){
			items=[items];
		}
		for(let i=items.length-1;i>-1;--i){
			let el=$(items[i]);
			if(! el.data('plugin_builderParallax')){
				el.data('plugin_builderParallax', new Plugin(el));
			}
		}
    });

})(jQuery,Themify,window,document);
