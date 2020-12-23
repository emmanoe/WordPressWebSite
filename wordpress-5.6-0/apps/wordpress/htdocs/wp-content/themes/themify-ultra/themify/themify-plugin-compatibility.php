<?php
/**
 * Provide compatibility with third party plugins
 *
 * @package Themify
 */
if (themify_is_woocommerce_active()) {

    add_action('woocommerce_init', 'themify_woocommerce_init');

    function themify_woocommerce_init() {
		remove_action('woocommerce_before_main_content', 'woocommerce_output_content_wrapper');
		remove_action('woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end');
		remove_action('woocommerce_sidebar', 'woocommerce_get_sidebar');
		add_action('woocommerce_before_main_content', 'themify_before_wrap_content', 1);
		add_action('woocommerce_after_main_content', 'themify_after_wrap_content', 100);
		add_action('template_redirect', 'themify_set_woocomerce_vars', 100);
    }
	
	function themify_set_woocomerce_vars(){
	    global $themify;
	    if ( $themify->page_title === 'yes' && themify_is_shop() ) {
		    add_filter( 'woocommerce_show_page_title', '__return_false', 100 );
	    }
	}
}
if (function_exists('icl_register_string')) {

    /**
     * Make dynamic strings in Themify theme available for translation with WPML String Translation
     * @param $context
     * @param $name
     * @param $value
     * @since 1.5.3
     */
    function themify_register_wpml_strings($context, $name, $value) {
	$value = maybe_unserialize($value);
	if (is_array($value)) {
	    foreach ($value as $k => $v) {
		themify_register_wpml_strings($context, $k, $v);
	    }
	} else {
	    $translatable = array(
		'setting-footer_text_left',
		'setting-footer_text_right',
		'setting-homepage_welcome',
		'setting-action_text',
	    );
	    foreach (array('one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten') as $option) {
		$translatable[] = 'setting-slider_images_' . $option . '_title';
		$translatable[] = 'setting-header_slider_images_' . $option . '_title';
		$translatable[] = 'setting-footer_slider_images_' . $option . '_title';
	    }
	    if (stripos($name, 'title_themify-link') || in_array($name, $translatable, true)) {
		icl_register_string($context, $name, $value);
	    }
	}
    }

    themify_register_wpml_strings('Themify', 'Themify Option', themify_get_data());
}

/**
 * Support for Sensei plugin
 *
 * @since 2.2.5
 */
function themify_sensei_support() {
    if (function_exists('Sensei')) {
	global $woothemes_sensei;

	add_theme_support('sensei');
	remove_action('sensei_before_main_content', array($woothemes_sensei->frontend, 'sensei_output_content_wrapper'), 10);
	remove_action('sensei_after_main_content', array($woothemes_sensei->frontend, 'sensei_output_content_wrapper_end'), 10);
	add_action('sensei_before_main_content', 'themify_before_wrap_content', 1);
	add_action('sensei_after_main_content', 'themify_after_wrap_content', 100);
    }
}

add_action('after_setup_theme', 'themify_sensei_support');
// Dokan Pro - rma module compatibility
if (class_exists('Dokan_Pro')) {
    add_action('dokan_before_refund_policy', 'themify_dokan_rma_before');

    function themify_dokan_rma_before() {
	global $ThemifyBuilder;
	remove_filter('the_content', array($ThemifyBuilder, 'builder_show_on_front'), 11);
    }

    add_action('dokan_after_refund_policy', 'themify_dokan_rma_after');

    function themify_dokan_rma_after() {
	global $ThemifyBuilder;
	add_filter('the_content', array($ThemifyBuilder, 'builder_show_on_front'), 11);
    }

}


if (!function_exists('themify_before_wrap_content')) {

    function themify_before_wrap_content() {
		if(function_exists('themify_before_shop_content') && current_action()==='woocommerce_before_main_content'){
			return;
		}
	?>
	<!-- layout -->
	<div id="layout" class="pagewidth tf_box clearfix">
	    <?php themify_content_before(); // Hook ?>
	    <!-- content -->
	    <main id="content" class="tf_box clearfix">
	    <?php themify_content_start(); // Hook
    }
}

if (!function_exists('themify_after_wrap_content')) {

    function themify_after_wrap_content() {
		if(function_exists('themify_after_shop_content') && current_action()==='woocommerce_after_main_content'){
			return;
		}
		themify_content_end(); // Hook 
		?>
	    </main>
	    <!-- /#content -->
	<?php
	themify_content_after(); // Hook 
	themify_get_sidebar();
	?>
	</div><!-- /#layout -->
	<?php
    }
}

if ( defined( 'WP_ROCKET_VERSION' ) ) {
	/**
	 * Clear WP Rocket cache after saving Themify settings
	 *
	 * @return array
	 */
	function themify_wp_rocket_clear_cache( $data ) {
		rocket_clean_domain();
		rocket_clean_minify();

		return $data;
	}
	add_filter( 'themify_save_data', 'themify_wp_rocket_clear_cache' );
}

/**
 * Support for Nextgen gallery plugin #9340
 *
 * @since 5.0.9
 */
if (defined('NGG_PLUGIN') && themify_check('setting-cache-html',true) && !defined('NGG_DISABLE_RESOURCE_MANAGER')){
    define('NGG_DISABLE_RESOURCE_MANAGER', true);
}