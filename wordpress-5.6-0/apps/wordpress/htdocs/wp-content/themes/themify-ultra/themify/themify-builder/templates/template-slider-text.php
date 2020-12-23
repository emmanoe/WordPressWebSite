<?php
if (!defined('ABSPATH'))
    exit; // Exit if accessed directly
/**
 * Template Slider Text
 * 
 * Access original fields: $args['settings']
 * @author Themify
 */
if (!empty($args['settings']['text_content_slider'])):?>
    <?php foreach ($args['settings']['text_content_slider'] as $content): ?>
         <div class="swiper-slide">
            <div class="slide-inner-wrap"<?php if ($args['settings']['margin'] !== ''): ?> style="<?php echo $args['settings']['margin']; ?>"<?php endif; ?>>
                <div class="slide-content tb_text_wrap">
                    <?php
                    if (isset($content['text_caption_slider'])) {
                        echo apply_filters('themify_builder_module_content', $content['text_caption_slider']);
                    }
                    ?>
                </div><!-- /slide-content -->
            </div>
        </div>
    <?php endforeach; ?>
<?php endif; 