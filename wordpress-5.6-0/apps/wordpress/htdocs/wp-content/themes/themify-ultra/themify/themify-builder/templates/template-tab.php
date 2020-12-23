<?php
if (!defined('ABSPATH'))
    exit; // Exit if accessed directly
/**
 * Template Tab
 * 
 * Access original fields: $args['mod_settings']
 * @author Themify
 */
$fields_default = array(
    'mod_title_tab' => '',
    'layout_tab' => 'minimal',
    'style_tab' => 'default',
    'color_tab' => 'tb_default_color',
    'tab_appearance_tab' => '',
    'tab_content_tab' => array(),
    'css_tab' => '',
    'animation_effect' => '',
    'allow_tab_breakpoint' => '',
    'tab_breakpoint'=>''
);

if (isset($args['mod_settings']['tab_appearance_tab'])) {
    $args['mod_settings']['tab_appearance_tab'] = self::get_checkbox_data($args['mod_settings']['tab_appearance_tab']);
	Themify_Builder_Model::load_appearance_css($args['mod_settings']['tab_appearance_tab']);
}
$fields_args = wp_parse_args($args['mod_settings'], $fields_default);
unset($args['mod_settings']);
$fields_default=null;
Themify_Builder_Model::load_color_css($fields_args['color_tab']);
$mod_name=$args['mod_name'];
if($fields_args['color_tab']==='transparent'){
   Themify_Builder_Model::load_module_self_style($mod_name,$fields_args['color_tab']);
}
if($fields_args['layout_tab']!=='tab-frame'){
   Themify_Builder_Model::load_module_self_style($mod_name,$fields_args['layout_tab']);
}
$builder_id = $args['builder_id'];
$element_id = $args['module_ID'];

$container_class = apply_filters('themify_builder_module_classes', array(
    'module ui',
    'module-' . $mod_name,
    $element_id, 
    $fields_args['layout_tab'], 
    'tab-style-' . $fields_args['style_tab'], 
    $fields_args['tab_appearance_tab'], 
    $fields_args['color_tab'], 
    $fields_args['css_tab']
), $mod_name, $element_id, $fields_args);
if(!empty($fields_args['global_styles']) && Themify_Builder::$frontedit_active===false){
	    $container_class[] = $fields_args['global_styles'];
}
$container_props = apply_filters('themify_builder_module_container_props', self::parse_animation_effect($fields_args,array(
    'id' => $element_id,
    'class' => implode(' ', $container_class),
)), $fields_args, $mod_name, $element_id);
$args=null;
if(Themify_Builder::$frontedit_active===false){
    $container_props['data-lazy']=1;
}
if ( '' !== $fields_args['allow_tab_breakpoint'] && '' !== $fields_args['tab_breakpoint'] ){
	    $container_props['data-tab-breakpoint'] = $fields_args['tab_breakpoint'];
} 
?>
<!-- module tab -->
<div <?php echo self::get_element_attributes(self::sticky_element_props($container_props,$fields_args)); ?>>
    <?php $container_props=$container_class=null; 
	do_action('themify_builder_background_styling',$builder_id,array('styling'=>$fields_args,'mod_name'=>$mod_name),$element_id,'module');
    ?>
    <?php if ($fields_args['mod_title_tab'] !== ''): ?>
	<?php echo $fields_args['before_title'] . apply_filters('themify_builder_module_title', $fields_args['mod_title_tab'], $fields_args). $fields_args['after_title']; ?>
    <?php endif; ?>
    <div class="builder-tabs-wrap tf_rel">
	<span class="tab-nav-current-active tf_hide"><?php echo $fields_args['tab_content_tab'][0]['title_tab'] ?></span>
	<ul class="tab-nav clearfix">
	    <?php foreach ($fields_args['tab_content_tab'] as $k => $tab): ?>
		<li <?php echo 0 === $k ? 'class="current" aria-expanded="true"' : 'aria-expanded="false"'; ?>>
		    <a href="#tab-<?php echo $element_id . '-' . $k; ?>">
			<?php if (isset($tab['icon_tab'])) : ?><i><?php echo themify_get_icon($tab['icon_tab']); ?></i><?php endif; ?>
			<span<?php if(Themify_Builder::$frontedit_active===true):?> contenteditable="false" data-name="title_tab" data-index="<?php echo $k?>" data-repeat="tab_content_tab" <?php endif; ?>><?php echo isset($tab['title_tab']) ? $tab['title_tab'] : ''; ?></span>
		    </a>
		</li>
	    <?php endforeach; ?>
	</ul>

	<?php foreach ($fields_args['tab_content_tab'] as $k => $tab): ?>
	    <div data-id="tab-<?php echo $element_id . '-' . $k; ?>" class="tab-content" <?php echo $k === 0 ? 'aria-hidden="false"' : 'aria-hidden="true"' ?>>
		<div class="tb_text_wrap<?php if(Themify_Builder::$frontedit_active===true):?> tb_editor_enable<?php endif; ?>"<?php if(Themify_Builder::$frontedit_active===true):?> contenteditable="false" data-name="title_tab" data-index="<?php echo $k?>" data-repeat="tab_content_tab"<?php endif; ?>>
		<?php
		    if (isset($tab['text_tab']) && $tab['text_tab']!=='') {
			echo apply_filters('themify_builder_module_content', $tab['text_tab']);
		    }
		?>
		</div>
	    </div>
	<?php endforeach; ?>
    </div>
</div>
<!-- /module tab -->
