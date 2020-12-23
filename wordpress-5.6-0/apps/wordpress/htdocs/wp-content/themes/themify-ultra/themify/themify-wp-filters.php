<?php
/**
 * Changes to WordPress behavior and interface applied by Themify framework
 *
 * @package Themify
 */

/**
 * Add Themify Settings link to admin bar
 * @since 1.1.2
 */
function themify_admin_bar() {
	global $wp_admin_bar;
	if ( !is_super_admin() || !is_admin_bar_showing() )
		return;
	$wp_admin_bar->add_menu( array(
		'id' => 'themify-settings',
		'parent' => 'appearance',
		'title' => __( 'Themify Settings', 'themify' ),
		'href' => admin_url( 'admin.php?page=themify' )
	));
}
add_action( 'wp_before_admin_bar_render', 'themify_admin_bar' );

/**
 * Generate CSS code from Styling panel
 * deprecated should be removed
 */

function themify_get_css() {
	$data = themify_get_data();
	$output = '';
	/**
	 * Stores CSS rules
	 * @var string
	 */
	$module_styling = '';
	if( is_array( $data ) ) {
		$new_arr = array();
		foreach( $data as $name => $value ) {
			$array = explode( '-', $name );
			$path = '';
			foreach($array as $part){
				$path .= "[$part]";
			}
			$new_arr[ $path ] = $value;
		}
		$themify_config = themify_convert_brackets_string_to_arrays( $new_arr );

		if( isset( $themify_config['styling'] ) && is_array( $themify_config['styling'] ) ) {
			foreach( $themify_config['styling'] as $nav => $value ) {
				foreach( $value as $element => $val ) {
					$temp = '';
					foreach( $val as $attribute => $v ) {
						$attribute = str_replace('_', '-', $attribute);
						if( !empty( $v['value'] )) {
							switch( $attribute ) {
								case 'border':
									foreach( $v['value'] as $key => $val ) {
										if( '' == $val ) {
											if( strpos( $key, 'style' ) === false ) {
											    $v['value'][$key] = strpos( $key, 'color' ) ?0:'000000';
											} else {
												$v['value'][$key] = 'solid';
											}
										}
									}
									if( !empty( $v['value']['checkbox'] )) {
										$temp .= 'border: '.$v['value']['same'].'px '.$v['value']['same_style'].' #'.$v['value']['same_color'].";\n";
									} else {
										if( !empty( $v['value']['top'] ) && !empty( $v['value']['top_style'] ) && !empty( $v['value']['top_color'] )) {
											$temp .= 'border-top: '.$v['value']['top'].'px '.$v['value']['top_style'].' ' . themify_sanitize_hex_color( $v['value']['top_color'] ) .";\n";
										}
										if ( !empty( $v['value']['right'] ) && !empty( $v['value']['right_style'] ) && !empty( $v['value']['right_color'] )) {
											$temp .= 'border-right: '.$v['value']['right'].'px '.$v['value']['right_style'].' ' . themify_sanitize_hex_color( $v['value']['right_color'] ) .";\n";
										}
										if ( !empty( $v['value']['bottom'] ) && !empty( $v['value']['bottom_style'] ) && !empty( $v['value']['bottom_color'] )) {

											$temp .= 'border-bottom: '.$v['value']['bottom'].'px '.$v['value']['bottom_style'].' ' . themify_sanitize_hex_color( $v['value']['bottom_color'] ) . ";\n";
										}
										if ( !empty( $v['value']['left'] ) && !empty( $v['value']['left_style'] ) && !empty( $v['value']['left_color'] )) {
											$temp .= 'border-left: '.$v['value']['left'].'px '.$v['value']['left_style'].' ' . themify_sanitize_hex_color( $v['value']['left_color'] ) .";\n";
										}
									}
								break;
								case 'background-position':
									if ( !empty( $v['value']['x'] ) && !empty( $v['value']['y'] ) ) {
										foreach ( $v['value'] as $key => $val ) {
											if ( $val == '' ) {
												$v['value'][$key] = 0;
											}
										}
										$temp .= $attribute.': ';
										$temp .= $v['value']['x'].' '.$v['value']['y'].";\n";
									}
								break;
								case 'padding':
									if ( !empty( $v['value']['checkbox'] )) {
										$temp .= $attribute.': ';
										$temp .= $v['value']['same'].'px'.";\n";
									} else {
										if ( !empty( $v['value']['top'] )) {
											$temp .= 'padding-top: '.$v['value']['top']."px;\n";
										}
										if ( !empty( $v['value']['right'] )) {
											$temp .= 'padding-right: '.$v['value']['right']."px;\n";
										}
										if ( !empty( $v['value']['bottom'] )) {
											$temp .= 'padding-bottom: '.$v['value']['bottom']."px;\n";
										}
										if ( !empty( $v['value']['left'] )) {
											$temp .= 'padding-left: '.$v['value']['left']."px;\n";
										}
									}
								break;
								case 'margin':
									if ( !empty( $v['value']['checkbox'] )) {
										$temp .= $attribute.': ';
										$temp .= $v['value']['same'].'px'.";\n";
									} else {
										if ( !empty( $v['value']['top'] ) ) {
											$temp .= 'margin-top: '.$v['value']['top']."px;\n";
										}
										if ( !empty( $v['value']['right'] )) {
											$temp .= 'margin-right: '.$v['value']['right']."px;\n";
										}
										if ( !empty( $v['value']['bottom'] )  ) {
											$temp .= 'margin-bottom: '.$v['value']['bottom']."px;\n";
										}
										if ( !empty( $v['value']['left'] ) ) {
											$temp .= 'margin-left: '.$v['value']['left']."px;\n";
										}
									}
								break;
								case 'color':
									if ( !empty( $v['value']['value'] )&& $v['value']['value'] !== ' ' ) {
										$temp .= $attribute.': ';
										$temp .= themify_sanitize_hex_color( $v['value']['value'] ) . ";\n";
									}
								break;
								case 'background-color':
									if ( !empty( $v['value']['transparent'] ) ) {
										$temp .= $attribute.": transparent;\n";
									} elseif ( !empty( $v['value']['value'] ) && $v['value']['value'] !== ' ' ) {
										$temp .= $attribute.': ';
										$temp .= themify_sanitize_hex_color( $v['value']['value'] ) .";\n";
									}
								break;
								case 'background-image':
									if ( !empty( $v['value']['value'] ) && $v['value']['value'] !== ' ' ) {
										$temp .= $attribute.': ';
										$temp .= 'url('.$v['value']['value'].')'.";\n";
									} elseif ( isset( $v['value']['none'] ) && 'on' === $v['value']['none'] ) {
										$temp .= $attribute.': ';
										$temp .= "none;\n";
									}
								break;
								case 'background-repeat':
									if ( !empty( $v['value']['value'] ) && $v['value']['value'] !== ' ' ) {
										$temp .= $attribute.': ';
										$temp .= $v['value']['value'].";\n";
									}
								break;
								case 'font-family':
									if ( !empty( $v['value']['value'] ) &&  $v['value']['value'] !== ' ' ) {
										$temp .= $attribute.': ';
                                                                                $temp .= '"' . $v['value']['value'] . '"' .";\n";
                                                                        }
								break;
								case 'line-height':
									if ( !empty( $v['value']['value'] ) && $v['value']['value'] !== ' ' ) {
										$temp .= $attribute.': ';
										$temp .= $v['value']['value'].$v['value']['unit'].";\n";
									}
								break;
								case 'position':
									if ( !empty( $v['value']['value'] ) && $v['value']['value'] !== ' ' ) {
										$temp .= $attribute.': ';
										$temp .= $v['value']['value'].";\n";
										if($v['value']['value'] === 'absolute' || $v['value']['value'] === 'fixed'){
											if($v['value']['x_value'] != '' && $v['value']['x_value'] != ' '){
												$temp .= $v['value']['x'].': '.$v['value']['x_value']."px;\n";
											}
											if($v['value']['y_value'] != '' && $v['value']['y_value'] !== ' '){
												$temp .= $v['value']['y'].': '.$v['value']['y_value']."px;\n";
											}
										}
									}
								break;
								default:
									if ( !empty( $v['value']['value'] )&& $v['value']['value'] !== ' ' ) {
										$temp .= $attribute.': ';
										$temp .= $v['value']['value'];
										if(isset($v['value']['unit'])){
											$temp .= $v['value']['unit'];
										}
										$temp .= ";\n";
									}
								break;
							}
						}
					}
					if($temp != '' && $temp != ' '){

						$style_selector = themify_get_styling_selector('id', $element, $nav, true);
						if ( $style_selector != '' ) {
							$module_styling .= $style_selector." {\n";
							$module_styling .= $temp;
							$module_styling .= "}\n\n";
						}
					}
				}
			}
		}
	} else {
		$output = '<style type="text/css">/* ' . __('No Values in the Database', 'themify') . ' */</style>';
	}
	$module_styling_before = "<!-- modules styling -->\n<style type='text/css'>\n";
	$module_styling_after = "</style>";
	if( '' != $module_styling ){
		$output .= $module_styling_before . $module_styling . $module_styling_after;
	}
	echo "\n\n",$output;
}

