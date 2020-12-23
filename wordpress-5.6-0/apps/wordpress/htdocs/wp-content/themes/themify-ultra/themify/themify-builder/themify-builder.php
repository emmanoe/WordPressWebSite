<?php

/**
 * Framework Name: Themify Builder
 * Framework URI: https://themify.me/
 * Description: Page Builder with interactive drag and drop features
 * Version: 1.0
 * Author: Themify
 * Author URI: https://themify.me
 *
 *
 * @package ThemifyBuilder
 * @category Core
 * @author Themify
 */
if (!defined('ABSPATH'))
    exit; // Exit if accessed directly
/**
 * Define builder constant
 */
define('THEMIFY_BUILDER_REGENERATE_CSS', false);
define('THEMIFY_BUILDER_DIR', dirname(__FILE__));
define('THEMIFY_BUILDER_MODULES_DIR', THEMIFY_BUILDER_DIR . '/modules');
define('THEMIFY_BUILDER_TEMPLATES_DIR', THEMIFY_BUILDER_DIR . '/templates');
define('THEMIFY_BUILDER_CLASSES_DIR', THEMIFY_BUILDER_DIR . '/classes');
define('THEMIFY_BUILDER_INCLUDES_DIR', THEMIFY_BUILDER_DIR . '/includes');
define('THEMIFY_BUILDER_LIBRARIES_DIR', THEMIFY_BUILDER_INCLUDES_DIR . '/libraries');


// URI Constant
define('THEMIFY_BUILDER_URI', THEMIFY_URI . '/themify-builder');
define('THEMIFY_BUILDER_CSS_MODULES', THEMIFY_BUILDER_URI . '/css/modules/');
define('THEMIFY_BUILDER_JS_MODULES', THEMIFY_BUILDER_URI . '/js/modules/');
/**
 * Include builder class
 */
require_once( THEMIFY_BUILDER_CLASSES_DIR . '/class-themify-builder-model.php' );
require_once( THEMIFY_BUILDER_CLASSES_DIR . '/class-themify-builder-layouts.php' );
require_once( THEMIFY_BUILDER_CLASSES_DIR . '/class-themify-global-styles.php' );
require_once( THEMIFY_BUILDER_CLASSES_DIR . '/class-themify-custom-fonts.php' );
require_once( THEMIFY_BUILDER_CLASSES_DIR . '/class-themify-builder.php' );
///////////////////////////////////////////
// Version Getter
///////////////////////////////////////////
if (!function_exists('themify_builder_get')) {

    function themify_builder_get($theme_var, $builder_var = false,$data_only=true) {
	static $is=null;
	if($is===null){
	    $is=themify_is_themify_theme();
	}
        if ($is===true) {
            return themify_get($theme_var,null,$data_only);
        }
        if ($builder_var === false) {
            return false;
        }
        global $post;
        $data = Themify_Builder_Model::get_builder_settings();
        if (isset($data[$builder_var]) && $data[$builder_var] !== '') {
            return $data[$builder_var];
        } else if (is_object($post) && ($val = get_post_meta($post->ID, $builder_var, true)) !== '') {
            return $val;
        }
        return null;
    }

}
if ( ! function_exists( 'themify_builder_check' ) ) {

    function themify_builder_check( $theme_var, $builder_var = false, $data_only = true ) {
		$val = themify_builder_get( $theme_var, $builder_var, $data_only );

		return $val !== null && $val !== '' && $val !== 'off';
    }

}
/**
 * Init themify builder class
 */
add_action('after_setup_theme', 'themify_builder_init', 15);

function themify_builder_init() {
    if ( class_exists( 'Themify_Builder' ) && Themify_Builder_Model::builder_check() ) {
		do_action( 'themify_builder_before_init' );
		global $ThemifyBuilder;
		$ThemifyBuilder = new Themify_Builder();
		add_action( 'init', array( $ThemifyBuilder,'init' ), 0 );
    }
}

