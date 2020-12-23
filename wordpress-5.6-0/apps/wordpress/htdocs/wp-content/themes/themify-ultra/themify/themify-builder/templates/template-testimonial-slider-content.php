<?php
if (!defined('ABSPATH'))
    exit; // Exit if accessed directly
/**
 * Template Testimonial
 * 
 * Access original fields: $args['mod_settings']
 * @author Themify
 */
if (!empty($args['settings']['tab_content_testimonial'])):
    $image_w = $args['settings']['img_w_slider'];
    $image_h = $args['settings']['img_h_slider'];
	$isSlider=!isset($args['settings']['type_testimonial']) || $args['settings']['type_testimonial']==='slider';
	$image_size = $args['settings']['image_size_slider'] !== '' ? $args['settings']['image_size_slider'] : themify_builder_get('setting-global_feature_size', 'image_global_size_field');
	$param_image_src = array('w' => $image_w, 'h' => $image_h,'image_size'=>$image_size);
	if($isSlider===true){
		$param_image_src['is_slider']=true;
	}
    foreach ($args['settings']['tab_content_testimonial'] as $content):
        ?>
        <div class="post<?php echo $isSlider===true?' swiper-slide':'' ?>">
            <div class="testimonial-item" <?php if ($args['settings']['margin'] !== ''): ?> style="<?php echo $args['settings']['margin']; ?>"<?php endif; ?>>
                <?php
                $image = '';
                if (!empty($content['person_picture_testimonial'])) {
                    $image_url = esc_url($content['person_picture_testimonial']);
                    $image_title = isset($content['title_testimonial']) ? $content['title_testimonial'] : '';
                    if ($alt_by_url = Themify_Builder_Model::get_alt_by_url($image_url)) {
                        $image_alt = $alt_by_url;
                    } else {
                        $image_alt = $image_title;
                    }
                    
					$param_image_src['src'] = $image_url;
					$param_image_src['alt'] = $image_alt;
					$image = themify_get_image($param_image_src);
                }
                ?>	

                <div class="testimonial-content">
                    <?php if (!empty($content['title_testimonial'])): ?>
                        <h3 class="testimonial-title"><?php echo $content['title_testimonial'] ?></h3>
                    <?php endif; ?>
                    <?php if (!empty($content['content_testimonial'])): ?>
						<div class="testimonial-entry-content">
							<?php echo apply_filters( 'themify_builder_module_content', $content['content_testimonial'] ); ?>
						</div>
                    <?php endif; ?>
                    <?php if (!empty($image)): ?>
						<figure class="tf_rel testimonial-image<?php if($isSlider===true):?> tf_lazy<?php endif;?>">
							<?php echo $image ?>
						</figure>
                    <?php endif; ?>

                    <?php if (!empty($content['person_name_testimonial'])): ?>
                        <div class="testimonial-author">
                            <div class="person-name"><?php echo $content['person_name_testimonial'] ?></div>
			    <?php if (!empty($content['person_position_testimonial'])): ?>
				<span class="person-position"><?php echo $content['person_position_testimonial'] ?></span>
			    <?php endif; ?>
			    <?php if (!empty($content['company_testimonial'])): ?>
				<div class="person-company">
				    <?php if (!empty($content['company_website_testimonial'])): ?>
					<a href="<?php echo $content['company_website_testimonial'] ?>"><?php echo $content['company_testimonial'] ?></a>
				    <?php else: ?>
					<?php echo $content['company_testimonial'] ?>
				    <?php endif; ?>
				</div>
			    <?php endif; ?>
                        </div>
                    <?php endif; ?>
                </div>
                <!-- /testimonial-content -->
            </div>
        </div>
    <?php endforeach; ?>
<?php endif; 
