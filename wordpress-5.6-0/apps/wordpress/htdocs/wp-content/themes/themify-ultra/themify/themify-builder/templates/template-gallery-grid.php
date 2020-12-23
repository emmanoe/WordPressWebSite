<?php
if (!defined('ABSPATH'))
    exit; // Exit if accessed directly
/**
 * Template Gallery Grid
 * 
 * Access original fields: $args['mod_settings']
 * @author Themify
 */
Themify_Builder_Model::load_module_self_style($args['mod_name'],'grid');
$pagination = $args['settings']['gallery_pagination'] && $args['settings']['gallery_per_page'] > 0;
$disable = Themify_Builder_Model::is_img_php_disabled();
if ($pagination) {
    $total = count($args['settings']['gallery_images']);
    if ($total <= $args['settings']['gallery_per_page']) {
        $pagination = false;
    } else {
        $is_current_gallery = !empty($_GET['tb_gallery']) ? $args['module_ID'] === $_GET['tb_gallery'] : true;
        $current = isset($_GET['builder_gallery']) && $is_current_gallery ? $_GET['builder_gallery'] : 1;
        $offset = $args['settings']['gallery_per_page'] * ( $current - 1 );
        $args['settings']['gallery_images'] = array_slice($args['settings']['gallery_images'], $offset, $args['settings']['gallery_per_page'], true);
    }
}
$columns = $args['columns'];
?>
<div class="module-gallery-grid gallery-columns-<?php echo $columns?><?php if($args['settings']['layout_masonry'] === 'masonry'):?> gallery-masonry<?php endif;?> tf_clear">
	<?php foreach ($args['settings']['gallery_images'] as $image) :
		$caption = !empty($image->post_excerpt) ? $image->post_excerpt : '';
		$title = $image->post_title;
		?>
		<dl class="gallery-item">
			<dt class="gallery-icon">
			<?php
			if ($args['settings']['link_opt'] === 'file') {
				$link = wp_get_attachment_image_src($image->ID, $args['settings']['link_image_size']);
				$link = $link[0];
			} elseif ('none' === $args['settings']['link_opt']) {
				$link = '';
			} else {
				$link = get_attachment_link($image->ID);
			}
			$link_before = '' !== $link ? sprintf(
				'<a data-title="%s" title="%s" href="%s" data-rel="%s" class="themify_lightbox">',
				esc_attr( $args['settings']['lightbox_title'] ),
				esc_attr( $caption ),
				esc_url( $link ),
				$args['module_ID']
			) : '';
			$link_before = apply_filters('themify_builder_image_link_before', $link_before, $image, $args['settings']);
			$link_after = '' !== $link ? '</a>' : '';
			$img = $disable===true?wp_get_attachment_image($image->ID, $args['settings']['image_size_gallery']):themify_get_image(array('src'=>$image->ID,'w'=>$args['settings']['thumb_w_gallery'],'h'=>$args['settings']['thumb_h_gallery']));
			echo!empty($img) ? $link_before . $img . $link_after : '';
			?>
			</dt>
			<dd<?php if (($args['settings']['gallery_image_title'] === 'yes' && $title!=='' ) || ( $args['settings']['gallery_exclude_caption'] !== 'yes' && $caption!=='' )) : ?> class="wp-caption-text gallery-caption"<?php endif; ?>>
				<?php if ($args['settings']['gallery_image_title'] === 'yes' && $title!=='') : ?>
					<strong class="themify_image_title tf_block"><?php echo $title ?></strong>
				<?php endif; ?>
				<?php if ($args['settings']['gallery_exclude_caption'] !== 'yes' && $caption!=='') : ?>
					<span class="themify_image_caption"><?php echo $caption ?></span>
				<?php endif; ?>
			</dd>
		</dl>
	<?php endforeach; // end loop  ?>
</div>
<?php if ($pagination) : ?>
    <div class="pagenav tf_clear tf_textc clearfix">
        <?php
        /**
         * fix paginate_links url in modules loaded by Ajax request: the url does not match the actual page url.
         * #5345
         * @note: paginate_links seems buggy with successive requests, the url parameters get jumbled up;
         * hence the remove_query_args to remove the parameter from url before it's added in by paginate_links.
         */
        $key = themify_is_ajax() ? 'HTTP_REFERER' : 'REQUEST_URI';
        $base = remove_query_arg('builder_gallery', $_SERVER[$key]);
        $base = remove_query_arg('tb_gallery', $base);
        $format = get_option( 'permalink_structure' ) === '' ? '&' : '?';

        echo paginate_links(array(
            'base' => $base . '%_%',
            'current' => $current,
            'total' => ceil($total / $args['settings']['gallery_per_page']),
            'format' => $format . 'builder_gallery=%#%',
			'add_args'=>array('tb_gallery'=>$args['module_ID']),
			'prev_next' => false,
        ));
        ?>
    </div>
<?php endif;
