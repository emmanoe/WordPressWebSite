<?php
/**
 * Builder Plugin Compatibility Code
 *
 * @package    Themify_Builder
 * @subpackage Themify_Builder/classes
 */

class Themify_Builder_Plugin_Compat_DuplicatePosts {

	static function init() {
		add_filter( 'option_duplicate_post_blacklist', array( __CLASS__, 'dp_meta_backlist'), 10, 2 );
		add_action('dp_duplicate_post', array( __CLASS__, 'dp_duplicate_builder_data'), 10, 2);
		add_action('dp_duplicate_page', array( __CLASS__, 'dp_duplicate_builder_data'), 10, 2);
	}

	/**
	 * Backlist builder meta_key from duplicate post settings custom fields
	 *
	 * @access public
	 * @param string $value
	 * @param string $option
	 * @return string
	 */
	public static function dp_meta_backlist( $value, $option ) {
		$list_arr = explode(',', $value );
		$list_arr[] = '_themify_builder_settings_json';
		$value = implode( ',', $list_arr );
		return $value;
	}

	/**
	 * Action to duplicate builder data.
	 *
	 * @access public
	 * @param int $new_id
	 * @param object $post
	 */
	public static function dp_duplicate_builder_data( $new_id, $post ) {
		global $ThemifyBuilder, $ThemifyBuilder_Data_Manager;
		$builder_data = $ThemifyBuilder->get_builder_data( $post->ID ); // get builder data from original post
		$ThemifyBuilder_Data_Manager->save_data( $builder_data, $new_id ); // save the data for the new post
	}
}