/**
 * Add different CSS classes to body tag.
 * Outputs:
 * 		skin name
 * 		layout
 * @param Array
 * @return Array
 * @since 1.2.2
 */
function themify_body_classes( $classes ) {
	global $themify;

	// Add skin name
	$skin = themify_get_skin();
	if($skin===false){
	    $skin='default';
	}
	$classes[] = 'skin-'.$skin;
	$classes[] = themify_is_shop() || is_singular()?themify_get( 'content_width','default_width' ):'default_width';
	if ( is_singular() && post_password_required( get_the_ID() )) {
		$classes[] = 'entry-password-required';
	}
	if( themify_is_query_page() ) {
		$classes[] = 'query-page';
		$classes[] = isset($themify->query_post_type) ? 'query-'.$themify->query_post_type: 'query-post';
	}

	// If still empty, set default
	if( apply_filters('themify_default_layout_condition', '' == $themify->layout) ){
		$themify->layout = apply_filters('themify_default_layout', 'sidebar1');
	}
	$classes[] = $themify->layout;

	// non-homepage pages
	if( !is_home() && !is_front_page()) {
		$classes[] = 'no-home';
	}

	// if the page is being displayed in lightbox
	if( isset( $_GET['iframe'] ) && $_GET['iframe'] === 'true' ) {
		$classes[] = 'lightboxed';
	}

	// Add Accessibility classes
	$acc_link=themify_get('setting-acc_lfo','',true);
	if('h'===$acc_link || 'n'===$acc_link){
		$classes[] = 'h'===$acc_link?'tf_focus_heavy':'tf_focus_none';
	}
	if('l'===themify_get('setting-acc_fs','',true)){
		$classes[] = 'tf_large_font';
	}
	
	return apply_filters('themify_body_classes', $classes);
}
add_filter( 'body_class', 'themify_body_classes' );

