<?php
if (!defined('ABSPATH'))
    exit; // Exit if accessed directly
/**
 * Template Slider Text
 * 
 * Access original fields: $args['settings']
 * @author Themify
 */
if (!empty($args['settings']['video_content_slider'])):?>
    <?php foreach ($args['settings']['video_content_slider'] as $video): ?>
        <div class="swiper-slide">
            <div class="slide-inner-wrap"<?php if ($args['settings']['margin'] !== ''): ?> style="<?php echo $args['settings']['margin']; ?>"<?php endif; ?>>
                <?php if (!empty($video['video_url_slider'])): 
			$video_url = parse_url($video['video_url_slider']);
			$isLocal=$video_url['host'] !== 'www.youtube.com'
			     && $video_url['host'] !== 'youtube.com'
			     && $video_url['host'] !== 'youtu.be'
			     && $video_url['host'] !== 'www.vimeo.com'
			     && $video_url['host'] !== 'vimeo.com'
			     && $video_url['host'] !== 'player.vimeo.com';
		    ?>
                    <div <?php if($isLocal===false):?> data-url="<?php echo $video['video_url_slider']?>"<?php endif;?>class="tf_rel tf_lazy tf_overflow slide-image video-wrap"<?php echo !empty($video['video_width_slider'])? 'style="max-width:' . $video['video_width_slider']. 'px;"' : ''; ?>>
	                <?php 
	                if ( $isLocal===true) {
		               echo wp_video_shortcode(array('src' => $video['video_url_slider'],'preload'=>'none'));
	                }  
			?>		
                    </div><!-- /video-wrap -->
                <?php endif; ?>

                <div class="slide-content tb_text_wrap">
                    <?php if(!empty($video['video_title_link_slider']) || !empty($video['video_title_slider'])): ?>
                    <h3 class="slide-title">
                        <?php if (!empty($video['video_title_link_slider'])): ?>
                            <a href="<?php echo esc_url($video['video_title_link_slider']); ?>"<?php echo 'yes' === $args['settings']['open_link_new_tab_slider'] ? ' target="_blank" rel="noopener"' : ''; ?>><?php echo $video['video_title_slider']; ?></a>
                        <?php elseif (!empty($video['video_title_slider'])) : ?>
                            <?php echo $video['video_title_slider']; ?>
                        <?php endif; ?>
                    </h3>
                    <?php endif; ?>
                    <div class="video-caption">
                        <?php
                        if (isset($video['video_caption_slider'])) {
                            echo apply_filters('themify_builder_module_content', $video['video_caption_slider']);
                        }
                        ?>
                    </div>
                    <!-- /video-caption -->
                </div><!-- /video-content -->
            </div>
        </div>
    <?php endforeach; // end loop video  ?>
<?php endif; 
