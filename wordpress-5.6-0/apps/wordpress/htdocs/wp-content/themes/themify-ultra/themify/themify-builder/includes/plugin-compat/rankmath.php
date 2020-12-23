<?php
/**
 * Builder Plugin Compatibility Code
 *
 * @package    Themify_Builder
 * @subpackage Themify_Builder/classes
 */

class Themify_Builder_Plugin_Compat_RankMath {

	static function init() {
		add_filter( 'themify_builder_ajax_admin_vars', array( __CLASS__, 'tb_rank_math_content_filter' ) );
		add_action( 'wp_ajax_tb_rank_math_content_ajax', array( __CLASS__, 'tb_rank_math_content_ajax' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'RankMath_compatibility' ), 10 );
		add_filter( 'rank_math/sitemap/content_before_parse_html_images', array( __CLASS__, 'sitemap' ), 10, 2 );
	}

	/*
	 * Localize builder output for Rank Math Plugin integration
	 * */
	public static function tb_rank_math_content_filter($vars){
		global $ThemifyBuilder;
		$vars['builder_output'] = $ThemifyBuilder->get_builder_output( Themify_Builder_Model::get_ID() );

		return $vars;
	}

	/*
	 * Send back builder output base on current builder data for Rank Meta Plugin integration
	 * */
	public static function tb_rank_math_content_ajax(){
		Themify_Builder_Component_Base::retrieve_template('builder-output.php', array('builder_output' => $_POST['data'], 'builder_id' => $_POST['id']), '', '', true);
		wp_die();
	}

	/**
	 * Load Admin Scripts.
	 *
	 * @access public
	 * @param string $hook
	 */
	public static function RankMath_compatibility( $hook ) {
		if (
			in_array( $hook, array( 'post-new.php', 'post.php' ), true )
			&& Themify_Builder_Model::hasAccess()
			&& in_array( get_post_type(), themify_post_types(), true )
		) {
			wp_enqueue_script( 'themify-builder-plugin-compat', themify_enque(THEMIFY_BUILDER_URI .'/js/themify.builder.plugin.compat.js'), array('jquery', 'wp-hooks', 'rank-math-analyzer'), THEMIFY_VERSION, true );
		}
	}

	/**
	 * Fix the image counter in Rank Math site map.
	 *
	 * Append a plain text version of Builder output, before Rank Math
	 * searches for images in the post content.
	 *
	 * @return string
	 */
	public static function sitemap( $content, $post_id ) {
		global $ThemifyBuilder, $ThemifyBuilder_Data_Manager;

		$builder_data = $ThemifyBuilder->get_builder_data( $post_id );
		$plain_text = $ThemifyBuilder_Data_Manager->_get_all_builder_text_content( $builder_data );
		$plain_text = do_shortcode( $plain_text ); // render shortcodes that might be in the Themify_Builder_Component_Module::get_plain_text()

		return $content . $plain_text;
	}
}