/**
 * Adds classes to .post based on elements enabled for the currenty entry.
 *
 * @since 2.0.4
 *
 * @param $classes
 *
 * @return array
 */
function themify_post_class( $classes ) {
	global $themify;

	$classes[] = ( ! isset($themify->hide_title) || ( $themify->hide_title !== 'yes' ) ) ? 'has-post-title' : 'no-post-title';
	$classes[] = ( ! isset( $themify->hide_date ) || (  $themify->hide_date !== 'yes' ) ) ? 'has-post-date' : 'no-post-date';
	$classes[] = ( ! isset( $themify->hide_meta_category ) || (  $themify->hide_meta_category !== 'yes' ) ) ? 'has-post-category' : 'no-post-category';
	$classes[] = ( ! isset( $themify->hide_meta_tag ) || (  $themify->hide_meta_tag !== 'yes' ) ) ? 'has-post-tag' : 'no-post-tag';
	$classes[] = ( ! isset( $themify->hide_meta_comment ) || (  $themify->hide_meta_comment !== 'yes' ) ) ? 'has-post-comment' : 'no-post-comment';
	$classes[] = ( ! isset( $themify->hide_meta_author ) || (  $themify->hide_meta_author !== 'yes' ) ) ? 'has-post-author' : 'no-post-author';
	$classes[] = ( is_admin() && get_post_type() === 'product' ) ? 'product' : '';

	return apply_filters( 'themify_post_classes', $classes );
}
add_filter( 'post_class', 'themify_post_class' );


/**
 * Add wmode transparent and post-video container for responsive purpose
 * Remove webkitallowfullscreen and mozallowfullscreen for HTML validation purpose
 * @param string $html The embed markup.
 * @param string $url The URL embedded.
 * @return string The modified embed markup.
 */
function themify_parse_video_embed_vars($html, $url) {
	return '<div class="post-video">' . themify_make_lazy($html) . '</div>';
}

add_filter( 'embed_oembed_html', 'themify_parse_video_embed_vars', 10, 2 );

/**
 * Add extra protocols like skype: to list of allowed protocols.
 *
 * @since 2.1.8
 *
 * @param array $protocols List of protocols allowed by default by WordPress.
 *
 * @return array $protocols Updated list including extra protocols added.
 */
function themify_allow_extra_protocols( $protocols ){
	$protocols[] = 'skype';
	$protocols[] = 'sms';
	$protocols[] = 'comgooglemaps';
	$protocols[] = 'comgooglemapsurl';
	$protocols[] = 'comgooglemaps-x-callback';
	$protocols[] = 'viber';
	$protocols[] = 'facetime';
	$protocols[] = 'facetime-audio';
	$protocols[] = 'tg';
	$protocols[] = 'whatsapp';
	$protocols[] = 'ymsgr';
	$protocols[] = 'gtalk';

	return $protocols;
}
add_filter( 'kses_allowed_protocols' , 'themify_allow_extra_protocols' );

