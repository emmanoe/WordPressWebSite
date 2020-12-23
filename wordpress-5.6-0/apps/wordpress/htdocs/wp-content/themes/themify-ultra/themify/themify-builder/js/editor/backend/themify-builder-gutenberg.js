( function( blocks, i18n, element, $ ) {
	var el = element.createElement,
            __ = i18n.__;

	blocks.builderUtils = {
		stateInit: false,
		number: 0,
		tempHTML: null,
		vent: _.extend({}, Backbone.Events),
		isRendered: function(){
			return document.getElementById('tb_toolbar');
		},
		saveHTML: function( props ) {
			if ( this.isRendered() ) {
				this.tempHTML = document.getElementById('tb_canvas_block').innerHTML;
			}
		},
		restoreHTML: function( props ){
			if ( 'undefined' === typeof tb_app ) return;
			
			if ( ! _.isNull( this.tempHTML ) && ! this.isRendered() && document.getElementById('tb_canvas_block') ) {
				document.getElementById('tb_canvas_block').innerHTML = this.tempHTML;
				if ( ! _.isUndefined(tb_app.Instances.Builder[0]) ) {
					
					let batch = document.getElementById('tb_row_wrapper').querySelectorAll('[data-cid]');
					batch = Array.prototype.slice.call(batch);
					for (let i = 0, len = batch.length; i < len; ++i) {
					let model = tb_app.Models.Registry.lookup(batch[i].getAttribute('data-cid'));
						if (model) {
							model.trigger('change:view', batch[i]);
						}
					}
					tb_app.toolbar.setElement( $('#tb_toolbar') ).render();
					tb_app.toolbarCallback();
					
					tb_app.Instances.Builder[0].setElement($('#tb_row_wrapper'));
					tb_app.Instances.Builder[0].init(true);
				}
			}
		},
		manageState: function( props ) {
			if ( 'undefined' === typeof tb_app || this.stateInit ) return;
			this.stateInit = true;
			tb_app.vent.on('dom:change', function () {
				if (tb_app.hasChanged) {
					props.setAttributes({data: blocks.builderUtils.number++ });
				}
			});
			tb_app.vent.on('backend:switchfrontend', function(url){
				window.top.location.href = url;
			});
                        document.getElementById('block-'+props.clientId).removeAttribute('tabIndex');
		},
		saveBlock: function(){
			if ( 'undefined' === typeof tb_app ) return;
			if ( this.onClicking ) {
				this.onClicking = false;
				return;
			}

			if ( tb_app.hasChanged ) {
				tb_app.Utils.saveBuilder(this.goToFrontend);
			} else {
				this.goToFrontend();
			}
		},
		goToFrontend: function(){
			if ( tb_app.redirectFrontend ) {
				tb_app.vent.trigger('backend:switchfrontend', tb_app.redirectFrontend);
			}
		}
	};

	blocks.registerBlockType( 'themify-builder/canvas', {
		title: 'Themify Builder',
		icon: 'layout',
		category: 'layout',
		useOnce: true,
		edit: function( props ) {
			blocks.builderUtils.vent.trigger('edit', props);	
			return el('div',{ id: 'tb_canvas_block'}, 'placeholder builder' );
		},
		save: function() {
			return null; // render with PHP
		}
	} );

	const render_block = _.debounce(function( props ){
			blocks.builderUtils.saveHTML( props );
			blocks.builderUtils.restoreHTML( props );

			blocks.builderUtils.manageState( props );
		}, 800),
		save_block = _.debounce(function(){
			blocks.builderUtils.saveBlock();
		},800);

	blocks.builderUtils.vent.on('edit', render_block);
	blocks.builderUtils.vent.on('save', save_block);
	$(function(){
		$('body').on('click', '.editor-post-publish-button, .editor-post-save-draft', function(e){
			if ( tb_app.hasChanged ) {
				tb_app.Utils.saveBuilder(function(){
					blocks.builderUtils.onClicking = true;
				});
			}
		}).off('click.frontend-btn', '#tb_switch_frontend').on('click.frontend-btn', '#tb_switch_frontend', function(){

			$('.editor-post-publish-button').on('DOMSubtreeModified', function() {
				if(!this.classList.contains('is-busy') && !$('.editor-post-saved-state').length){
					 blocks.builderUtils.onClicking = false;
					 blocks.builderUtils.saveBlock();
				}
			});
		});
	});

	$( document ).ajaxComplete(function( event, xhr, settings ) {
		if('POST' === settings.type && window['themifyBuilder']!==undefined&& themifyBuilder.post_ID){
			const url  = settings.url,
				callbackUrl = 'post.php?post=' + themifyBuilder.post_ID + '&action=edit&classic-editor=1&meta_box=1';
			
			if (url.indexOf(callbackUrl) !== -1 ) {
				blocks.builderUtils.vent.trigger('save');
			}
		}
	});

} )(window.wp.blocks,window.wp.i18n,window.wp.element,jQuery);
