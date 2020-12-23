<?php
if (!defined('ABSPATH'))
    exit; // Exit if accessed directly
/**
 * Template Part
 * 
 * Access original fields: $args['mod_settings']
 * @author Themify
 */
global $ThemifyBuilder;
$fields_default = array(
    'mod_title_layout_part' => '',
    'selected_layout_part' => '',
    'add_css_layout_part' => ''
);
$fields_args = wp_parse_args($args['mod_settings'], $fields_default);
unset($args['mod_settings']);
$fields_default=null;
$mod_name=$args['mod_name'];
$builder_id = $args['builder_id'];
$element_id = $args['module_ID'];
if (!self::$layout_part_id) {
    self::$layout_part_id = self::$post_id;
}
self::$post_id = $fields_args['selected_layout_part'];
$container_class = apply_filters('themify_builder_module_classes', array(
    'module', 'module-' . $mod_name, $element_id,$fields_args['add_css_layout_part']
                ), $mod_name, $element_id, $fields_args);

if(!empty($fields_args['global_styles']) && Themify_Builder::$frontedit_active===false){
    $container_class[] = $fields_args['global_styles'];
}
$container_props = apply_filters('themify_builder_module_container_props', array(
    'class' => implode(' ', $container_class),
), $fields_args, $mod_name, $element_id);
$args=null;
$isLoop = $ThemifyBuilder->in_the_loop === true;
?>
<!-- module template_part -->
<div <?php echo self::get_element_attributes(self::sticky_element_props($container_props,$fields_args)); ?>>
    <?php 
    $container_props=$container_class=null;
    do_action('themify_builder_background_styling',$builder_id,array('styling'=>$fields_args,'mod_name'=>$mod_name),$element_id,'module');
    $ThemifyBuilder->in_the_loop = true;
    $layoutPart=$fields_args['selected_layout_part']!==''?do_shortcode('[themify_layout_part slug="' . $fields_args['selected_layout_part'] . '"]'):'';
    $ThemifyBuilder->in_the_loop = $isLoop;
    if($layoutPart!==''){
		if ($fields_args['mod_title_layout_part'] !== ''){
			echo $fields_args['before_title'] , apply_filters('themify_builder_module_title', $fields_args['mod_title_layout_part'], $fields_args), $fields_args['after_title']; 
		}
		echo $layoutPart; 
    }
    ?>
</div>
<!-- /module template_part -->
<?php
self::$post_id = self::$layout_part_id;