if( ! function_exists( 'themify_upload_mime_types' ) ) :
/**
 * Adds .svg and .svgz to list of mime file types supported by WordPress
 * @param array $existing_mime_types WordPress supported mime types
 * @return array Array extended with svg/svgz support
 * @since 1.3.9
 */
function themify_upload_mime_types( $existing_mime_types = array() ) {
	$existing_mime_types['svg'] = 'image/svg+xml';
	$existing_mime_types['svgz'] = 'image/svg+xml';
	$existing_mime_types['zip'] = 'application/zip';
	$existing_mime_types['json'] = 'application/json';
	$existing_mime_types['webp'] = 'image/webp';
	return $existing_mime_types;
}
endif;
add_filter( 'upload_mimes', 'themify_upload_mime_types' );

/**
 * Display an additional column in categories list
 * @since 1.1.8
 */
function themify_custom_category_header( $cat_columns ) {
    $cat_columns['cat_id'] = __( 'ID', 'themify' );
    return $cat_columns;
}
add_filter( 'manage_edit-category_columns', 'themify_custom_category_header', 10, 2 );

/**
 * Display ID in additional column in categories list
 * @since 1.1.8
 */
function themify_custom_category( $null, $column, $termid ) {
	return $termid;
}
add_filter( 'manage_category_custom_column', 'themify_custom_category', 10, 3 );


function themify_favicon_action() {
	$icon = themify_get('setting-favicon',false,true);
	if ( !empty( $icon )) {
		echo "\n\n",'<link href="' . esc_attr( themify_https_esc($icon) ) . '" rel="shortcut icon" /> ';
	}
}
add_action( 'admin_head', 'themify_favicon_action' );

if ( ! function_exists( 'themify_search_in_category' ) ) :
/**
 * Exclude Custom Post Types from Search - Filter
 *
 * @param $query
 * @return mixed
 */
function themify_search_in_category_filter( $query ) {
	if ( $query->is_search && ! is_admin() && $query->is_main_query() ) {
	    remove_action( 'pre_get_posts', 'themify_search_in_category_filter', 999 );
		$cat_search = themify_get( 'setting-search_settings','',true );
		if ( !empty( $cat_search )) {
			$query->set( 'cat', $cat_search );
		}
	}
}
endif;
add_action( 'pre_get_posts', 'themify_search_in_category_filter', 999 );

/**
 * Exclude post types from search results, per user settings
 *
 * @since 4.6.8
 */
function themify_register_post_type_args( $args, $post_type ) {
	if ( ! isset( $_GET['s'] ) )
		return $args;

	$key = $post_type === 'page' ? 'setting-search_settings_exclude' : 'setting-search_exclude_' . $post_type;
	if ( themify_get( $key,false,true ) ) {
		/**
		 * @note Side effect: removes the post type from WP_Query query when 'post_type' => 'any'
		 * @link https://developer.wordpress.org/reference/classes/wp_query/#post-type-parameters
		 */
		$args['exclude_from_search'] = true;
	}

	return $args;
}
if ( ! is_admin() )
	add_filter( 'register_post_type_args', 'themify_register_post_type_args', 10, 2 );

function themify_feed_settings_action($query){
	
	if( $query->is_feed ) {
		$v = themify_get('setting-feed_settings',null,true);
		if( !empty( $v ) ) {
			$query->set( 'cat', $v );	
		}
	}
	else{
	    remove_action('pre_get_posts','themify_feed_settings_action');
	}
}
add_action('pre_get_posts','themify_feed_settings_action');

if (! themify_check( 'setting-exclude_img_rss',true ) ) {
	add_filter( 'the_content', 'themify_custom_fields_for_feeds' );


	function themify_custom_fields_for_feeds( $content ) {
		remove_filter( 'the_content', 'themify_custom_fields_for_feeds' );
		if ( is_feed() && has_post_thumbnail() ) {
			$content = '<p>' . get_the_post_thumbnail( null, 'full' ) . '</p>' . $content;
		}
		return $content;
	}
}

// Custom Post Types in RSS
function themify_feed_custom_posts( $qv ) {
	if(isset( $qv['feed'] ) && ! isset( $qv['post_type'] ) ){
		$feed_custom_posts = explode( ',', trim( themify_get( 'setting-feed_custom_post',false,true ) ) );
		if( ! empty( $feed_custom_posts )) {
			if( in_array( 'all', $feed_custom_posts,true ) ) {
				$post_types = get_post_types( array('public' => true, 'publicly_queryable' => 'true' ) );
				$qv['post_type'] = array_diff( $post_types, array('attachment', 'tbuilder_layout', 'tbuilder_layout_part', 'section') );
			} else {
				$qv['post_type'] = $feed_custom_posts;
			}
		}
	}
	return $qv;
}
add_filter( 'request', 'themify_feed_custom_posts' );

