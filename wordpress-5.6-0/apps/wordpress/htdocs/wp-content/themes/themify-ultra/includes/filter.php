<?php
/**
 * Partial template that displays an entry filter.
 *
 * Created by themify
 * @since 1.0.0
 */

global $themify;

$cats = is_array( $themify->query_category )?implode(',', $themify->query_category):$themify->query_category;
$taxo = $themify->query_taxonomy;
$args = "show_option_none=0&echo=0&hierarchical=0&show_count=0&title_li=&include=$cats&taxonomy=$taxo";

if( is_category() && themify_check( 'setting-filter-category',true ) ) {
	$category = get_queried_object();

	if( ! empty( $category ) ) {
		$args .= '&child_of=' . $category->term_id;
	}
}

$list_categories = wp_list_categories( $args );

if( ! empty( $list_categories ) ) {
	Themify_Enqueue_Assets::preFetchMasonry();
	Themify_Enqueue_Assets::loadThemeStyleModule('post-filter');
	printf( '<ul class="post-filter tf_textc tf_opacity">%s</ul>', $list_categories );
}