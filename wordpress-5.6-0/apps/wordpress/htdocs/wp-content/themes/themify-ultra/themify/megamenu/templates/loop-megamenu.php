<?php
/**
 * Template for displaying posts inside mega menus
 *
 * To override this template copy it to <theme_root>/includes/ directory.
 *
 * @package themify
 * @since 1.0.0
 */

global $post,$product;
$dimensions = apply_filters( 'themify_mega_menu_image_dimensions', array(
	'w'  => themify_get( 'setting-mega_menu_image_width', 180,true ),
	'h' => themify_get( 'setting-mega_menu_image_height', 120,true ),
	'disable_lazy'=>true
) );
$link=themify_permalink_attr(array(),false);
$cl=$link['cl']!==''?' class="'.$link['cl'].'"':'';
$img=themify_get_image($dimensions);
?>
<article class="post type-<?php echo get_post_type(); ?>">
    <?php if(!empty($img)): ?>
    <figure class="post-image">
		<a href="<?php echo $link['href']; ?>"<?php echo $cl?>>
			<?php echo themify_get_image($dimensions); ?>
		</a>
	</figure>
    <?php endif; ?>
	<p class="post-title">
		<a href="<?php echo $link['href']; ?>"<?php echo $cl?>>
			<?php the_title_attribute( 'post='.$post->ID ); ?>
		</a>
	</p>
	<?php if(isset($product)){
	    echo $product->get_price_html(); 
	}?>
</article>
<!-- /.post -->
