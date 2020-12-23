<?php
if (!defined('ABSPATH'))
    exit; // Exit if accessed directly
/**
 * Template Image
 * 
 * Access original fields: $args['mod_settings']
 * @author Themify
 */
$fields_default = array(
    'mod_title_image' => '',
    'style_image' => '',
    'url_image' => '',
    'appearance_image' => '',
    'caption_on_overlay' => '',
    'image_size_image' => '',
    'width_image' => '',
    'auto_fullwidth' => false,
    'height_image' => '',
    'title_image' => '',
    'link_image' => '',
    'param_image' => '',
    'image_zoom_icon' => '',
    'lightbox_width' => '',
    'lightbox_height' => '',
    'lightbox_width_unit' => 'px',
    'lightbox_height_unit' => 'px',
    'alt_image' => '',
    'caption_image' => '',
    'css_image' => '',
    'animation_effect' => ''
);

if (isset($args['mod_settings']['appearance_image'])) {
    $args['mod_settings']['appearance_image'] = self::get_checkbox_data($args['mod_settings']['appearance_image']);
	Themify_Builder_Model::load_appearance_css($args['mod_settings']['appearance_image']);
}
$fields_args = wp_parse_args($args['mod_settings'], $fields_default);
unset($args['mod_settings']);
$fields_default=null;
$mod_name=$args['mod_name'];
$builder_id = $args['builder_id'];
$element_id = $args['module_ID'];

$container_class=array(
    'module', 
    'module-' . $mod_name,
    $element_id,
    $fields_args['appearance_image'], 
    $fields_args['css_image']
); 
if($fields_args['style_image']!==''){
    Themify_Builder_Model::load_module_self_style($mod_name,str_replace('image-','',$fields_args['style_image']));
    $container_class[]= $fields_args['style_image'];
}
if (  'yes' === $fields_args['caption_on_overlay']){
    $container_class[]= 'active-caption-hover';
}
if ($fields_args['auto_fullwidth']=='1') {
    $container_class[]='auto_fullwidth';
}
$container_class[]='tf_mw';
$container_class = apply_filters('themify_builder_module_classes', $container_class, $mod_name, $element_id, $fields_args);

if(!empty($fields_args['global_styles']) && Themify_Builder::$frontedit_active===false){
    $container_class[] = $fields_args['global_styles'];
}
$newtab =false;
if($fields_args['link_image'] !== ''){
    if($fields_args['param_image'] === 'lightbox'){
	$unit_width = $fields_args['lightbox_width_unit']?$fields_args['lightbox_width_unit']:'px';
	$unit_height = $fields_args['lightbox_height_unit']?$fields_args['lightbox_height_unit']:'px';
	$lightbox_data = !empty($fields_args['lightbox_width']) || !empty($fields_args['lightbox_height']) ? sprintf(' data-zoom-config="%s|%s"'
		    , $fields_args['lightbox_width'] . $unit_width, $fields_args['lightbox_height'] . $unit_height) : false;
	$unit_height=$unit_width=null;
    }
    else{
	$newtab=$fields_args['param_image'] === 'newtab';
    }
}
$image_alt = '' !== $fields_args['alt_image'] ? $fields_args['alt_image'] : wp_strip_all_tags($fields_args['caption_image']);
$image_title = $fields_args['title_image'];
if ($image_alt === '') {
    $image_alt = $image_title;
}
if (Themify_Builder_Model::is_img_php_disabled()) {
    $preset = $fields_args['image_size_image'] !== '' ? $fields_args['image_size_image'] : themify_builder_get('setting-global_feature_size', 'image_global_size_field');
    $attachment_id = themify_get_attachment_id_from_url($fields_args['url_image']);
	if (!empty($attachment_id)) {
		$image = wp_get_attachment_image($attachment_id, $preset);
		if($fields_args['width_image']!==''){
			$image=preg_replace('/width=\"([0-9]{1,})\"/','width="'.$fields_args['width_image'].'"',$image);
		}
		if($fields_args['height_image']!==''){
			$image=preg_replace('/height=\"([0-9]{1,})\"/','height="'.$fields_args['height_image'].'"',$image);
		}
    }
	else{
		$image = '<img src="' . esc_url($fields_args['url_image']) . '" alt="' . esc_attr($image_alt) . (!empty($image_title) ? ( '" title="' . esc_attr($image_title) ) : '' ) . '" width="' . $fields_args['width_image'] . '" height="' . $fields_args['height_image'] . '">';
	}

} else {
    $image = themify_get_image(array('src'=>esc_url($fields_args['url_image']),'w'=>$fields_args['width_image'],'h'=>$fields_args['height_image'],'alt'=>$image_alt,'title'=>$image_title));
}

