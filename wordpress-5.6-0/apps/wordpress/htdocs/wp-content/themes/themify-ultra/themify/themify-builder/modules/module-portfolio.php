<?php

if (!defined('ABSPATH'))
    exit; // Exit if accessed directly
/**
 * Module Name: Portfolio
 * Description: Display portfolio custom post type
 */

class TB_Portfolio_Module extends Themify_Builder_Component_Module {

    function __construct() {
		parent::__construct(array(
			'name' => __('Portfolio', 'themify'),
			'slug' => 'portfolio'
		));

		///////////////////////////////////////
		// Load Post Type
		///////////////////////////////////////
		include_once( ABSPATH . 'wp-admin/includes/plugin.php' );

		if ( ! Themify_Builder_Model::is_plugin_active( 'themify-portfolio-post/themify-portfolio-post.php' ) ) {
			add_filter( 'themify_metabox/fields/themify-meta-boxes', array($this, 'cpt_meta_boxes'), 100 ); // requires low priority so that it loads after theme's metaboxes
			if ( ! shortcode_exists( 'themify_portfolio_posts' ) ) {
				add_shortcode( 'themify_portfolio_posts', array( $this, 'do_shortcode' ) );
			}
		}
    }

    public function get_icon(){
	return 'briefcase';
    }
    
    public function get_assets() {
	    return array(
		    'css'=>THEMIFY_BUILDER_CSS_MODULES.'post.css'
	    );
    }
    
    public function get_title($module) {
	$type = isset($module['mod_settings']['type_query_portfolio']) ? $module['mod_settings']['type_query_portfolio'] : 'category';
	$category = isset($module['mod_settings']['category_portfolio']) ? $module['mod_settings']['category_portfolio'] : '';
	$slug_query = isset($module['mod_settings']['query_slug_portfolio']) ? $module['mod_settings']['query_slug_portfolio'] : '';

	if ('category' === $type) {
	    return sprintf('%s : %s', __('Category', 'themify'), $category);
	} else {
	    return sprintf('%s : %s', __('Slugs', 'themify'), $slug_query);
	}
    }

