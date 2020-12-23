<?php
if (!defined('ABSPATH'))
    exit; // Exit if accessed directly
///////////////////////////////////////
// Switch Template Layout Types
///////////////////////////////////////
$fields_default = array(
    'layout_slider' => '',
    'img_h_slider' => '',
    'img_w_slider' => '',
    'image_size_slider' => '',
    'css_slider' => '',
    'animation_effect' => '',
    'grid_layout_testimonial'=>'grid3',
    'masonry'=>''
);

$fields_args = wp_parse_args($args['mod_settings'], $fields_default);
unset($args['mod_settings']);
$fields_default=null;
$fields_args['type_testimonial']='grid';
$mod_name=$args['mod_name'];
$builder_id = $args['builder_id'];
$element_id = $args['module_ID'];

$container_class =  apply_filters('themify_builder_module_classes', array(
    'module clearfix', 
    'module-' . $mod_name, 
    $element_id,
    $fields_args['css_slider'],
    $fields_args['layout_slider']
), $mod_name, $element_id, $fields_args);

if(!empty($fields_args['global_styles']) && Themify_Builder::$frontedit_active===false){
    $container_class[] = $fields_args['global_styles'];
}
$container_props = apply_filters('themify_builder_module_container_props', self::parse_animation_effect($fields_args,array(
    'id' => $element_id,
    'class' => implode(' ',$container_class)
	)), $fields_args, $mod_name, $element_id);
$fields_args['margin'] = '';
if(Themify_Builder::$frontedit_active===false){
	    $container_props['data-lazy']=1;
}
$masonry = 'enable' === $fields_args['masonry'];
$class=array();
if($masonry===true){
    $class[]='masonry';
}
$class=apply_filters( 'themify_loops_wrapper_class', $class,'testominal',$fields_args['grid_layout_testimonial'],$fields_args,$mod_name);
?>
<div <?php echo self::get_element_attributes(self::sticky_element_props($container_props,$fields_args)); ?>>
    <div class="themify_builder_testimonial loops-wrapper builder-posts-wrap <?php echo implode(' ',$class); ?> tf_clear"<?php if($masonry===true && Themify_Builder::$frontedit_active===false):?> data-lazy="1"<?php endif;?>>
	    <?php
	    $container_props=$container_class=$class=null;
	    do_action('themify_builder_background_styling',$builder_id,array('styling'=>$fields_args,'mod_name'=>$mod_name),$element_id,'module');
	    self::retrieve_template('template-' . $mod_name . '-content.php', array(
		'module_ID' => $element_id,
		'mod_name' => $mod_name,
		'settings' => $fields_args
	    ), '', '', true);
	    ?>
    </div>
</div>