$container_props = apply_filters('themify_builder_module_container_props', self::parse_animation_effect($fields_args,array(
    'class' => implode(' ', $container_class),
	)), $fields_args, $mod_name, $element_id);
$args=$container_class=null;
if(Themify_Builder::$frontedit_active===false){
    $container_props['data-lazy']=1;
}
?>
<!-- module image -->
<div <?php echo self::get_element_attributes(self::sticky_element_props($container_props,$fields_args)); ?>>
    <?php $container_props=null; 
	do_action('themify_builder_background_styling',$builder_id,array('styling'=>$fields_args,'mod_name'=>$mod_name),$element_id,'module');
    ?>
    <?php if ($fields_args['mod_title_image'] !== ''): ?>
	<?php echo $fields_args['before_title'] . apply_filters('themify_builder_module_title', $fields_args['mod_title_image'], $fields_args). $fields_args['after_title']; ?>
    <?php endif; ?>
    <div class="image-wrap tf_rel tf_mw">
	<?php if ($fields_args['link_image'] !== ''): ?>
	    <a href="<?php echo esc_url($fields_args['link_image']); ?>"
	       <?php if ($newtab===true): ?> rel="noopener" target="_blank"<?php elseif (isset($lightbox_data)) : ?> class="lightbox-builder themify_lightbox"<?php echo $lightbox_data; ?><?php endif; ?>
	       >
		   <?php if ($fields_args['style_image']!=='image-full-overlay' && $fields_args['image_zoom_icon'] === 'zoom'): ?>
			<?php 
			    Themify_Builder_Model::load_module_self_style($mod_name,'zoom');
			    if(strpos($fields_args['link_image'],'youtube')!==false || strpos($fields_args['link_image'],'vimeo')!==false ||strpos($fields_args['link_image'],'youtu.be')!==false){
				$icon='control-play';
			    }
			    else{
				$ext= pathinfo($fields_args['link_image'],PATHINFO_EXTENSION);
				$icon=in_array($ext,array('jpg','jpeg','png','webp','gif','apng'),true)?'image':(in_array($ext,array('mp4','f4v','flv','mov','avi'),true)?'control-play':false);
				if($icon===false){
				    $icon=isset($lightbox_data) ? 'search' : 'new-window';
				}
			    }
			?>
			<span class="zoom">
			    <?php echo themify_get_icon($icon,'ti'); ?>
			</span>
		    <?php endif; ?>
		<?php echo $image; ?>
	    </a>
	<?php else: ?>
	    <?php echo $image; ?>
	<?php endif; ?>

	<?php if ('image-overlay' !== $fields_args['style_image']): ?>
	</div>
	<!-- /image-wrap -->
    <?php endif; ?>

    <?php if ($image_title !== '' || $fields_args['caption_image'] !== ''): ?>
	<div class="image-content<?php echo $fields_args['style_image']==='image-full-overlay'?' tf_overflow':'';?>">
	    <?php if ($image_title !== ''): ?>
		<h3 class="image-title"<?php if($fields_args['link_image'] === '' && Themify_Builder::$frontedit_active===true):?> contenteditable="false" data-name="title_image"<?php endif;?>>
		    <?php if ($fields_args['link_image'] !== ''): ?>
			<a<?php if(Themify_Builder::$frontedit_active===true):?> contenteditable="false" data-name="title_image"<?php endif; ?> href="<?php echo esc_url($fields_args['link_image']); ?>" 
			   <?php if (isset($lightbox_data)) : ?> class="lightbox-builder themify_lightbox"<?php echo $lightbox_data; ?><?php endif; ?>
			   <?php if ($newtab===true): ?> rel="noopener" target="_blank"<?php endif; ?>>
			       <?php echo $image_title; ?>
			</a>
		    <?php else: ?>
			<?php echo $image_title; ?>
		    <?php endif; ?>
		</h3>
	    <?php endif; ?>

	    <?php if ($fields_args['caption_image'] !== ''): ?>
		<div class="image-caption tb_text_wrap"<?php if(Themify_Builder::$frontedit_active===true):?> contenteditable="false" data-name="caption_image"<?php endif; ?>>
		    <?php echo apply_filters('themify_builder_module_content', $fields_args['caption_image']); ?>
	    </div>
	    <!-- /image-caption -->
	    <?php endif; ?>
	</div>
	<!-- /image-content -->
    <?php endif; ?>

<?php if ('image-overlay' === $fields_args['style_image']): ?>
    </div>
    <!-- /image-wrap -->
<?php endif; ?>
</div>
<!-- /module image -->