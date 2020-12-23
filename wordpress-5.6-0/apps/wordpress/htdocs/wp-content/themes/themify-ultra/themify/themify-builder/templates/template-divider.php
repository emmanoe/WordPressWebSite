<?php
if (!defined('ABSPATH'))
    exit; // Exit if accessed directly
/**
 * Template Divider
 *
 * Access original fields: $args['mod_settings']
 * @author Themify
 */

$fields_default = array(
    'mod_title_divider' => '',
    'style_divider' => 'solid',
    'stroke_w_divider' => 1,
    'color_divider' => '',
    'top_margin_divider' => '',
    'bottom_margin_divider' => '',
    'css_divider' => '',
    'divider_type' => 'fullwidth',
    'divider_width' => 200,
    'divider_align' => 'left',
    'animation_effect' => ''
);

$fields_args = wp_parse_args( $args['mod_settings'], $fields_default );
unset( $args['mod_settings'] );
$fields_default=null;
$mod_name=$args['mod_name'];
$builder_id = $args['builder_id'];
$element_id = $args['module_ID'];
if ($fields_args['divider_type'] === 'custom') {
    $fields_args['divider_align'] = 'divider-' . $fields_args['divider_align'];
    $divider_type = 'divider-' . $fields_args['divider_type'];
} else {
    $divider_type = $fields_args['divider_align'] = $fields_args['divider_width'] = '';
}

    $styles = array(
	    'border-width'	=> 'stroke_w_divider',
	    'border-color'	=> 'color_divider',
	    'margin-top'	=> 'top_margin_divider',
	    'margin-bottom'	=> 'bottom_margin_divider',
	    'width'			=> 'divider_width'
    );

    $style = '';

    foreach( $styles as $prop => $val ) {
	    if( isset( $fields_args[ $val ] ) && $fields_args[ $val ]!=='') {
		    $style .= $prop . ': ';
		    $style .= $prop === 'border-color'
			    ? Themify_Builder_Stylesheet::get_rgba_color( $fields_args[ $val ] ) . ';'
			    : $fields_args[ $val ] . 'px;';
	    }
    }

$container_class = apply_filters('themify_builder_module_classes', array(
    'module tf_mw', 
    'module-' . $mod_name, 
    $element_id, 
    $fields_args['style_divider'], 
    $fields_args['css_divider'],
    $divider_type,
    $fields_args['divider_align']
), $mod_name, $element_id, $fields_args);

if(!empty($fields_args['global_styles']) && Themify_Builder::$frontedit_active===false){
    $container_class[] = $fields_args['global_styles'];
}
$container_props = apply_filters('themify_builder_module_container_props', self::parse_animation_effect($fields_args,array(
    'class' => implode(' ', $container_class),
	)), $fields_args, $mod_name, $element_id);
$args=null;
if ($style!=='') {
    $container_props['style'] = $style;
}
if(Themify_Builder::$frontedit_active===false){
    $container_props['data-lazy']=1;
}
?>
<!-- module divider -->
<div <?php echo self::get_element_attributes(self::sticky_element_props($container_props,$fields_args)); ?>>
    <?php $container_props=$container_class=null;
	do_action('themify_builder_background_styling',$builder_id,array('styling'=>$fields_args,'mod_name'=>$mod_name),$element_id,'module');
    ?>
    <?php if ($fields_args['mod_title_divider'] !== ''): ?>
	<?php echo $fields_args['before_title'] . apply_filters('themify_builder_module_title', $fields_args['mod_title_divider'], $fields_args). $fields_args['after_title']; ?>
    <?php endif; ?>
</div>
<!-- /module divider -->
