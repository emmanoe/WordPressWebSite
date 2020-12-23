<?php
if (!defined('ABSPATH'))
    exit; // Exit if accessed directly
/**
 * Template Gallery Lightboxed
 * 
 * Access original fields: $fields_args
 * @author Themify
 */
$alt = isset($args['settings']['gallery_images'][0]->post_excerpt) ? $args['settings']['gallery_images'][0]->post_excerpt : '';

/* if no thumbnail is set   for the gallery, use the first image */
if(empty($args['settings']['thumbnail_gallery'])){
	$thumbnail = wp_get_attachment_url($args['settings']['gallery_images'][0]->ID);
	$t_post=null;
}else{
    $thumbnail = $args['settings']['thumbnail_gallery'];
	$thumbnail_id = attachment_url_to_postid($args['settings']['thumbnail_gallery']);
	$t_post = get_post($thumbnail_id);
}
$thumbnail = themify_get_image(array('src'=>$thumbnail,'w'=>$args['settings']['thumb_w_gallery'],'h'=>$args['settings']['thumb_h_gallery'],'alt'=>$alt));

foreach ($args['settings']['gallery_images'] as $key => $image):
    $is_thumbnail = 0 === $key && !empty($args['settings']['thumbnail_gallery']);
    ?>
    <dl class="gallery-item<?php if($key===0):?> tf_hidden<?php endif;?>"<?php if($key!==0):?> style="display:none"<?php endif;?>>
        <?php
        $link = wp_get_attachment_url($image->ID);
        $img = wp_get_attachment_image_src($image->ID, 'full');
        $title = $is_thumbnail===true && $t_post!==null? $t_post->post_title : $image->post_title;
        $caption = $is_thumbnail===true && $t_post!==null? $t_post->post_excerpt : $image->post_excerpt;
        if ( ! empty( $link ) ) : ?>
            <dt class="gallery-icon">
				<a data-title="<?php echo esc_attr($args['settings']['lightbox_title']) ?>" href="<?php echo esc_url($link) ?>" title="<?php esc_attr_e($title) ?>" data-rel="<?php echo esc_attr( $args['module_ID'] ); ?>" class="themify_lightbox">
		<?php endif; ?>

		<?php echo $key === 0 ? $thumbnail : $img[1]; ?>

		<?php if ( ! empty( $link ) ) : ?>
            </a></dt>
        <?php endif; ?>

        <dd<?php if ($args['settings']['gallery_image_title'] === 'yes' && $title !== ''): ?> class="wp-caption-text gallery-caption"<?php endif; ?>>
            <?php if ($args['settings']['gallery_image_title'] === 'yes' && $title!==''): ?>
                <strong class="themify_image_title"><?php echo $title; ?></strong>
            <?php endif; ?>
            <?php if ($args['settings']['gallery_exclude_caption'] !== 'yes' && $caption!==''): ?>
                <span class="themify_image_caption"><?php echo $caption; ?></span>
            <?php endif ?>
        </dd>
    </dl>

<?php endforeach; // end loop
$t_post = null;
