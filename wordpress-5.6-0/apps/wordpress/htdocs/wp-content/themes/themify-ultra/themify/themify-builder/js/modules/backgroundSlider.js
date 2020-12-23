/*backgroundSlider for row/column/subrow*/
;
(function ($,Themify,themify_vars,tbLocalScript) {
    'use strict';
    const vars = {
            autoplay: tbLocalScript['backgroundSlider'] && tbLocalScript['backgroundSlider'].autoplay?parseInt(tbLocalScript['backgroundSlider'].autoplay.autoplay, 10):5000
        },
    _init=function (items) {
        if (vars.autoplay <= 10) {
            vars.autoplay *= 1000;
        }
        if(items instanceof jQuery){
            items = items.get();
        }
        for(let i=items.length-1;i>-1;--i){

            let $thisRowSlider = $(items[i]),
                $backel = $thisRowSlider.parent(),
                                    childs = items[i].getElementsByTagName('li'),
                rsImages = [];
            for(var j=childs.length-1;j>-1;--j){
                rsImages.push({url:childs[j].getAttribute('data-bg'),'alt':childs[j].getAttribute('data-bg-alt')});
            }
            // Call backstretch for the first time
            $backel.tb_backstretch(rsImages, {
                speed: parseInt(items[i].getAttribute('data-sliderspeed')),
                duration: vars.autoplay,
                mode: items[i].getAttribute('data-bgmode')
            });

            // Cache Backstretch object
            let thisBGS = $backel.data('tb_backstretch'),
                sliderDots = $thisRowSlider.find('.row-slider-slides > li'),
                currentClass = 'row-slider-dot-active';

            // Previous and Next arrows
            childs=items[i].querySelectorAll('.row-slider-prev,.row-slider-next,.row-slider-dot');
            for(j=childs.length-1;j>-1;--j){
                if(childs[j].classList.contains('row-slider-dot')){
                    // Dots
                    childs[j].addEventListener('click',function(){
                        thisBGS.show($(this).data('index'));
                    },{passive:true});
                }
                else{
                    childs[j].addEventListener('click',function(e){
                         e.preventDefault();
                         if ($(this).hasClass('row-slider-prev')) {
                            thisBGS.prev();
                         }
                         else {
                            thisBGS.next();
                         }
                    });
                }
            }
            if (sliderDots[0]) {
                sliderDots[0].classList.add(currentClass);
                $backel.on('tb_backstretch.show', function (e, data) {
                    const currentDot = sliderDots.eq(thisBGS.index);
                    if (currentDot[0]) {
                        sliderDots.removeClass(currentClass);
                        currentDot.addClass(currentClass);
                    }
                });
            }
            if (items[i].getAttribute('data-bgmode') === 'kenburns-effect') {
                let lastIndex,
                    kenburnsActive = 0;
                const imagesCount = rsImages.length > 4? 4 : rsImages.length,
                    createKenburnIndex = function () {
                        return (kenburnsActive + 1 > imagesCount) ? kenburnsActive = 1 : ++kenburnsActive;
                    };

                $backel.on('tb_backstretch.before', function (e, data) {
                    setTimeout(function () {
                        if (lastIndex != data.index) {
                            const $img = data.$wrap.find('img').last();
                            $img.addClass('kenburns-effect' + createKenburnIndex());
                            lastIndex = data.index;
                        }
                    }, 50);

                }).on('tb_backstretch.after', function (e, data) {

                    const $img = data.$wrap.find('img').last(),
                        expr = /kenburns-effect\d/;
                    if (!expr.test($img.attr('class'))) {
                        $img.addClass('kenburns-effect' + createKenburnIndex());
                        lastIndex = data.index;
                    }

                });
                if(Themify.is_builder_active){
                    $backel.on('backstretch.show', function (e, instance, index) {
                        // Needed for col styling icon and row grid menu to be above row and sub-row top bars.
                            $backel.css('zIndex', 0);
                    });
                }
            }
        }
    },
    checkLoaded=function(items){
        if(Themify.cssLazy['tb_bgslider_css']===true && Themify.jsLazy['tf_backstretch']===true){
            _init(items);
        }
    };
    Themify.on('tb_bgslider_init', function (items) {
        if(Themify.cssLazy['tb_bgslider_css']!==true){
                Themify.LoadCss(ThemifyBuilderModuleJs.cssUrl + 'backgroundSlider.css',null, null, null, function(){
                        Themify.cssLazy['tb_bgslider_css']=true;
                        checkLoaded(items);
                });
        }
        if(Themify.jsLazy['tf_backstretch']!==true){
                Themify.LoadAsync(Themify.url + '/js/backstretch.themify-version.min.js', function(){
                        Themify.jsLazy['tf_backstretch']=true;
                        checkLoaded(items);
                }, '2.0.4', null, function () {
                        return 'undefined' !== typeof $.fn.tb_backstretch;
                });
        }
        checkLoaded(items);
    });

})(jQuery,Themify,themify_vars,tbLocalScript);