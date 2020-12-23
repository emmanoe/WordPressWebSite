/**
 * WC module
 */
;
(function ($,Themify, document) {
    'use strict';
	let isLoading=false,
	photoswipeLoading=false,
	_clickedItems=[];
	const self=Themify,
		variantionURL=themify_vars.wc_js['wc-add-to-cart-variation'],
		variantionImagesUrl=themify_vars.wc_js['wc_additional_variation_images_script'],
		order=document.getElementsByClassName('woocommerce-ordering')[0],
		change=function(){
			this.closest( 'form' ).submit();
		},
		phottoSwipe=function(e){
			if(!photoswipeLoading && themify_vars.photoswipe){
				photoswipeLoading=true;
				e.preventDefault();
				e.stopImmediatePropagation();
				const v=themify_vars.wc_version,
				self=this,
				checkLoad = function(k){
					delete themify_vars.photoswipe[k];
					if(Object.keys(themify_vars.photoswipe).length===0){
						self.click();
						delete themify_vars.photoswipe;
					}
				};
				Themify.LoadCss(themify_vars.photoswipe['main'], v, null, null, function(){
						checkLoad('main');
				});
				Themify.LoadCss(themify_vars.photoswipe['skin'], v, null, null, function(){
						checkLoad('skin');
				});
			}
		},
		load=function(e,fragments, cart_hash, $button){
			const args = themify_vars.wc_js,
				v=themify_vars.wc_version,
				loadAll=e && e!==true,
				checkLoad=function(k){
					delete args[k];
					if(Object.keys(args).length===0){
						self.body.off('click.tf_wc_click').off('added_to_cart removed_from_cart',addRemoveEvent);
						if(order){
							order.removeEventListener('change',change,{passive:true,once:true});
						}
						if(e && e!==true && e!=='load'){
							if(e.type==='click'){
								for(let i=0,len=_clickedItems.length;i<len;++i){
									if(self.body[0].contains(_clickedItems[i])){
										_clickedItems[i].click();
									}
								}
							}
							else{
								Themify.body.triggerHandler(e.type,[fragments, cart_hash, $button]);
							}
						}
						_clickedItems=null;
						Themify.trigger('tf_wc_js_load');
					}
				},
				loadWc=function(){
					if(args['woocommerce']){
						self.LoadAsync(args['woocommerce'], function(){
							checkLoad('woocommerce');
						}, (args['woocommerce'].indexOf('ver=',12)===-1?v:false),null,function(){
							return $.scroll_to_notices!==undefined;
						});
					}
					else{
						checkLoad('woocommerce');
					}
				},
				loadVariantions=function(){
					const forms = document.getElementsByClassName('variations_form');
					if(forms[0] || document.getElementsByClassName('wcpa_form_outer').length>0){
						if (variantionImagesUrl) {
							if(!$.wc_additional_variation_images_frontend){
								self.LoadAsync(variantionImagesUrl,(variantionImagesUrl.indexOf('ver=',12)===-1?v:false),false,null,function(){
									return $.wc_additional_variation_images_frontend!==undefined;
								});
							}
						}
						self.LoadAsync(themify_vars.includesURL + 'js/underscore.min.js', function () {
							self.LoadAsync(themify_vars.includesURL + 'js/wp-util.min.js', function () {
								if($.fn.wc_variation_form){
									for(let i=forms.length-1;i>-1;--i){
										$(forms[i]).wc_variation_form();
									}
								}
								else{
									self.LoadAsync(variantionURL, null,v,null, function () {
										return 'undefined' !== typeof $.fn.wc_variation_form;
									});
								}
							}, themify_vars.wp, null, function () {
								return window.wp!==undefined && undefined!== window.wp.template;
							});
						}, themify_vars.wp, null, function () {
							return 'undefined' !== typeof window._;
						});
					}
				};
			if(loadAll===true){
				if(args['jquery-blockui']){
					if($.blockUI===undefined){
						self.LoadAsync(args['jquery-blockui'], function(){
							checkLoad('jquery-blockui');
						}, (args['jquery-blockui'].indexOf('ver=',12)===-1?v:false),null,function(){
							return $.blockUI!==undefined;
						});
					}else{
						checkLoad('jquery-blockui');
					}
				}
				if(!$.fn.wc_product_gallery && typeof wc_single_product_params!=='undefined'){
					if(args['wc-single-product']){
						self.LoadAsync(args['wc-single-product'], function(){
							checkLoad('wc-single-product');
							Themify.trigger('tf_init_photoswipe');
						}, (args['wc-single-product'].indexOf('ver=',12)===-1?v:false),null,function(){
							return $.fn.wc_product_gallery!==undefined;
						});
					}
				}
				else{
					delete args['wc-single-product'];
				}
			}
			if(args['wc-add-to-cart']){
				self.LoadAsync(args['wc-add-to-cart'], function(){
					checkLoad('wc-add-to-cart');
					loadVariantions();
				},(args['wc-add-to-cart'].indexOf('ver=',12)===-1?v:false));
			}else{
				loadVariantions();
			}
			if(args['js-cookie']){
				self.LoadAsync(args['js-cookie'], function(){
					checkLoad('js-cookie');
					self.LoadAsync(args['wc-cart-fragments'], function(){
						checkLoad('wc-cart-fragments');
					},(args['wc-cart-fragments'].indexOf('ver=',12)===-1?v:false));
					if(loadAll===true){
						loadWc();
					}
				}, (args['js-cookie'].indexOf('ver=',12)===-1?v:false),null,function(){
					return !!window['Cookies'];
				});
			}
			else{
				loadWc();
			}
		},
		addRemoveEvent=function(e, fragments, cart_hash, $button){
			if(isLoading===false){
				isLoading=true;
				load(e, fragments, cart_hash, $button);
			}
		};
		self.body.one('added_to_cart removed_from_cart',addRemoveEvent)
		.on('click.tf_wc_click','.ajax_add_to_cart,.remove_from_cart_button',function(e){
			e.preventDefault();
			e.stopImmediatePropagation();
			if(!e.target.classList.contains('loading')){
				_clickedItems.push(e.target);
				e.target.classList.add('loading');
			}
			if(isLoading===false){
				isLoading=true;
				load(e);
			}
		});
		if(order){
			order.addEventListener('change',change,{passive:true,once:true});
		}
		delete themify_vars.wc_js['wc-add-to-cart-variation'];
		delete themify_vars.wc_js['wc_additional_variation_images_script'];
		Themify.on('tf_wc_init',function(force){
			if(force===true || document.getElementsByClassName('woocommerce-input-wrapper')[0] || document.getElementsByClassName('woocommerce-store-notice')[0]){
				load('load');
			}
			else{
				load(true);
			}
			Themify.trigger('tf_init_photoswipe');
		})
		.on('tf_init_photoswipe',function(el){
			if(!$.fn.wc_product_gallery || typeof wc_single_product_params==='undefined'){
				return;
			}
			if(!wc_single_product_params.photoswipe_enabled){
				Themify.off('tf_init_photoswipe');
				return;
			}
			if(!el){
				el=document;
			}
			const items=el.getElementsByClassName('woocommerce-product-gallery');
			for(let i=items.length-1;i>-1;--i){
				let wrap=$( items[i] );
				if(!wrap.data('product_gallery')){
					wrap.wc_product_gallery( wc_single_product_params );
					let fSlider = wrap.data('flexslider');
					if(fSlider){
						setTimeout(fSlider.resize.bind(fSlider),100);
					}
				}
				if(!photoswipeLoading){
					let item=items[i].getElementsByClassName('woocommerce-product-gallery__trigger')[0];
					if(item){
						item.addEventListener('click',phottoSwipe,{once:true});
					}
				}
				
			}
		}).trigger('tf_init_photoswipe');
		
})(jQuery,Themify, document);