/**
 * Show custom 404 page (function)
 */
function themify_404_page_id() {
	$pageid = themify_get( 'setting-page_404',false,true );

	if( ! empty( $pageid ) ) {
		if( defined( 'ICL_SITEPRESS_VERSION' ) ) {
			$pageid = apply_filters( 'wpml_object_id', $pageid, 'page', true );
		} 
		elseif( defined( 'POLYLANG_VERSION' ) && function_exists( 'pll_get_post' ) ) {
			$translatedpageid = pll_get_post( $pageid );
			if ( !empty( $translatedpageid ) && 'publish' === get_post_status( $translatedpageid ) ) {
				$pageid = $translatedpageid;
			}
		}
	}

	return get_post( $pageid )?$pageid:false;
}

function themify_set_404_wp_query( $pageid ) {
	global $wp_query;

	$wp_query = null;
	$wp_query = new WP_Query();
	$wp_query->query( array(
		'page_id' => $pageid,
		'suppress_filters' => true,
	) );
	$wp_query->the_post();

	return $wp_query;
}

function themify_404_init() {
	if(! is_admin() && ! is_customize_preview() && themify_404_page_id() != 0) {
		add_filter( 'the_posts', 'themify_404_display_static_page_result', 999, 2 );
		add_filter( '404_template', 'themify_404_static_template', 999 );
		add_filter( 'redirect_canonical' , '__return_false' );
	}
}
add_action( 'init', 'themify_404_init' );

function themify_404_display_static_page_result($posts, $query ) {
	if ( $query->is_404() && $query->is_main_query() ) {
		remove_filter( 'the_posts', 'themify_404_display_static_page_result', 999, 2 );
		$pageid = themify_404_page_id();
		$page_exists = get_post( $pageid );

		if ( $pageid != 0 && $page_exists ) {
			if ( empty( $posts ) &&  !$query->is_robots() && !$query->is_home() && !$query->is_feed() && !$query->is_search() && !$query->is_post_type_archive() ) {
				
				$wp_query = themify_set_404_wp_query( $pageid );
				$posts = $wp_query->posts;
				$wp_query->rewind_posts();

				add_action( 'wp', 'themify_404_header' );
				add_filter( 'body_class', 'themify_404_body_class' );
				
			} elseif (isset($posts[0]) && 'page' === $posts[0]->post_type && 1 === count( $posts )) {
				
				$curpageid = $posts[0]->ID;
				
				if ( defined( 'ICL_SITEPRESS_VERSION' ) ) {
					// WPML page id
					global $sitepress;
					$curpageid = apply_filters( 'wpml_object_id', $curpageid, 'page', $sitepress->get_default_language() );
					$pageid = apply_filters( 'wpml_object_id', $pageid, 'page', $sitepress->get_default_language() );
				}
				
				if ( $pageid == $curpageid ) {
					add_action( 'wp', 'themify_404_header' );
					add_filter( 'body_class', 'themify_404_body_class' );
				}
			}
		}
	}
	return $posts;
}

function themify_404_static_template( $template ) {
	remove_filter( '404_template', 'themify_404_static_template', 999 );

	$pageid = themify_404_page_id();

	themify_set_404_wp_query( $pageid );
	$template = themify_404_template( $template );
	rewind_posts();
	add_filter( 'body_class', 'themify_404_body_class' );
	add_action( 'wp_head', 'themify_404_force_query' );
	
	return $template;
}

/**
 * Send a 404 HTTP header
 */
function themify_404_header() {
	remove_action( 'wp', 'themify_404_header' );
	status_header( 404 );
	nocache_headers();

	global $themify;
	$themify->is_custom_404 = true;
}

/**
 * Conditional tag to check if a custom 404 page is enabled
 *
 * @return bool
 */
function themify_is_custom_404() {
	global $themify;
	return !empty( $themify->is_custom_404 );
}

/**
 * Adds the error404 class to the body classes
 */
function themify_404_body_class( $classes ) {
	remove_action( 'body_class', 'themify_404_body_class' );
	
	if ( ! in_array( 'error404', $classes,true ) ) {
		$classes[] = 'error404';
	}

	return $classes;
}

/**
 * Set 404 page template
 */