if (!function_exists('themify_manage_builder')) {

    /**
     * Builder Settings
     * @param array $data
     * @return string
     * @since 1.2.7
     */
    function themify_manage_builder($data = array()) {
        $data = themify_get_data();
        $pre = 'setting-page_builder_';

        $output = '';
        $modules = Themify_Builder_Model::get_modules('all');
        foreach ($modules as $k=>$m) {
		$exclude = $pre . 'exc_' . $k;
		$checked = !empty($data[$exclude]) ? 'checked="checked"' : '';
		$output .= '<p><span><input id="builder_module_' . $k. '" type="checkbox" name="' . $exclude . '" value="1" ' . $checked . '/> <label for="builder_module_' . $k . '">' . wp_kses_post(sprintf(__('Disable "%s" module', 'themify'), $m['name'])) . '</label></span></p>';
	   
        }

        return $output;
    }

}

if (!function_exists('tb_tools_options')) {

    /**
     * Call and return all tools options HTML
     * @return array posts id
     * @since 4.1.2
     */
    function tb_tools_options() {
        return tb_find_and_replace().themify_regenerate_css_files().tb_maintenance_mode();
    }

}

if (!function_exists('themify_regenerate_css_files')) {

    /**
     * Builder Settings
     * @param array $data
     * @return string
     * @since 1.2.7
     */
    function themify_regenerate_css_files($data = array()) {
        $output = '<hr><h4>'.__('Regenerate CSS Files','themify').'</h4>';
        $output .= '<p><label class="label" for="builder-regenerate-css-files">' . __('Regenerate Files', 'themify').themify_help(__('Builder styling are output to the generated CSS files stored in \'wp-content/uploads\' folder. Regenerate files will update all data in the generated files (eg. correct background image paths, etc.).', 'themify')) . '</label><input id="builder-regenerate-css-files" type="button" value="'.__('Regenerate CSS Files','themify').'" class="themify_button"/></p>';
        return $output;
    }

}

if (!function_exists('tb_find_and_replace')) {

    /**
     * Add find and replace string tool to builder setting
     * @param array $data
     * @return string
     * @since 4.1.2
     */
    function tb_find_and_replace($data = array()) {
        $in_progress = true === get_transient( 'themify_find_and_replace_in_progress' );
        $disabled = $in_progress ? 'disabled="disabled"' : '';
        $value = $in_progress ? __('Replacing ...','themify') : __('Replace','themify');
        $output = '<h4>'.__('Find & Replace','themify').'</h4>';
        $output .= '<p><span class="label">' . __( 'Search for', 'themify' ) . '</span> <input type="text" class="width10" id="original_string" name="original_string" /></p>';
        $output .= '<p><span class="label">' . __( 'Replace to', 'themify' ) .themify_help(__('Use this tool to replace the strings in the Builder data. Warning: Please backup your database before replacing strings, this can not be undone.', 'themify')) . '</span> <input type="text" class="width10" id="replace_string" name="replace_string" /></p>';
        $output .= '<p><span class="pushlabel"><input id="builder-find-and-replace-btn" type="button" name="builder-find-and-replace-btn" '.$disabled.' value="'.$value.'" class="themify_button"/> </span></p>';
        return $output;
    }

}

if (!function_exists('themify_manage_builder_active')) {

    /**
     * Builder Settings
     * @param array $data
     * @return string
     * @since 1.2.7
     */
    function themify_manage_builder_active($data = array()) {
        $pre = 'setting-page_builder_';
        $options = array(
            array('name' => __('Enable', 'themify'), 'value' => 'enable'),
            array('name' => __('Disable', 'themify'), 'value' => 'disable')
        );

        $output = sprintf('<p><span class="label">%s</span><select id="%s" name="%s">%s</select>%s</p>', esc_html__('Themify Builder:', 'themify'), $pre . 'is_active', $pre . 'is_active', themify_options_module($options, $pre . 'is_active'), sprintf('<small class="pushlabel" data-show-if-element="[name=setting-page_builder_is_active]" data-show-if-value="disable">%s</small>'
                        , esc_html__('WARNING: When Builder is disabled, all Builder content/layout will not appear. They will re-appear once Builder is enabled.', 'themify'))
        );

        if ('disable' !== themify_builder_get($pre . 'is_active')) {

            $output .= sprintf('<p><label for="%s"><input type="checkbox" id="%s" name="%s"%s> %s</label></p>', $pre . 'disable_shortcuts', $pre . 'disable_shortcuts', $pre . 'disable_shortcuts', checked('on', themify_builder_get($pre . 'disable_shortcuts', 'builder_disable_shortcuts'), false), wp_kses_post(__('Disable Builder shortcuts (eg. disable shortcut like Cmd+S = save)', 'themify'))
            );

			// Disable WP editor
			$output .= sprintf('<p><label for="%s"><input type="checkbox" id="%s" name="%s"%s> %s</label></p>', $pre . 'disable_wp_editor', $pre . 'disable_wp_editor', $pre . 'disable_wp_editor', checked('on', themify_builder_get($pre . 'disable_wp_editor', 'builder_disable_wp_editor'), false), wp_kses_post(__('Disable WordPress editor when Builder is in use', 'themify'))
            );
        }

		/**
		 * Scroll to Offset
		 */
		$output .=
            '<p>'.
                '<span class="label">' . __('ScrollTo Position', 'themify') .themify_help(__('Enter the top position where row anchor should scrollTo', 'themify')) . '</span>'.
                '<input type="number" class="width4" min="0" max=5000" step="1" name="setting-scrollto_offset" value="' . themify_get( 'setting-scrollto_offset' ) . '" /> ' .
            '</p>';

        return $output;
    }

}

