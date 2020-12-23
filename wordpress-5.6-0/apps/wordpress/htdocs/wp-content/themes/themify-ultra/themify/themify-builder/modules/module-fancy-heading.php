<?php
if (!defined('ABSPATH'))
    exit; // Exit if accessed directly
/**
 * Module Name: Fancy Heading
 * Description: Heading with fancy styles
 */

class TB_Fancy_Heading_Module extends Themify_Builder_Component_Module {

    function __construct() {
	self::$texts['sub_heading'] = __('Sub Heading', 'themify');
	self::$texts['heading'] = __('Heading', 'themify');
	parent::__construct(array(
	    'name' => __('Fancy Heading', 'themify'),
	    'slug' => 'fancy-heading'
	));
    }
    
    public function get_icon(){
	return 'smallcap';
    }

    public function get_assets() {
	return array(
		'css'=>THEMIFY_BUILDER_CSS_MODULES.$this->slug.'.css'
	);
    }
    public function get_options() {
	$aligment = Themify_Builder_Model::get_text_aligment();
	foreach($aligment as $k=>$v){
	    if('justify'===$v['value']){
	        unset($aligment[$k]);
	        continue;
        }
		$aligment[$k]['value'] = 'themify-text-'.$v['value'];
	}
	return array(
	    array(
		'id' => 'heading',
		'type' => 'text',
		'label' => self::$texts['heading'],
		'class' => 'fullwidth',
		'control' => array(
		    'selector' => '.main-head'
		)
	    ),
		array(
			'id' => 'heading_link',
			'type' => 'url',
			'label' => __('Heading Link', 'themify'),
			'class' => 'fullwidth',
		),
	    array(
		'id' => 'sub_heading',
		'type' => 'text',
		'label' => self::$texts['sub_heading'],
		'class' => 'fullwidth',
		'control' => array(
		    'selector' => '.sub-head'
		)
	    ),
		array(
			'id' => 'sub_heading_link',
			'type' => 'url',
			'label' => __('Sub Heading Link', 'themify'),
			'class' => 'fullwidth',
		),
	    array(
		'id' => 'heading_tag',
		'label' => __('HTML Tag', 'themify'),
		'type' => 'select',
		'options' => array(
		    'h1' => 'h1',
		    'h2' => 'h2',
		    'h3' => 'h3'
		)
	    ),
	    array(
		'id' => 'text_alignment',
		'label' => __('Text Alignment', 'themify'),
		'type' => 'icon_radio',
		'options' => $aligment
	    ),
		array(
			'id' => 'inline_text',
			'type' => 'checkbox',
			'label' => __('Inline Text', 'themify'),
			'options' => array(
				array( 'name' => '1', 'value' => __( 'Display main & sub heading as one line', 'themify' )),
			),
			'control' => array(
				'type' => 'refresh'
			),
		),
		array(
			'id' => 'divider',
			'label' => __('Divider', 'themify'),
			'type' => 'toggle_switch',
			'options'   => array(
				'on'  => array( 'name' => 'yes', 'value' => '' ),
				'off' => array( 'name' => 'no', 'value' => '' ),
			),
		),
	    // Additional CSS
	    array(
		'id' => 'css_class',
		'type' => 'custom_css'
	    ),
	    array('type' => 'custom_css_id')
	);
    }

    public function get_live_default() {
	return array(
	    'heading' => self::$texts['heading'],
	    'sub_heading' => self::$texts['sub_heading'],
	    'divider' => 'yes'
	);
    }