function themify_404_template( $template ) {
	global $themify;

	$template = get_page_template();
	$pageid = themify_404_page_id();
	$pageLayout=themify_get( 'page_layout' );
	// PAGE LAYOUT (global $themify)
	$layout = ( $pageLayout !== 'default' && $pageLayout )? $pageLayout: themify_get( 'setting-default_page_layout','',true );
	
	if ( $layout != '' ) {
		$themify->layout = $layout;
	}

	// PAGE TITLE VISIBILITY (global $themify)
	$hide_page_title = get_post_meta( $pageid, 'hide_page_title', true );

	if ( ! empty( $hide_page_title ) && 'default' !== $hide_page_title ) {
		$themify->page_title = $hide_page_title;
	} else {
		$hide_page_title=themify_get( 'setting-hide_page_title',false,true );
		$themify->page_title = $hide_page_title ? $hide_page_title : 'no';
	}
	
	if ( 'yes' === $themify->page_title ) {
		add_filter( 'woocommerce_show_page_title', '__return_false' );
	}

	return $template;
}

function themify_404_force_query() {
	remove_action( 'wp_head', 'themify_404_force_query' );
	global $wp_query;

	$pageid = themify_404_page_id();

	if( empty( $wp_query->post->ID ) || $wp_query->post->ID != $pageid ) {
		themify_set_404_wp_query( $pageid );
		rewind_posts();
	}
}

/**
 * Handle Builder's JavaScript fullwidth rows, forces fullwidth rows if sidebar is disabled
 *
 * @return bool
 */
function themify_fullwidth_layout_support($support){
    if($support!==true) {
        global $themify;
        if($themify->layout!=='sidebar-none' || (function_exists('themify_theme_is_fullpage_scroll') && themify_theme_is_fullpage_scroll())) {
            $support=true;
        } else {
            /* if Content Width option is set to Fullwidth, do not use JavaScript, using sidebar-none layout, force fullwidth rows using JavaScript */
            $support=(is_singular() || themify_is_shop()) ? themify_get('content_width')==='full_width' : false;
        }
    }
    return $support;
}
add_filter( 'themify_builder_fullwidth_layout_support', 'themify_fullwidth_layout_support' );

/**
 * Load current skin's functions file if it exists
 *
 * @since 1.4.9
 */
function themify_theme_load_skin_functions() {
	$skin = themify_get_skin();
	if( $skin!==false && is_file( THEME_DIR . '/skins/' . $skin . '/functions.php' ) ) {
	    include THEME_DIR . '/skins/' . $skin . '/functions.php';
	}
}
add_action( 'after_setup_theme', 'themify_theme_load_skin_functions', 1 );

/**
 * Change order and orderby parameters in the index loop, per options in Themify > Settings > Default Layouts
 *
 * @since 3.1.2
 */
function themify_archive_post_order( $query ) {
	if ( $query->is_main_query()) {
		remove_action( 'pre_get_posts', 'themify_archive_post_order',999 );
		if (! is_admin() && (( is_home() || is_archive() ) &&  (! themify_is_woocommerce_active() || ( ! themify_is_shop() && ! is_product_category() ) ))) {
			$query->set( 'order', themify_get( 'setting-index_order','date',true ) );
			$orderBy=themify_get( 'setting-index_orderby' ,'',true);
			$query->set( 'orderby', $orderBy);
			if (($orderBy==='meta_value' || $orderBy==='meta_value_num')) {
				$metaKey=themify_get( 'setting-index_meta_key',false,true );
				if($metaKey){
					$query->set( 'meta_key', $metaKey );
				}
			}
		}
	}
}
add_action( 'pre_get_posts', 'themify_archive_post_order',999 );


/**
 * Enable shortcodes in footer text areas
 */
add_filter( 'themify_the_footer_text_left', 'do_shortcode' );
add_filter( 'themify_the_footer_text_right', 'do_shortcode' );

/**
 * Enable shortcode in excerpt
 */
add_filter('the_excerpt', 'do_shortcode');	
add_filter('the_excerpt', 'shortcode_unautop');

function themify_filter_widget_text( $text, $instance = array( ) ) {
	global $wp_widget_factory;

	/* check for WP 4.8.1+ widget */
        /*
	 * if $instance['filter'] is set to "content", this is a WP 4.8 widget,
	 * leave it as is, since it's processed in the widget_text_content filter
	 */
	if( (isset( $instance['filter'] ) && 'content' === $instance['filter'])  || (isset( $wp_widget_factory->widgets['WP_Widget_Text'] ) && method_exists( $wp_widget_factory->widgets['WP_Widget_Text'], 'is_legacy_instance' ) && ! $wp_widget_factory->widgets['WP_Widget_Text']->is_legacy_instance( $instance ) )) {
		return $text;
	}
	return shortcode_unautop( do_shortcode( $text ) );
}
add_filter( 'widget_text', 'themify_filter_widget_text', 10, 2 );
/**
 * Enable shortcodes in Text widget for Wp 4.8+
 */
add_filter( 'widget_text_content', 'do_shortcode', 12 );

/**
 * Registers support for various WordPress features
 *
 * @since 3.2.1
 */