    public function get_options() {

	$is_img_enabled = Themify_Builder_Model::is_img_php_disabled();
	return array(
	    array(
		'id' => 'mod_title_portfolio',
		'type' => 'title'
	    ),
		array(
			'type' => 'query_posts',
			'term_id' => 'category_portfolio',
			'slug_id'=>'query_slug_portfolio',
			'taxonomy'=>'portfolio-category',
			'description' => sprintf(__('Add more <a href="%s" target="_blank">portfolio posts</a>', 'themify'), admin_url('post-new.php?post_type=portfolio'))
		),
	    array(
		'id' => 'layout_portfolio',
		'type' => 'layout',
		'label' => __('Portfolio Layout', 'themify'),
		'control'=>array(
		    'classSelector'=>'.builder-posts-wrap'
		),
		'mode' => 'sprite',
		'options' => array(
            array('img' => 'fullwidth', 'value' => 'fullwidth', 'label' => __('fullwidth', 'themify')),
		    array('img' => 'grid2', 'value' => 'grid2', 'label' => __('Grid 2', 'themify')),
            array('img' => 'grid3', 'value' => 'grid3', 'label' => __('Grid 3', 'themify')),
            array('img' => 'grid4', 'value' => 'grid4', 'label' => __('Grid 4', 'themify')),
            array('img' => 'grid5', 'value' => 'grid5', 'label' => __('Grid 5', 'themify')),
            array('img' => 'grid6', 'value' => 'grid6', 'label' => __('Grid 6', 'themify'))
		)
	    ),
	    array(
		'id' => 'post_per_page_portfolio',
		'type' => 'number',
		'label' => __('Limit', 'themify'),
		'help' => __("Enter the number of posts to show.", 'themify')
	    ),
	    array(
		'id' => 'offset_portfolio',
		'type' => 'number',
		'label' => __('Offset', 'themify'),
		'help' => __("Enter number of post to display or pass over.", 'themify')
	    ),
	    array(
		'id' => 'order_portfolio',
		'type' => 'select',
		'label' => __('Order', 'themify'),
		'help' => __('Descending means show newer posts first. Ascending means show older posts first.', 'themify'),
		'order' =>true
	    ),
	    array(
		'id' => 'orderby_portfolio',
		'type' => 'select',
		'label' => __('Order By', 'themify'),
		'orderBy'=>true,
		'binding' => array(
		    'select' => array('hide' => array('meta_key_portfolio')),
		    'meta_value' => array('show' => array('meta_key_portfolio')),
		    'meta_value_num' => array('show' => array('meta_key_portfolio'))
		)
	    ),
	    array(
		'id' => 'meta_key_portfolio',
		'type' => 'text',
		'label' => __('Custom Field Key', 'themify'),
	    ),
	    array(
		'id' => 'display_portfolio',
		'type' => 'select',
		'label' => __('Display', 'themify'),
		'options' => array(
		    'content' => __('Content', 'themify'),
		    'excerpt' => __('Excerpt', 'themify'),
		    'none' => __('None', 'themify')
		)
	    ),
	    array(
		'id' => 'hide_feat_img_portfolio',
		'type' => 'toggle_switch',
		'label' => __('Featured Image', 'themify')
	    ),
	    array(
		'id' => 'image_size_portfolio',
		'type' => 'select',
		'label' => __('Image Size', 'themify'),
		'hide' => !$is_img_enabled,
		'image_size' => true
	    ),
	    array(
		'id' => 'img_width_portfolio',
		'type' => 'number',
		'label' => __('Image Width', 'themify')
	    ),
	    array(
		'id' => 'auto_fullwidth_portfolio',
		'type' => 'checkbox',
		'label' => '',
		'options' => array(array('name' => '1', 'value' => __('Auto fullwidth image', 'themify'))),
		'wrap_class' => 'auto_fullwidth'
	    ),
	    array(
		'id' => 'img_height_portfolio',
		'type' => 'number',
		'label' => __('Image Height', 'themify')
	    ),
	    array(
		'id' => 'unlink_feat_img_portfolio',
		'type' => 'toggle_switch',
		'label' => __('Unlink Featured Image', 'themify'),
		'options'=>'simple'
	    ),
	    array(
		'id' => 'hide_post_title_portfolio',
		'type' => 'toggle_switch',
		'label' => __('Post Title', 'themify'),
	    ),
	    array(
		'id' => 'unlink_post_title_portfolio',
		'type' => 'toggle_switch',
		'label' => __('Unlink Post Title', 'themify'),
		'options' =>'simple'
	    ),
	    array(
		'id' => 'hide_post_date_portfolio',
		'type' => 'toggle_switch',
		'label' => __('Post Date', 'themify')
	    ),
	    array(
		'id' => 'hide_post_meta_portfolio',
		'type' => 'toggle_switch',
		'label' => __('Post Meta', 'themify')
	    ),
	    array(
		'id' => 'hide_page_nav_portfolio',
		'type' => 'toggle_switch',
		'label' => __('Page Navigation', 'themify')
	    ),
	    array(
		'id' => 'css_portfolio',
		'type' => 'custom_css'
	    ),
	    array('type' => 'custom_css_id')
	);
    }

    public function get_live_default() {
	return array(
        'layout_portfolio' => 'grid4',
	    'post_per_page_portfolio' => 4,
	    'hide_page_nav_portfolio'=>'yes',
	    'display_portfolio' => 'excerpt'
	);
    }

    public function get_visual_type() {
	return 'ajax';
    }