    public function get_styling() {
	$general = array(
	    // Background
	    self::get_expand('bg', array(
		self::get_tab(array(
		    'n' => array(
			'options' => array(
			    self::get_image()
			)
		    ),
		    'h' => array(
			'options' => array(
			     self::get_image('', 'b_i','bg_c','b_r','b_p', 'h')
			)
		    )
		))
	    )),
	    // Padding
	    self::get_expand('p', array(
		self::get_tab(array(
		    'n' => array(
			'options' => array(
			    self::get_padding()
			)
		    ),
		    'h' => array(
			'options' => array(
			    self::get_padding('', 'p', 'h')
			)
		    )
		))
	    )),
	    // Margin
	    self::get_expand('m', array(
		self::get_tab(array(
		    'n' => array(
			'options' => array(
			    self::get_margin()
			)
		    ),
		    'h' => array(
			'options' => array(
			    self::get_margin('', 'm', 'h')
			)
		    )
		))
	    )),
	    // Border
	    self::get_expand('b', array(
		self::get_tab(array(
		    'n' => array(
			'options' => array(
			    self::get_border()
			)
		    ),
		    'h' => array(
			'options' => array(
			    self::get_border('', 'b', 'h')
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
			// Width
			self::get_expand('w', array(
				self::get_tab(array(
					'n' => array(
						'options' => array(
							self::get_width('', 'w')
						)
					),
					'h' => array(
						'options' => array(
							self::get_width('', 'w', 'h')
						)
					)
				))
			)),
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
		// Display
		self::get_expand('disp', self::get_display())
	);

	$heading = array(
	    // Font
	    self::get_expand('f', array(
	    self::get_tab(array(
		'n' => array(
		    'options' => array(
			self::get_font_family('.module .main-head'),
			self::get_color_type(array('.module .main-head', '.module .main-head a')),
			self::get_font_size('.module .main-head'),
			self::get_line_height('.module .main-head'),
			self::get_letter_spacing('.module .main-head'),
			self::get_text_transform('.module .main-head', 'text_transform_maintitle'),
			self::get_font_style('.module .main-head', 'font_style_maintitle'),
			self::get_text_shadow('.module .main-head', 't_sh_h'),
			// Main Heading Margin
			self::get_heading_margin_multi_field('.module .main-head', '', 'top', '', 'main'),
			self::get_heading_margin_multi_field('.module .main-head', '', 'bottom', '', 'main')
		    )
		),
		'h' => array(
		    'options' => array(
			self::get_font_family('.module:hover .main-head', 'f_f_h'),
			self::get_color_type(array('.module:hover .main-head', '.module:hover .main-head a'),'','f_c_t_h',  'f_c_h', 'f_g_c_h'),
			self::get_font_size('.module:hover .main-head', 'f_s_h'),
			self::get_line_height('.module:hover .main-head', 'l_h_h'),
			self::get_letter_spacing('.module:hover .main-head', 'l_s_h'),
			self::get_text_transform('.module:hover .main-head', 't_t_m_h'),
			self::get_font_style('.module:hover .main-head', 'f_st_m_h', 'f_w_h'),
			self::get_text_shadow('.module:hover .main-head', 't_sh_h_h'),
			// Main Heading Margin
			self::get_heading_margin_multi_field(':hover .main-head', '', 'top', '', 'm_h'),
			self::get_heading_margin_multi_field(':hover .main-head', '', 'bottom', '', 'm_h')
		    )
		)
	    ))
	    )),
	    // Link
	    self::get_expand('l', array(
		self::get_tab(array(
		    'n' => array(
			'options' => array(
			    self::get_color(array('.module .main-head a'), 'l_c_mh'),
			    self::get_text_decoration('.module .main-head a','t_d_mh')
			)
		    ),
		    'h' => array(
			'options' => array(
			    self::get_color(array('.module .main-head a:hover'), 'l_c_mh_h', null,null,''),
			    self::get_text_decoration('.module .main-head a:hover', 't_d_mh_h', 'h')
			)
		    )
		))
	    ))
	);

	$subheading = array(
	    // Font
	    self::get_expand('f', array(
	    self::get_tab(array(
		'n' => array(
		    'options' => array(
			self::get_font_family('.module .sub-head', 'font_family_subheading'),
			self::get_color_type(array('.module .sub-head', '.module .sub-head a'), '','font_color_type_subheading',  'font_color_subheading', 'font_gradient_color_subheading'),
			self::get_font_size('.module .sub-head', 'font_size_subheading'),
			self::get_line_height('.module .sub-head', 'line_height_subheading'),
			self::get_letter_spacing('.module .sub-head', 'letter_spacing_subheading'),
			self::get_text_transform('.module .sub-head', 'text_transform_subtitle'),
			self::get_font_style('.module .sub-head', 'font_style_subtitle'),
			self::get_text_shadow('.module .sub-head', 't_sh_s_h'),
			// Sub Heading Margin
			self::get_heading_margin_multi_field('.module .sub-head', '', 'top', '', 'sub'),
			self::get_heading_margin_multi_field('.module .sub-head', '', 'bottom', '', 'sub')
		    )
		),
		'h' => array(
		    'options' => array(
			self::get_font_family('.module:hover .sub-head', 'f_f_s_h'),
			self::get_color_type(array('.module:hover .sub-head', '.module:hover .sub-head a'),'','f_c_t_s_h',  'f_c_s_h', 'f_g_c_s_h'),
			self::get_font_size('.module:hover .sub-head', 'f_s_s_h'),
			self::get_line_height('.module:hover .sub-head', 'l_h_s_h'),
			self::get_letter_spacing('.module:hover .sub-head', 'l_s_s_h'),
			self::get_text_transform('.module:hover .sub-head', 't_t_s_h'),
			self::get_font_style('.module:hover .sub-head', 'f_st_s_h'),
			self::get_text_shadow('.module:hover .sub-head', 't_sh_s_h_h'),
			// Sub Heading Margin
			self::get_heading_margin_multi_field('.module:hover .sub-head', '', 'top', '', 's_h'),
			self::get_heading_margin_multi_field('.module:hover .sub-head', '', 'bottom', '', 's_h')
		    )
		)
	))
	    )),
	    // Link
	    self::get_expand('l', array(
		self::get_tab(array(
		    'n' => array(
			'options' => array(
			    self::get_color(array('.module .sub-head a'), 'l_c_sh'),
			    self::get_text_decoration('.module .sub-head a','t_d_sh')
			)
		    ),
		    'h' => array(
			'options' => array(
			    self::get_color(array('.module .sub-head a:hover'), 'l_c_sh_h', null,null,''),
			    self::get_text_decoration('.module .sub-head a:hover', 't_d_sh_h', 'h')
			)
		    )
		))
	    ))
	);

	$fh_divider = array(
	    // Divider Top/Bottom Margin
	    self::get_expand('m', array(
		self::get_heading_margin_multi_field(array('.module .sub-head::before', '.module .sub-head::after'), '', 'top', 'divider'),
		self::get_heading_margin_multi_field(array('.module .sub-head::before', '.module .sub-head::after'), '', 'bottom', 'divider'),
	    )),
	    // Divider Border
	    self::get_expand('b', array(
		self::get_border(array('.module .sub-head::before', '.module .sub-head::after'), 'd_border')
	    )),
	    // Divider Width
	    self::get_expand('w', array(
		self::get_width(array('.module .sub-head::before', '.module .sub-head::after'), 'd_width')
	    ))
	);


	return array(
	    'type' => 'tabs',
	    'options' => array(
		'g' => array(
		    'options' => $general
		),
		'head' => array(
		    'options' => $heading
		),
		's' => array(
		    'label' => __('Sub Heading', 'themify'),
		    'options' => $subheading
		),
		'f' => array(
		    'label' => __('Divider', 'themify'),
		    'options' => $fh_divider
		)
	    )
	);
    }

    protected function _visual_template() {
	?>
    <# var inline=data.inline_text==='1'?' inline-fancy-heading':'';#>
	<div class="module module-<?php echo $this->slug; ?> {{ data.css_class }}{{ inline }}">
	    <# 
	    var heading_tag = !data.heading_tag ? 'h1' : data.heading_tag,
                text_alignment=data.text_alignment?'tf_text'+(data.text_alignment.replace('themify-text-',''))[0]:'',
                divider = ( 'no' === data.divider ) ? ' tb_hide_divider' : '',
                headingLink = ( '' !== data.heading_link && undefined !== data.heading_link ) ? 'href='+data.heading_link : '',
		subHeadingLink = ( '' !== data.sub_heading_link && undefined !== data.sub_heading_link ) ? 'href=' + data.sub_heading_link : '';
        inline=inline===''?'tf_block':'tf_inline_b';
	    #>
	    <{{ heading_tag }} class="fancy-heading {{ text_alignment }}">
        <span class="main-head {{inline}}" contenteditable="false" data-name="heading">
            <# if('' === headingLink){ #>
                    {{{ data.heading }}}
            <# }else{ #>
                <a {{headingLink}} >{{{ data.heading }}}</a>
            <# } #>
        </span>
        <span class="sub-head{{divider}} {{inline}} tf_rel" contenteditable="false" data-name="subheading">
            <# if('' === subHeadingLink){ #>{{{ data.sub_heading }}}<# }else{ #>
                <a {{subHeadingLink}} >{{{ data.sub_heading }}}</a>
            <# } #>
        </span>
	    </{{ heading_tag }}>
	</div>
	<?php
    }

    /**
     * Render plain content for static content.
     * 
     * @param array $module 
     * @return string
     */
    public function get_plain_content($module) {
	$mod_settings = wp_parse_args($module['mod_settings'], array(
	    'heading' => '',
	    'heading_tag' => 'h1',
	    'sub_heading' => ''
	));
	return sprintf('<%s>%s<br/>%s</%s>', $mod_settings['heading_tag'], $mod_settings['heading'], $mod_settings['sub_heading'], $mod_settings['heading_tag']);
    }

}

///////////////////////////////////////
// Module Options
///////////////////////////////////////
Themify_Builder_Model::register_module('TB_Fancy_Heading_Module');
