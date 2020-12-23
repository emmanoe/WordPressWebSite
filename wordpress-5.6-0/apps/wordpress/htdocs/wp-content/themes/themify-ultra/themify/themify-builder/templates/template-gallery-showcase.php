<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
/**
 * Template Gallery Showcase
 * 
 * Access original fields: $args['mod_settings']
 * @author Themify
 */

$first_image = '';
if ( is_object( $args['settings']['gallery_images'][0] ) ) :
	$caption = $args['settings']['gallery_images'][0]->post_excerpt;
	$title = $args['settings']['gallery_images'][0]->post_title;
	$disable = Themify_Builder_Model::is_img_php_disabled();
	$first_image = $disable===true?wp_get_attachment_image($args['settings']['gallery_images'][0]->ID, $args['settings']['s_image_size_gallery']):themify_get_image(array('src'=>$args['settings']['gallery_images'][0]->ID, 'w'=> $args['settings']['s_image_w_gallery'], 'h'=> $args['settings']['s_image_h_gallery'])); 
	?>
	<div class="gallery-showcase-image">
		<div class="image-wrapper gallery-icon tf_rel">
			<?php echo $first_image?>
			<?php if( ! empty( $args['settings']['gallery_image_title'] ) || ( $args['settings']['gallery_exclude_caption'] !== 'yes' ) ) : ?>
                <div class="gallery-showcase-title tf_hidden tf_abs tf_textl">
					<?php
					! empty( $args['settings']['gallery_image_title'] )
					&& printf( '<strong class="gallery-showcase-title-text tf_block">%s</strong>'
								, esc_attr( $title ) );
					
						$args['settings']['gallery_exclude_caption'] !== 'yes'
							&& printf( '<span class="gallery-showcase-caption">%s</span>'
								, esc_attr( $caption ) );
					?>
				</div>
			<?php endif; ?>
		</div>
    </div>
    <div class="gallery-images tf_hidden">
        <?php
        foreach ($args['settings']['gallery_images'] as $image):?>
			<div class="gallery-icon">
				<?php
				if ($disable===true) {
					$img = wp_get_attachment_image($image->ID, $args['settings']['image_size_gallery']);
					$link = wp_get_attachment_image_src($image->ID, $args['settings']['s_image_size_gallery']);
					$link = !empty($link[0])?$link[0]:'';
				} else {
					if ($args['settings']['thumb_w_gallery'] !== '') {
						$img = themify_get_image(array('src'=>$image->ID,'w'=>$args['settings']['thumb_w_gallery'],'h'=>$args['settings']['thumb_h_gallery']));
					} else {
						$img = wp_get_attachment_image($image->ID, $args['settings']['image_size_gallery']);
					}
					$link = themify_get_image(array('src'=>$image->ID, 'w'=>$args['settings']['s_image_w_gallery'], 'h'=>$args['settings']['s_image_h_gallery'],'urlonly'=>true));
				}

				if ( ! empty( $link ) ) {
					echo '<a data-image="' . esc_url( $link ) . '" title="' . esc_attr($image->post_title ) . '" data-caption="' . esc_attr( $image->post_excerpt ) . '" href="#">';
				}
				echo $img;
				if ( ! empty( $link ) ) echo '</a>';
			?>
		</div>
        <?php endforeach;?>
    </div>
<?php endif; 