    public function get_styling() {
	$general = array(
	    // Background
	    self::get_expand('bg', array(
		self::get_tab(array(
		    'n' => array(
			'options' => array(
			    self::get_color(' .post', 'background_color', 'bg_c', 'background-color')
			)
		    ),
		    'h' => array(
			'options' => array(
			    self::get_color(' .post', 'bg_c', 'bg_c', 'background-color', null, 'h')
			)
		    )
		)),
		)),
		// Font
		self::get_expand('f', array(
		self::get_tab(array(
		    'n' => array(
			'options' => array(
			    self::get_font_family(array('.module .post-title', '.module .post-title a')),
			    self::get_color(array(' .post', '.module h1', '.module h2', '.module h3:not(.module-title)', '.module h4', '.module h5', '.module h6', '.module .post-title', '.module .post-title a'), 'font_color'),
			    self::get_font_size(' .post'),
			    self::get_line_height(' .post'),
			    self::get_letter_spacing(' .post'),
			    self::get_text_align(' .post'),
			    self::get_text_transform(' .post'),
			    self::get_font_style(' .post'),
			    self::get_text_decoration(' .post', 'text_decoration_regular'),
				self::get_text_shadow(array('.module .post-title', '.module .post-title a')),
			)
		    ),
		    'h' => array(
			'options' => array(
			    self::get_font_family(array('.module .post-title', '.module .post-title a'), 'f_f', 'h'),
			    self::get_color(array(':hover .post', '.module:hover h1', '.module:hover h2', '.module:hover h3:not(.module-title)', '.module:hover h4', '.module:hover h5', '.module:hover h6', '.module:hover .post-title', '.module:hover .post-title a'), 'f_c_h'),
			    self::get_font_size(' .post', 'f_s', '', 'h'),
			    self::get_line_height(' .post', 'l_h', 'h'),
			    self::get_letter_spacing(' .post', 'l_s', 'h'),
			    self::get_text_align(' .post', 't_a', 'h'),
			    self::get_text_transform(' .post', 't_t', 'h'),
			    self::get_font_style(' .post', 'f_st', 'f_w', 'h'),
			    self::get_text_decoration(' .post', 't_d_r', 'h'),
				self::get_text_shadow(array('.module .post-title', '.module .post-title a'),'t_sh','h'),
			)
		    )
		))
	    )),
	    // Link
	    self::get_expand('l', array(
		self::get_tab(array(
		    'n' => array(
			'options' => array(
			    self::get_color(' a', 'link_color'),
			    self::get_text_decoration(' a')
			)
		    ),
		    'h' => array(
			'options' => array(
			    self::get_color(' a', 'link_color',null, null, 'hover'),
			    self::get_text_decoration(' a', 't_d', 'h')
			)
		    )
		))
	    )),
	    // Padding
	    self::get_expand('p', array(
		self::get_tab(array(
		    'n' => array(
			'options' => array(
			    self::get_padding(' .post')
			)
		    ),
		    'h' => array(
			'options' => array(
			    self::get_padding(' .post', 'p', 'h')
			)
		    )
		))
	    )),
	    // Margin
	    self::get_expand('m', array(
		self::get_tab(array(
		    'n' => array(
			'options' => array(
			    self::get_margin(' .post')
			)
		    ),
		    'h' => array(
			'options' => array(
			    self::get_margin(' .post', 'm', 'h')
			)
		    )
		))
	    )),
	    // Border
	    self::get_expand('b', array(
		self::get_tab(array(
		    'n' => array(
			'options' => array(
			    self::get_border(' .post')
			)
		    ),
		    'h' => array(
			'options' => array(
			    self::get_border(' .post', 'b', 'h')
			)
		    )
		))
	    )),
		// Filter
		self::get_expand('f_l',
			array(
				self::get_tab(array(
					'n' => array(
						'options' => self::get_blend()

					),
					'h' => array(
						'options' => self::get_blend('', '', 'h')
					)
				))
			)
		),
				// Height & Min Height
				self::get_expand('ht', array(
						self::get_height(),
						self::get_min_height(),
						self::get_max_height()
					)
				),
		// Rounded Corners
		self::get_expand('r_c', array(
				self::get_tab(array(
					'n' => array(
						'options' => array(
							self::get_border_radius()
						)
					),
					'h' => array(
						'options' => array(
							self::get_border_radius('', 'r_c', 'h')
						)
					)
				))
			)
		),
		// Shadow
		self::get_expand('sh', array(
				self::get_tab(array(
					'n' => array(
						'options' => array(
							self::get_box_shadow()
						)
					),
					'h' => array(
						'options' => array(
							self::get_box_shadow('', 'sh', 'h')
						)
					)
				))
			)
		),
	);

	$portfolio_title = array(
	    // Font
	    self::get_seperator('f'),
	    self::get_tab(array(
		'n' => array(
		    'options' => array(
			self::get_font_family(array('.module .post-title', '.module .post-title a'), 'font_family_title'),
			self::get_color(array('.module .post-title', '.module .post-title a'), 'font_color_title'),
			self::get_font_size('.module .post-title', 'font_size_title'),
			self::get_line_height('.module .post-title', 'line_height_title'),
			self::get_letter_spacing('.module .post-title', 'letter_spacing_title'),
			self::get_text_transform('.module .post-title', 't_t_title'),
			self::get_font_style('.module .post-title', 'f_sy_t', 'f_b_t'),
			self::get_text_shadow(array('.module .post-title', '.module .post-title a'), 't_sh_t'),
		    )
		),
		'h' => array(
		    'options' => array(
			self::get_font_family(array('.module .post-title', '.module .post-title a'), 'f_f_t', 'h'),
			self::get_color(array('.module .post-title', '.module .post-title a'), 'font_color_title', null,null,'hover'),
			self::get_font_size('.module .post-title', 'f_s_t', '', 'h'),
			self::get_line_height('.module .post-title', 'l_h_t', 'h'),
			self::get_letter_spacing('.module .post-title', 'l_s_t', 'h'),
			self::get_text_transform('.module .post-title', 't_t_t', 'h'),
			self::get_font_style('.module .post-title', 'f_sy_t', 'f_b_t', 'f_w_t', 'h'),
			self::get_text_shadow(array('.module .post-title', '.module .post-title a'), 't_sh_t','h'),
		    )
		)
	    ))
	);

	$portfolio_meta = array(
	    // Font
	    self::get_seperator('f'),
	    self::get_tab(array(
		'n' => array(
		    'options' => array(
			self::get_font_family(array(' .post-content .post-meta', ' .post-content .post-meta a'), 'font_family_meta'),
			self::get_color(array(' .post-content .post-meta', ' .post-content .post-meta a'), 'font_color_meta'),
			self::get_font_size(' .post-content .post-meta', 'font_size_meta'),
			self::get_line_height(' .post-content .post-meta', 'line_height_meta'),
			self::get_text_shadow(array(' .post-content .post-meta', ' .post-content .post-meta a'), 't_sh_m'),
		    )
		),
		'h' => array(
		    'options' => array(
			self::get_font_family(array(' .post-content .post-meta', ' .post-content .post-meta a'), 'f_f_m', 'h'),
			self::get_color(array(' .post-content .post-meta', ' .post-content .post-meta a'), 'f_c_m', null, null, 'h'),
			self::get_font_size(' .post-content .post-meta', 'f_s_m', '', 'h'),
			self::get_line_height(' .post-content .post-meta', 'l_h_m', 'h'),
			self::get_text_shadow(array(' .post-content .post-meta', ' .post-content .post-meta a'), 't_sh_m','h'),
		    )
		)
	    ))
	);

	$portfolio_date = array(
	    // Font
	    self::get_seperator('f'),
	    self::get_tab(array(
		'n' => array(
		    'options' => array(
			self::get_font_family(array(' .post .post-date', ' .post .post-date a'), 'font_family_date'),
			self::get_color(array(' .post .post-date', ' .post .post-date a'), 'font_color_date'),
			self::get_font_size(' .post .post-date', 'font_size_date'),
			self::get_line_height(' .post .post-date', 'line_height_date'),
			self::get_text_shadow(array(' .post .post-date', ' .post .post-date a'), 't_sh_d'),
		    )
		),
		'h' => array(
		    'options' => array(
			self::get_font_family(array(' .post .post-date', ' .post .post-date a'), 'f_f_d', 'h'),
			self::get_color(array(' .post .post-date', ' .post .post-date a'), 'font_color_date',null,null,'hover'),
			self::get_font_size(' .post .post-date', 'f_s_d', '', 'h'),
			self::get_line_height(' .post .post-date', 'l_h_d', 'h'),
			self::get_text_shadow(array(' .post .post-date', ' .post .post-date a'), 't_sh_d','h'),
		    )
		)
	    ))
	);

	$portfolio_content = array(
	    // Font
	    self::get_seperator('f'),
	    self::get_tab(array(
		'n' => array(
		    'options' => array(
			self::get_font_family(' .post-content .entry-content', 'font_family_content'),
			self::get_color(' .post-content .entry-content', 'font_color_content'),
			self::get_font_size(' .post-content .entry-content', 'font_size_content'),
			self::get_line_height(' .post-content .entry-content', 'line_height_content'),
			self::get_text_shadow(' .post-content .entry-content', 't_sh_c'),
		    )
		),
		'h' => array(
		    'options' => array(
			self::get_font_family(' .post-content .entry-content', 'f_f_c', 'f_f', 'h'),
			self::get_color(' .post-content .entry-content', 'f_c_c', null, null, 'h'),
			self::get_font_size(' .post-content .entry-content', 'f_s_c', '', 'h'),
			self::get_line_height(' .post-content .entry-content', 'l_h_c', 'h'),
			self::get_text_shadow(' .post-content .entry-content', 't_sh_c','h'),
		    )
		)
	    ))
	);
	
	$featured_image = array(
	    // Background
	    self::get_expand('bg', array(
			self::get_tab(array(
				'n' => array(
				'options' => array(
					self::get_color(' .post-image', 'b_c_f_i', 'bg_c', 'background-color')
				)
				),
				'h' => array(
				'options' => array(
					self::get_color(' .post-image', 'b_c_f_i', 'bg_c', 'background-color', 'h')
				)
				)
			))
	    )),
	    // Padding
	    self::get_expand('p', array(
			self::get_tab(array(
				'n' => array(
				'options' => array(
					self::get_padding(' .post-image', 'p_f_i')
				)
				),
				'h' => array(
				'options' => array(
					self::get_padding(' .post-image', 'p_f_i', 'h')
				)
				)
			))
	    )),
	    // Margin
	    self::get_expand('m', array(
			self::get_tab(array(
				'n' => array(
				'options' => array(
					self::get_margin(' .post-image', 'm_f_i')
				)
				),
				'h' => array(
				'options' => array(
					self::get_margin(' .post-image', 'm_f_i', 'h')
				)
				)
			))
	    )),
	    // Border
	    self::get_expand('b', array(
			self::get_tab(array(
				'n' => array(
				'options' => array(
					self::get_border(' .post-image', 'b_f_i')
				)
				),
				'h' => array(
				'options' => array(
					self::get_border(' .post-image', 'b_f_i', 'h')
				)
				)
			))
	    )),
		// Rounded Corners
		self::get_expand('r_c', array(
			self::get_tab(array(
				'n' => array(
					'options' => array(
						self::get_border_radius(' .post-image', 'f_i_r_c')
					)
				),
				'h' => array(
					'options' => array(
						self::get_border_radius(' .post-image', 'f_i_r_c', 'h')
					)
				)
			))
		)),
		// Shadow
		self::get_expand('sh', array(
			self::get_tab(array(
				'n' => array(
					'options' => array(
						self::get_box_shadow(' .post-image', 'f_i_sh')
					)
				),
				'h' => array(
					'options' => array(
						self::get_box_shadow(' .post-image', 'f_i_sh', 'h')
					)
				)
			))
		))
	);

	$pt_filter = array(
		// Background
		self::get_expand('bg', array(
			self::get_tab(array(
				'n' => array(
				'options' => array(
					self::get_color(' .post-filter li a', 'b_c_pt_f', 'bg_c', 'background-color')
				)
				),
				'h' => array(
				'options' => array(
					self::get_color(' .post-filter li a', 'b_c_pt_f', 'bg_c', 'background-color', 'h')
				)
				)
			))
		)),
		// Font
		self::get_expand('f', array(
			self::get_tab(array(
				'n' => array(
				'options' => array(
					self::get_font_family(' .post-filter li a', 'f_f_pt_f'),
					self::get_color(' .post-filter li a', 'f_c_pt_f'),
					self::get_font_size(' .post-filter li a', 'f_s_pt_f'),
					self::get_line_height(' .post-filter li a', 'l_h_pt_f'),
					self::get_letter_spacing(' .post-filter li a', 'l_s_pt_f'),
					self::get_font_style(' .post-filter li a', 'f_st_pt_f', 'f_b_pt_f'),
					self::get_text_align(' .post-filter li a','t_a_pt_f'),
					self::get_text_shadow(' .post-filter li a','t_sh_pt_f'),
				)
				),
				'h' => array(
				'options' => array(
					self::get_font_family(' .post-filter li a', 'f_f_pt_f', 'h'),
					self::get_color(' .post-filter li a', 'f_c_pt_f','h'),
					self::get_font_size(' .post-filter li a', 'f_s_pt_f', '', 'h'),
					self::get_line_height(' .post-filter li a', 'l_h_pt_f', 'h'),
					self::get_letter_spacing(' .post-filter li a', 'l_s_pt_f', 'h'),
					self::get_font_style(' .post-filter li a', 'f_st_pt_f', 'f_b_pt_f', 'h'),
					self::get_text_align(' .post-filter li a','t_a_pt_f','h'),
					self::get_text_shadow(' .more-link','t_sh_pt_f','h'),
				)
				)
			))
		))
	);

	$pt_filter = array(
		// Background
		self::get_expand('bg', array(
			self::get_tab(array(
				'n' => array(
				'options' => array(
					self::get_color(' .post-filter li a', 'b_c_pt_f', 'bg_c', 'background-color')
				)
				),
				'h' => array(
				'options' => array(
					self::get_color(' .post-filter li a', 'b_c_pt_f', 'bg_c', 'background-color', 'h')
				)
				)
			))
		)),
		// Font
		self::get_expand('f', array(
			self::get_tab(array(
				'n' => array(
				'options' => array(
					self::get_font_family(' .post-filter li a', 'f_f_pt_f'),
					self::get_color(' .post-filter li a', 'f_c_pt_f'),
					self::get_font_size(' .post-filter li a', 'f_s_pt_f'),
					self::get_line_height(' .post-filter li a', 'l_h_pt_f'),
					self::get_letter_spacing(' .post-filter li a', 'l_s_pt_f'),
					self::get_font_style(' .post-filter li a', 'f_st_pt_f', 'f_b_pt_f'),
					self::get_text_align(' .post-filter','t_a_pt_f'),
					self::get_text_shadow(' .post-filter li a','t_sh_pt_f'),
				)
				),
				'h' => array(
				'options' => array(
					self::get_font_family(' .post-filter li a', 'f_f_pt_f', 'h'),
					self::get_color(' .post-filter li a:hover', 'f_c_pt_f_h',null,null,'h'),
					self::get_font_size(' .post-filter li a', 'f_s_pt_f', '', 'h'),
					self::get_line_height(' .post-filter li a', 'l_h_pt_f', 'h'),
					self::get_letter_spacing(' .post-filter li a', 'l_s_pt_f', 'h'),
					self::get_font_style(' .post-filter li a', 'f_st_pt_f', 'f_b_pt_f', 'h'),
					self::get_text_align(' .post-filter','t_a_pt_f','h'),
					self::get_text_shadow(' .post-filter li a','t_sh_pt_f','h'),
				)
				)
			))
		)),
		// Padding
		self::get_expand('p', array(
			self::get_tab(array(
				'n' => array(
				'options' => array(
					self::get_padding(' .post-filter li a', 'p_pt_f')
				)
				),
				'h' => array(
				'options' => array(
					self::get_padding(' .post-filter li a', 'p_pt_f', 'h')
				)
				)
			))
		)),
		// Margin
		self::get_expand('m', array(
			self::get_tab(array(
				'n' => array(
				'options' => array(
					self::get_margin(' .post-filter li a', 'm_pt_f')
				)
				),
				'h' => array(
				'options' => array(
					self::get_margin(' .post-filter li a', 'm_pt_f', 'h')
				)
				)
			)),
		)),
		// Border
		self::get_expand('b', array(
			self::get_tab(array(
				'n' => array(
				'options' => array(
					self::get_border(' .post-filter li a', 'b_pt_f')
				)
				),
				'h' => array(
				'options' => array(
					self::get_border(' .post-filter li a', 'b_pt_f', 'h')
				)
				)
			))
		)),
		// Rounded Corners
		self::get_expand('r_c', array(
			self::get_tab(array(
				'n' => array(
					'options' => array(
						self::get_border_radius(' .post-filter li a', 'r_c_pt_f')
					)
				),
				'h' => array(
					'options' => array(
						self::get_border_radius(' .post-filter li a', 'r_c_pt_f', 'h')
					)
				)
			))
		)),
		// Shadow
		self::get_expand('sh', array(
			self::get_tab(array(
				'n' => array(
					'options' => array(
						self::get_box_shadow(' .post-filter li a', 'sh_pt_f')
					)
				),
				'h' => array(
					'options' => array(
						self::get_box_shadow(' .post-filter li a', 'sh_pt_f', 'h')
					)
				)
			))
		))
	);

	$pta_filter = array(
		// Background
		self::get_expand('bg', array(
			self::get_tab(array(
				'n' => array(
				'options' => array(
					self::get_color(' .post-filter li.active a', 'b_c_pta_f', 'bg_c', 'background-color')
				)
				),
				'h' => array(
				'options' => array(
					self::get_color(' .post-filter li.active a', 'b_c_pta_f', 'bg_c', 'background-color', 'h')
				)
				)
			))
		)),
		// Font
		self::get_expand('f', array(
			self::get_tab(array(
				'n' => array(
				'options' => array(
					self::get_font_family(' .post-filter li.active a', 'f_f_pta_f'),
					self::get_color(' .post-filter li.active a', 'f_c_pta_f'),
					self::get_font_size(' .post-filter li.active a', 'f_s_pta_f'),
					self::get_line_height(' .post-filter li.active a', 'l_h_pta_f'),
					self::get_letter_spacing(' .post-filter li.active a', 'l_s_pta_f'),
					self::get_font_style(' .post-filter li.active a', 'f_st_pta_f', 'f_b_pta_f'),
					self::get_text_shadow(' .post-filter li.active a','t_sh_pta_f'),
				)
				),
				'h' => array(
				'options' => array(
					self::get_font_family(' .post-filter li.active a', 'f_f_pta_f', 'h'),
					self::get_color(' .post-filter li.active a:hover', 'f_c_pta_f_h',null,null,'h'),
					self::get_font_size(' .post-filter li.active a', 'f_s_pta_f', '', 'h'),
					self::get_line_height(' .post-filter li.active a', 'l_h_pta_f', 'h'),
					self::get_letter_spacing(' .post-filter li.active a', 'l_s_pta_f', 'h'),
					self::get_font_style(' .post-filter li.active a', 'f_st_pta_f', 'f_b_pta_f', 'h'),
					self::get_text_shadow(' .post-filter li.active a','t_sh_pta_f','h'),
				)
				)
			))
		)),
	);

	return array(
	    'type' => 'tabs',
	    'options' => array(
		'g' => array(
		    'options' => $general
		),
		'm_t' => array(
		    'options' => $this->module_title_custom_style()
		),
		't' => array(
		    'label' => __('Title', 'themify'),
		    'options' => $portfolio_title
		),
		'fi' => array(
			'label' => __('Featured Image', 'themify'),
			'options' => $featured_image
		),
		'm' => array(
		    'label' => __('Meta', 'themify'),
		    'options' => $portfolio_meta
		),
		'd' => array(
		    'label' => __('Date', 'themify'),
		    'options' => $portfolio_date
		),
		'c' => array(
		    'label' => __('Content', 'themify'),
		    'options' => $portfolio_content
		),
		'p_f' => array(
			'label' => __('Post Filter', 'themify'),
			'options' => $pt_filter
		),
		'p_f_a' => array(
			'label' => __('Post Filter Active', 'themify'),
			'options' => $pta_filter
		)
	    )
	);
    }