if (!function_exists('themify_manage_builder_animation')) {

    /**
     * Builder Setting Animations
     * @param array $data
     * @return string
     * @since 2.0.0
     */
    function themify_manage_builder_animation($data = array()) {
        $pre = 'setting-page_builder_animation_';
        $options = array(
            array('name' => '', 'value' => 'none'),
            array('name' => esc_html__('Disable on mobile & tablet', 'themify'), 'value' => 'mobile'),
            array('name' => esc_html__('Disable on all devices', 'themify'), 'value' => 'all')
        );

        $output = sprintf('<p><label for="%s" class="label">%s</label><select id="%s" name="%s">%s</select></p>', $pre . 'appearance', esc_html__('Entrance Animation', 'themify'), $pre . 'appearance', $pre . 'appearance', themify_options_module($options, $pre . 'appearance')
        );
        $output .= sprintf('<p><label for="%s" class="label">%s</label><select id="%s" name="%s">%s</select></p>', $pre . 'parallax_bg', esc_html__('Parallax Background', 'themify'), $pre . 'parallax_bg', $pre . 'parallax_bg', themify_options_module($options, $pre . 'parallax_bg')
        );
        $output .= sprintf('<p><label for="%s" class="label">%s</label><select id="%s" name="%s">%s</select></p>', $pre . 'scroll_effect', esc_html__('Scroll Effects', 'themify'), $pre . 'scroll_effect', $pre . 'scroll_effect', themify_options_module($options, $pre . 'scroll_effect', true)
        );
        $output .= sprintf('<p><label for="%s" class="label">%s</label><select id="%s" name="%s">%s</select></p>', $pre . 'sticky_scroll', esc_html__('Sticky Scrolling', 'themify'), $pre . 'sticky_scroll', $pre . 'sticky_scroll', themify_options_module($options, $pre . 'sticky_scroll')
        );

        return $output;
    }

}

/**
 * Add Builder to all themes using the themify_theme_config_setup filter.
 * @param $themify_theme_config
 * @return mixed
 * @since 1.4.2
 */
function themify_framework_theme_config_add_builder($themify_theme_config) {
    $themify_theme_config['panel']['settings']['tab']['page_builder'] = array(
        'title' => __('Themify Builder', 'themify'),
        'id' => 'themify-builder',
        'custom-module' => array(
            array(
                'title' => __('Themify Builder Options', 'themify'),
                'function' => 'themify_manage_builder_active'
            )
        )
    );
    if(Themify_Builder_Model::builder_check()){

		if ( Themify_Builder_Model::check_module_active( 'optin' ) ) {
			$themify_theme_config['panel']['settings']['tab']['integration-api']['custom-module'][] = array(
				'title' => __('Optin', 'themify'),
				'function' => 'themify_setting_optin',
			);
		}

	if ('disable' !== apply_filters('themify_enable_builder', themify_get('setting-page_builder_is_active',false,true))) {
	    $themify_theme_config['panel']['settings']['tab']['page_builder']['custom-module'][] = array(
		'title' => __('Animation Effects', 'themify'),
		'function' => 'themify_manage_builder_animation'
	    );

	    $themify_theme_config['panel']['settings']['tab']['page_builder']['custom-module'][] = array(
		'title' => __('Builder Modules', 'themify'),
		'function' => 'themify_manage_builder'
	    );
	    
	    $themify_theme_config['panel']['settings']['tab']['page_builder']['custom-module'][] = array(
		    'title' => __('Tools', 'themify'),
		    'function' => 'tb_tools_options'
	    );
	}
    }
    return $themify_theme_config;
}

