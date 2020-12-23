<?php ! defined( 'ABSPATH' ) && exit;
/**
 * Template Gallery Slider
 * 
 * Access original fields: $args['settings']
 * @author Themify
 */

if( $args['settings']['layout_gallery'] === 'slider' ) :
	$margins = '';
	$element_id = $args['module_ID'];
	if( $args['settings']['left_margin_slider'] !== '' ) {
		$margins .= 'margin-left:' . $args['settings']['left_margin_slider'] . 'px;';
	}
	$element_id=$element_id.'_thumbs';

	if ($args['settings']['right_margin_slider'] !== '') {
		$margins .= 'margin-right:' . $args['settings']['right_margin_slider'] . 'px;';
	}

	foreach( array( 'slider', 'thumbs' ) as $mode ) :
		$is_slider = $mode === 'slider';
		if($is_slider===false && 'yes' === $args['settings']['slider_thumbs']){
			continue;
		}
		$hasNav=$mode === ( ($is_slider && 'yes' === $args['settings']['slider_thumbs']) || $args['settings']['show_arrow_buttons_vertical'] ? 'slider' : 'thumbs' ) ? ($args['settings']['show_arrow_slider']==='yes'?'1':'0') : '0';
?>
    <?php if($hasNav==='1'): ?>
        <div class="themify_builder_slider_vertical tf_rel">
    <?php endif; ?>
<div class="swiper-container tf_carousel themify_builder_slider<?php if($hasNav==='1'):?> themify_builder_slider_vertical<?php endif;?><?php if($is_slider===false):?> <?php echo $element_id?><?php endif;?> tf_rel tf_overflow"
	data-pager="<?php echo (!$is_slider || ($is_slider && 'yes' === $args['settings']['slider_thumbs'])) && $args['settings']['show_nav_slider']=== 'yes'?'1':'0' ?>"
	<?php if(Themify_Builder::$frontedit_active===false):?> data-lazy="1"<?php endif;?>
	<?php if($is_slider===true):?>
		data-thumbs="<?php echo $element_id?>"
		data-effect="<?php echo $args['settings']['effect_slider'] ?>" 
		data-css_url="<?php echo THEMIFY_BUILDER_CSS_MODULES ?>sliders/carousel.css,<?php echo THEMIFY_BUILDER_CSS_MODULES ?>sliders/<?php echo $mod_name?>.css"
	<?php else:?>
        data-thumbs-id="<?php echo $element_id?>"
		data-visible="<?php echo $args['settings']['visible_opt_slider']?>" 
		data-tbreakpoints="<?php echo themify_get_breakpoints('tablet_landscape')[1]?>"
		data-mbreakpoints="<?php echo themify_get_breakpoints('mobile')?>"
		data-tab-visible="<?php echo $args['settings']['tab_visible_opt_slider']?>"
		data-mob-visible="<?php echo $args['settings']['mob_visible_opt_slider']?>"
	<?php endif?>
	<?php if($args['settings']['auto_scroll_opt_slider']!=='off'):?>
		data-auto="<?php echo $args['settings']['auto_scroll_opt_slider']?>"
		data-pause_hover="<?php echo $args['settings']['pause_on_hover_slider']==='resume'?'1':'0' ?>"
		<?php if($is_slider===false || ($is_slider && 'yes' === $args['settings']['slider_thumbs'])):?>
			data-controller="<?php echo $args['settings']['play_pause_control']=== 'yes'?'1':'0' ?>"
		<?php endif;?>
	<?php endif;?>
	data-speed="<?php echo $args['settings']['speed_opt_slider'] === 'slow' ? 4 : ($args['settings']['speed_opt_slider'] === 'fast' ? '.5' : 1) ?>"
	data-wrapvar="<?php echo $args['settings']['wrap_slider']==='yes'?'1':'0' ?>"
	data-slider_nav="<?php echo $hasNav ?>"
	data-height="<?php echo isset($args['settings']['horizontal']) && $args['settings']['horizontal'] === 'yes' ? 'variable' : $args['settings']['height_slider'] ?>"
	>
	<div class="swiper-wrapper tf_lazy tf_rel tf_w tf_h tf_textc">
		<?php foreach( $args['settings']['gallery_images'] as $image ) : ?>
			<div class="swiper-slide">
			<div class="slide-inner-wrap"<?php $margins!=='' && printf( ' style="%s"', $margins ) ?>>
				<div class="tf_lazy slide-image gallery-icon"><?php
					$image_html =themify_get_image( array(
							'w' => $is_slider===false ? $args['settings']['thumb_w_gallery'] : $args['settings']['s_image_w_gallery'],
							'h' => $is_slider===false ? $args['settings']['thumb_h_gallery'] : $args['settings']['s_image_h_gallery'],
							'lazy_load'=>false,
							'image_size'=>'full',
							'alt' => get_post_meta( $image->ID, '_wp_attachment_image_alt', true ),
							'is_slider'=>$is_slider,
							'src' => wp_get_attachment_image_url( $image->ID, 'full' )
						) );

					$lightbox = '';
					$link=null;
					if( $is_slider===true){
						if( $args['settings']['link_opt'] === 'file' ) {
							$link = wp_get_attachment_image_src( $image->ID, $args['settings']['link_image_size'] );
							$link = $link[0];
							$lightbox = ' class="themify_lightbox"';
						} elseif( 'none' !== $args['settings']['link_opt'] ) {
							$link = get_attachment_link( $image->ID );
						}
					}
					if($is_slider===true && ! empty( $link )) {
						printf( '<a href="%s"%s>%s</a>', esc_url( $link ), $lightbox, $image_html );
					} else {
						echo $image_html;
					}
				?>
				</div>
				<?php if( $is_slider===true && (( $args['settings']['gallery_image_title'] && $image->post_title) || (! $args['settings']['gallery_exclude_caption'] && $image->post_excerpt ))) : ?>
					<div class="slide-content">
						<?php 
							$args['settings']['gallery_image_title'] && ! empty( $image->post_title )
								&& printf( '<h3 class="slide-title">%s</h3>', wp_kses_post( $image->post_title ) );

							! $args['settings']['gallery_exclude_caption'] && ! empty( $image->post_excerpt )
								&& printf( '<p>%s</p>', apply_filters( 'themify_builder_module_content', $image->post_excerpt ) );
						?>
					</div><!-- /slide-content -->
				<?php endif; ?>
			</div></div>
		<?php endforeach; ?>
	</div>
</div>
    <?php if($hasNav==='1'): ?>
        </div>
    <?php endif; ?>
<?php endforeach; ?>
<?php endif; 