    function get_metabox() {
	/** Portfolio Meta Box Options */
	$meta_box = array(
	    // Featured Image Size
	    Themify_Builder_Model::$featured_image_size,
	    // Image Width
	    Themify_Builder_Model::$image_width,
	    // Image Height
	    Themify_Builder_Model::$image_height,
	    // Hide Title
	    array(
		'name' => 'hide_post_title',
		'title' => __('Hide Post Title', 'themify'),
		'description' => '',
		'type' => 'dropdown',
		'meta' => array(
		    array('value' => 'default', 'name' => '', 'selected' => true),
		    array('value' => 'yes', 'name' => __('Yes', 'themify')),
		    array('value' => 'no', 'name' => __('No', 'themify'))
		)
	    ),
	    // Unlink Post Title
	    array(
		'name' => 'unlink_post_title',
		'title' => __('Unlink Post Title', 'themify'),
		'description' => __('Unlink post title (it will display the post title without link)', 'themify'),
		'type' => 'dropdown',
		'meta' => array(
		    array('value' => 'default', 'name' => '', 'selected' => true),
		    array('value' => 'yes', 'name' => __('Yes', 'themify')),
		    array('value' => 'no', 'name' => __('No', 'themify'))
		)
	    ),
	    // Hide Post Date
	    array(
		'name' => 'hide_post_date',
		'title' => __('Hide Post Date', 'themify'),
		'description' => '',
		'type' => 'dropdown',
		'meta' => array(
		    array('value' => 'default', 'name' => '', 'selected' => true),
		    array('value' => 'yes', 'name' => __('Yes', 'themify')),
		    array('value' => 'no', 'name' => __('No', 'themify'))
		)
	    ),
	    // Hide Post Meta
	    array(
		'name' => 'hide_post_meta',
		'title' => __('Hide Post Meta', 'themify'),
		'description' => '',
		'type' => 'dropdown',
		'meta' => array(
		    array('value' => 'default', 'name' => '', 'selected' => true),
		    array('value' => 'yes', 'name' => __('Yes', 'themify')),
		    array('value' => 'no', 'name' => __('No', 'themify'))
		)
	    ),
	    // Hide Post Image
	    array(
		'name' => 'hide_post_image',
		'title' => __('Hide Featured Image', 'themify'),
		'description' => '',
		'type' => 'dropdown',
		'meta' => array(
		    array('value' => 'default', 'name' => '', 'selected' => true),
		    array('value' => 'yes', 'name' => __('Yes', 'themify')),
		    array('value' => 'no', 'name' => __('No', 'themify'))
		)
	    ),
	    // Unlink Post Image
	    array(
		'name' => 'unlink_post_image',
		'title' => __('Unlink Featured Image', 'themify'),
		'description' => __('Display the Featured Image without link', 'themify'),
		'type' => 'dropdown',
		'meta' => array(
		    array('value' => 'default', 'name' => '', 'selected' => true),
		    array('value' => 'yes', 'name' => __('Yes', 'themify')),
		    array('value' => 'no', 'name' => __('No', 'themify'))
		)
	    ),
	    // External Link
	    Themify_Builder_Model::$external_link,
	    // Lightbox Link
	    Themify_Builder_Model::$lightbox_link
	);
	return $meta_box;
    }

