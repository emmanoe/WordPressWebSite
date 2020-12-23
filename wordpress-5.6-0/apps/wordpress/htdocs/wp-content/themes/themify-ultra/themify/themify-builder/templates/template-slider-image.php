<?php
if (!defined('ABSPATH'))
    exit; // Exit if accessed directly
/**
 * Template Slider Image
 * 
 * Access original fields: $args['settings']
 * @author Themify
 */
if (!empty($args['settings']['img_content_slider'])):
    $image_w = $args['settings']['img_w_slider'];
    $image_h = $args['settings']['img_h_slider'];
	$image_size = $args['settings']['image_size_slider'] !== '' ? $args['settings']['image_size_slider'] : themify_builder_get('setting-global_feature_size', 'image_global_size_field');
	$param_image_src = array('w' => $image_w, 'h' => $image_h,'is_slider'=>true,'image_size'=>$image_size);
    ?>
    <!-- module slider image -->

    <?php foreach ($args['settings']['img_content_slider'] as $content): ?>
        <?php $image_title = isset($content['img_title_slider']) ? trim($content['img_title_slider']) : '';
		$isAlt=false;
	?>
         <div class="swiper-slide">
            <div class="slide-inner-wrap"<?php if ($args['settings']['margin'] !== ''): ?> style="<?php echo $args['settings']['margin']; ?>"<?php endif; ?>>
                <?php if ( ! empty( $content['img_url_slider'] ) ) : ?>
                    <div class="tf_rel tf_lazy slide-image">
                        <?php
						if ( $image_title===''  ) {
							$image_title = Themify_Builder_Model::get_alt_by_url( $content['img_url_slider'] );
							$isAlt=true;
						}
                       $param_image_src['src'] = $content['img_url_slider'];
						$param_image_src['alt'] = $image_title;
						$image = themify_get_image($param_image_src);
                        ?>
                        <?php if (!empty($content['img_link_slider'])): ?>
                            <?php
                            $attr = '';
                            if (isset($content['img_link_params'])) {
                                $attr = $content['img_link_params'] === 'lightbox' ? ' data-rel="' . $args['module_ID'] . '" class="themify_lightbox"' : ($content['img_link_params'] === 'newtab' ? ' target="_blank" rel="noopener"' : '');
                            }
                            ?>
                            <a href="<?php echo esc_url(trim($content['img_link_slider'])); ?>" alt="<?php echo esc_attr( $image_title ); ?>"<?php echo $attr; ?>>
                                <?php echo $image; ?>
                            </a>
                        <?php else: ?>
                            <?php echo $image; ?>
                        <?php endif; ?>
                    </div><!-- /slide-image -->
                <?php endif; ?>

                <?php if (($isAlt===false && $image_title !== '') || isset($content['img_caption_slider'])): ?>
                    <div class="slide-content tb_text_wrap">

                        <?php if ($isAlt===false && $image_title !== ''): ?>
                            <h3 class="slide-title">
                                <?php if (!empty($content['img_link_slider'])): ?>
                                    <a href="<?php echo esc_url($content['img_link_slider']); ?>"<?php echo $attr; ?>><?php echo wp_kses_post($image_title); ?></a>
                                <?php else: ?>
                                    <?php echo $image_title; ?>
                                <?php endif; ?>
                            </h3>
                        <?php endif; ?>

                        <?php
                        if (isset($content['img_caption_slider'])) {
                            echo apply_filters('themify_builder_module_content', $content['img_caption_slider']);
                        }
                        ?>
                    </div><!-- /slide-content -->
                <?php endif; ?>
            </div>
        </div>
    <?php endforeach; ?>
<?php endif; 