function themify_setup_wp_features() {

	/*
	 * Switch default core markup for search form, comment form, and comments
	 * to output valid HTML5.
	 */
	add_theme_support( 'html5', array(
		'comment-form',
		'comment-list',
		'gallery',
		'caption',
		'script', 
		'style'
	) );
}
add_filter( 'after_setup_theme', 'themify_setup_wp_features' );


/**
 * Adds Post Options in Themify Custom Panel to custom post types
 * that do not have any options set for it.
 *
 * @return array
 */
function themify_setup_cpt_post_options( $metaboxes ){
	global $typenow;

	/* post types that don't have single page views don't need the Post Options */
	$post_type = get_post_type_object( $typenow );
	if ( empty($typenow) || (is_object($post_type) && ! $post_type->publicly_queryable) ) {
		return $metaboxes;
	}

	/* list of post types that already have defined options */
	$exclude = false;
	foreach ( $metaboxes as $metabox ) {
		if ( $metabox[ 'id' ] === $typenow . '-options' ) {
			$exclude = true;
			break;
		}

		if ( ! empty( $metabox['options'] ) ) {
			foreach( $metabox['options'] as $option ) {
				if( in_array( $typenow . '_layout', $option, true ) ) {
					$exclude = true;
					break 2;
				}
			}
		}
	}

	if ( $exclude ) {
		return $metaboxes;
	}

	/* post types that should not have the CPT Post options */
    $excludes = apply_filters( 'themify_exclude_cpt_post_options', array( 'tbuilder_layout', 'tbuilder_layout_part' ));
	if ( in_array( $typenow, $excludes,true) ) {
		return $metaboxes;
	}

	global $typenow;
	$name = !empty( $typenow )? 'custom_post_' . $typenow . '_single' : 'page_layout';

	$post_options =  array(
			array(
				'name' => $name,
				'title' => __('Sidebar Option', 'themify'),
				'description' => '',
				'type' => 'layout',
				'show_title' => true,
				'meta' => apply_filters('themify_post_type_theme_sidebars' , array(
							array('value' => 'default', 'img' => 'themify/img/default.svg', 'selected' => true, 'title' => __('Default', 'themify')),
							array('value' => 'sidebar1', 'img' => 'images/layout-icons/sidebar1.png', 'title' => __('Sidebar Right', 'themify')),
							array('value' => 'sidebar1 sidebar-left', 'img' => 'images/layout-icons/sidebar1-left.png', 'title' => __('Sidebar Left', 'themify')),
							array('value' => 'sidebar-none', 'img' => 'images/layout-icons/sidebar-none.png', 'title' => __('No Sidebar ', 'themify'))
						)
					),
				'default' => 'default'
			),
			array(
				'name'=> 'content_width',
				'title' => __('Content Width', 'themify'),
				'description' => '',
				'type' => 'layout',
				'show_title' => true,
				'meta' => array(
					array(
						'value' => 'default_width',
						'img' => 'themify/img/default.svg',
						'selected' => true,
						'title' => __( 'Default', 'themify' )
					),
					array(
						'value' => 'full_width',
						'img' => 'themify/img/fullwidth.svg',
						'title' => __( 'Fullwidth', 'themify' )
					)
				),
				'default' => 'default_width'
			),
		) ;

	$post_options = apply_filters( 'themify_post_type_default_options', $post_options);

	return array_merge( array(
		array(
			'name' => __( 'Post Options', 'themify' ),
			'id' => $typenow . '-options',
			'options' => $post_options,
			'pages' => $typenow
		),
	), $metaboxes );
}
add_filter( 'themify_metabox/fields/themify-meta-boxes', 'themify_setup_cpt_post_options', 101 );

/**
 * Set proper sidebar layout for post types' single post view
 *
 * @uses global $themify
 */
function themify_cpt_set_post_options() {
	if ( is_singular() ) {
		$exclude = apply_filters( 'themify_exclude_CPT_for_sidebar', array( 'post', 'page', 'attachment', 'tbuilder_layout', 'tbuilder_layout_part', 'section' ) );
		if ( ! in_array( get_post_type(), $exclude,true ) ) {
		    global $themify;
			$cpt_sidebar = 'custom_post_'.get_post_type().'_single';
			$layout=themify_get( $cpt_sidebar ) ;
			if ( $layout!== 'default' && !empty($layout)) {
				$themify->layout = $layout;
			} elseif ( themify_check( 'setting-'.$cpt_sidebar,true) ) {
				$themify->layout = themify_get( 'setting-'.$cpt_sidebar,false,true );
			} else {
				$themify->layout = themify_get( 'page_layout' );
			}
		}
	}
}
add_action( 'template_redirect', 'themify_cpt_set_post_options', 100 );

/**
 * Set default 'large' image size on attachment page
 */