    function do_shortcode($atts) {

	extract(shortcode_atts(array(
	    'id' => '',
	    'title' => 'yes',
	    'unlink_title' => 'no',
	    'image' => 'yes', // no
	    'image_w' => '',
	    'image_h' => '',
	    'display' => 'none', // excerpt, content
	    'post_meta' => 'yes', // yes
	    'post_date' => 'yes', // yes
	    'more_link' => false, // true goes to post type archive, and admits custom link
	    'more_text' => __('More &rarr;', 'themify'),
	    'limit' => 4,
	    'category' => 0, // integer category ID
	    'order' => 'DESC', // ASC
	    'orderby' => 'date', // title, rand
	    'style' => '', // grid3, grid2
	    'sorting' => 'no', // yes
	    'page_nav' => 'no', // yes
	    'paged' => '0', // internal use for pagination, dev: previously was 1
	    // slider parameters
	    'autoplay' => '',
	    'effect' => '',
	    'timeout' => '',
	    'speed' => ''
			), $atts));

	$sync = array(
	    'mod_title_portfolio' => '',
	    'layout_portfolio' => $style,
	    'category_portfolio' => $category,
	    'post_per_page_portfolio' => $limit,
	    'offset_portfolio' => '',
	    'order_portfolio' => $order,
	    'orderby_portfolio' => $orderby,
	    'display_portfolio' => $display,
	    'hide_feat_img_portfolio' => $image === 'yes' ? 'no' : 'yes',
	    'image_size_portfolio' => '',
	    'img_width_portfolio' => $image_w,
	    'img_height_portfolio' => $image_h,
	    'unlink_feat_img_portfolio' => 'no',
	    'hide_post_title_portfolio' => $title === 'yes' ? 'no' : 'yes',
	    'unlink_post_title_portfolio' => $unlink_title,
	    'hide_post_date_portfolio' => $post_date === 'yes' ? 'no' : 'yes',
	    'hide_post_meta_portfolio' => $post_meta === 'yes' ? 'no' : 'yes',
	    'hide_page_nav_portfolio' => $page_nav === 'no' ? 'yes' : 'no',
	    'animation_effect' => '',
	    'css_portfolio' => ''
	);
	$module = array(
	    'module_ID' => $this->slug . '-' . rand(0, 10000),
	    'mod_name' => $this->slug,
	    'mod_settings' => $sync
	);

	return self::retrieve_template('template-' . $this->slug . '.php', $module, '', '', false);
    }

    /**
     * Render plain content for static content.
     * 
     * @param array $module 
     * @return string
     */
    public function get_plain_content($module) {
	return ''; // no static content for dynamic content
    }

}

///////////////////////////////////////
// Module Options
///////////////////////////////////////

if (Themify_Builder_Model::is_cpt_active('portfolio')) {
    Themify_Builder_Model::register_module('TB_Portfolio_Module');
}