add_filter( 'themify_theme_config_setup', 'themify_framework_theme_config_add_builder', 11 );

function themify_setting_optin() {
	if ( isset( $_GET['tb_option_flush_cache'] ) ) {
		$services = Builder_Optin_Services_Container::get_instance()->get_providers();
		foreach ( $services as $id => $instance ) {
			$instance->clear_cache();
		}
	}

	ob_start();
	$providers = Builder_Optin_Services_Container::get_instance()->get_providers();
	foreach ( $providers as $id => $instance ) {
		if ( $options = $instance->get_global_options() ) {
			?>
			<fieldset id="themify_setting_<?php echo $id; ?>">
				<legend>
					<span><?php echo $instance->get_label(); ?></span>
					<i class="tf_plus_icon"></i>
				</legend>
				<div class="themify_panel_fieldset_wrap" style="display: block !important;">
					<?php foreach ( $options as $field ) : ?>
						<p>
							<label class="label" for="setting-<?php echo $field['id']; ?>"><?php echo $field['label'] ?></label>
							<input type="text" name="setting-<?php echo $field['id']; ?>" id="setting-<?php echo $field['id']; ?>" value="<?php echo esc_attr( themify_builder_get( "setting-{$field['id']}" ) ); ?>" class="width10">
							<?php if ( isset( $field['description'] ) ) : ?>
								<small class="pushlabel"><?php echo $field['description'] ?></small>
							<?php endif; ?>
						</p>
					<?php endforeach; ?>
				</div><!-- .themify_panel_fieldset_wrap -->
			</fieldset>
		<?php } ?>
	<?php } ?>

	<br>
	<p>
		<a href="<?php echo add_query_arg( 'tb_option_flush_cache', 1 ); ?>" class="tb_option_flush_cache themify_button"><span><?php _e( 'Clear API Cache', 'themify' ); ?></span> </a>
	</p>

	<?php
	return ob_get_clean();
}

if (!function_exists('tb_maintenance_mode')) {
	/**
	 * Add Maintenance mode to builder setting
	 * @return string
	 * @since 4.5.8
	 */
	function tb_maintenance_mode() {
		$pre = 'setting-page_builder_';
		$output = '<hr><h4>' . __( 'Maintenance Mode', 'themify' ) . '</h4>';
		$checkbox = sprintf( '<p><label class="label" for="%s">%s</label><label for="%s"><input type="checkbox" id="%s" name="%s"%s> %s</label><span class="pushlabel"><small>%s</small></span></p>',
			'tb_maintenance_mode',
			__( 'Maintenance', 'themify' ),
			$pre . 'maintenance_mode',
			$pre . 'maintenance_mode',
			$pre . 'maintenance_mode',
			checked('on', themify_builder_get($pre . 'maintenance_mode', 'tools_maintenance_mode'), false) ? ' checked="checked"' : '',
			__( 'Enable Maintenance Mode', 'themify' ),
			__( 'Once it is enabled, only logged-in users can see your site.', 'themify' )
		);
		$selected_value = themify_builder_get( 'setting-page_builder_maintenance_page', 'tools_maintenance_page' );
		$selected_page = empty($selected_value) ? '' : get_page_by_path( $selected_value, OBJECT, 'page' );
		$page_dropdown = sprintf( '<div data-show-if-element="[name=setting-page_builder_maintenance_mode]" data-show-if-value="true"><label class="label" for="%s">%s</label><select id="%s" name="%s">%s<option>%s</option></select><div data-show-if-element="[name=page_builder_maintenance_mode]" data-show-if-value="true" class="pushlabel"><small>%s</small></div></p>',
			$pre . 'maintenance_page',
			__( 'Maintenance Page', 'themify' ),
			$pre . 'maintenance_page',
			$pre . 'maintenance_page',
			!is_object($selected_page) ? '<option></option>' : sprintf('<option value="%s" selected="selected">%s</option>',$selected_value,$selected_page->post_title),
			__( 'Loading...', 'themify' ),
			__( 'Select a page to show for public users.', 'themify' )
		);
		$output .= sprintf( '%s %s',
			$checkbox,
			$page_dropdown
		);
		return $output;
	}
}
