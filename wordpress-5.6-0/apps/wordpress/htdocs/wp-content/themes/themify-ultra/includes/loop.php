<?php
/**
 * Template for generic post display.
 * @package themify
 * @since 1.0.0
 */
global $themify;
$posfix = !empty($themify->post_module_hook) ? '_module' : '';
?>
<?php themify_post_before($posfix); // hook ?>
<article id="post-<?php the_id(); ?>" <?php post_class( 'post clearfix' ); ?>>
	<?php themify_post_start($posfix); // hook ?>
    
	<?php if( $themify->hide_image !== 'yes' && ('below' !== $themify->media_position  || $themify->post_layout_type==='overlay')){ 
	    if($themify->unlink_title!=='yes' || $themify->unlink_image!=='yes'):?>
		<a <?php themify_permalink_attr(); ?> aria-label="<?php the_title_attribute() ?>" data-post-permalink="yes" style="display: none;"></a>
	    <?php endif;
	    themify_post_media();
	}?>
	<div class="post-content">
		<div class="post-content-inner">

			<?php if ( $themify->hide_date !== 'yes' ) : ?>
				<?php themify_theme_post_date(); ?>
			<?php endif; //post date ?>

			<?php themify_post_title(); ?>

			<?php if ( $themify->hide_meta !== 'yes' ) : ?>
				<p class="post-meta entry-meta">
					<?php if ( $themify->hide_meta_author !== 'yes' ): ?>
						<span class="post-author"><?php echo themify_get_author_link() ?></span>
					<?php endif; ?>

					<?php themify_meta_taxonomies('','<span class="separator">, </span>'); ?>

					<?php if ( $themify->hide_meta_tag !== 'yes' ): ?>
						<?php the_terms( get_the_id(), 'post_tag', ' <span class="post-tag">', '<span class="separator">, </span>', '</span>' ); ?>
					<?php endif; // meta tag ?>

					<?php themify_comments_popup_link(array('icon'=>'fas comment'));?>
				</p>
				<!-- /post-meta -->
			<?php endif; //post meta ?>

			<?php if($themify->hide_image !== 'yes' && 'below' === $themify->media_position && $themify->post_layout_type!=='overlay') themify_post_media(); ?>

			<?php themify_post_content()?>

		</div>
		<!-- /.post-content-inner -->
	</div>
	<!-- /.post-content -->
	<?php themify_post_end($posfix); // hook ?>

</article>
<!-- /.post -->
<?php themify_post_after($posfix); // hook 