function themify_prepend_attachment() {
	return '<p>' . wp_get_attachment_link( 0, 'large', false ) . '</p>';
}
add_filter( 'prepend_attachment', 'themify_prepend_attachment' );

function themify_theme_post_gallery($output, $attr){
	remove_filter('post_gallery', 'themify_theme_post_gallery', 10, 2);
	Themify_Enqueue_Assets::loadGalleryCss();
	return $output;
}
add_filter( 'post_gallery', 'themify_theme_post_gallery', 10, 2 );


//Make query page
if( ! function_exists( 'themify_custom_query_posts' ) ) {
	function themify_custom_query_posts( $args ) {
		global $themify;
		if ( isset($themify->query_category) && $themify->query_category !== '' &&  is_page()) {
		    $qpargs = array(
			    'post_type' => !empty($themify->query_post_type)?$themify->query_post_type:'post',
			    'posts_per_page' => ! empty( $themify->posts_per_page ) ? $themify->posts_per_page : get_option( 'posts_per_page' ),
			    'order' => $themify->order,
			    'orderby' => $themify->orderby
		    );
		    if( ! empty( $themify->order_meta_key ) ) {
			    $qpargs['meta_key'] = $themify->order_meta_key;
		    }
		    $taxonomy = isset( $themify->query_taxonomy ) ? $themify->query_taxonomy : 'category';
			$qpargs['tax_query'] = themify_parse_category_args($themify->query_category, $taxonomy);

		    if( ! empty( $args ) ) {
			    $qpargs = wp_parse_args( $args, $qpargs );
		    }
		    if(!isset($qpargs['paged'])){
			$qpargs['paged']=!empty($themify->paged)?$themify->paged:get_query_var('paging', 1);
		    }
			
		    do_action('themify_query_before_posts_page_args', $qpargs);
		    $qpargs=apply_filters( 'themify_query_posts_page_args', $qpargs );
		    query_posts( $qpargs );
		    do_action('themify_query_after_posts_page_args', $qpargs);
		    if(!has_action('themify_reset_query','wp_reset_query')){
				add_action('themify_reset_query','wp_reset_query',1);
		    }
		}
	}
}

/**
 * Add custom query_posts
 */
add_action( 'themify_custom_query_posts', 'themify_custom_query_posts' );

function themify_custom_except_length($length) {
    global $themify;
    if(empty($themify->excerpt_length)){
	remove_filter('excerpt_length','themify_custom_except_length', 999);
    }
    elseif($themify->display_content === 'excerpt'){
	return apply_filters( 'themify_custom_excerpt_length', $themify->excerpt_length );
    }
    return $length;
}
if ( ! is_admin() )
	add_filter( 'excerpt_length', 'themify_custom_except_length', 999 );


/**
 * Change the default Read More link
 * @return string
 */
function themify_modify_read_more_link($link,$more_link_text) {
	return '<a class="more-link" href="' . get_permalink() . '">'.$more_link_text.'</a>';
}
add_filter( 'the_content_more_link', 'themify_modify_read_more_link', 10, 2 );


add_filter('script_loader_tag', 'themify_defer_js', 11, 3);
add_filter('wp_get_attachment_image_src', 'themify_generate_src_webp', 100,1);

//deprecated code 07.06.2020
if(is_child_theme()){
    function themify_set_deprecated_values(){
	global $themify;
	$themify->image_setting=$themify->image_align=$themify->allow_sorting=$themify->is_builder_loop=$themify->is_isotop='';
    }
    add_action('after_setup_theme', 'themify_set_deprecated_values',15);
    if(!function_exists('themify_theme_comment')){
	function themify_theme_comment($comment, $args, $depth){
	    themify_comment_list($comment, $args, $depth);
	}
    }
    if(!function_exists('themify_theme_query_classes')){
	function themify_theme_query_classes(){return '';}
    }
}
function themify_set_is_shop($query){
	if($query && $query->is_main_query()){
		remove_filter('parse_query','themify_set_is_shop',100,1);
		$id=false;
			if($query->is_page()){
				$id=!empty($query->query_vars['page_id'])?$query->query_vars['page_id']:(!empty($query->queried_object->ID)?$query->queried_object->ID:-1);
				if($id>0){
					$id=(int)$id;
				}
			}
		themify_is_shop($id);
	}
	return $query;
}
if(!is_admin()){
    add_filter('parse_query','themify_set_is_shop',100,1);
}

// Portfolio comments filter
function portfolio_comments_open( $open, $post_id ) {
    return 'portfolio' === get_post_type($post_id) && themify_check( 'setting-portfolio_comments',true )?true:$open;
}
if(themify_is_themify_theme()){
    add_filter( 'comments_open', 'portfolio_comments_open', 10, 2 );
}
