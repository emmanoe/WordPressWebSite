<?php
/**
 * Template for common archive
 * @package themify
 * @since 1.0.0
 */
get_header();
?>
<!-- layout-container -->
<div id="layout" class="pagewidth tf_box clearfix">
    <?php themify_content_before(); // hook ?>
    <!-- content -->
    <main id="content" class="tf_box clearfix">
	<?php themify_page_output();?>
    </main>
    <!-- /content -->
    <?php
    themify_content_after(); // hook 
    themify_get_sidebar();
    ?>
</div>
<!-- /layout-container -->
<?php get_footer();