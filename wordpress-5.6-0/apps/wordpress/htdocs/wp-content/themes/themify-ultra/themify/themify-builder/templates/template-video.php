<?php
if (!defined('ABSPATH'))
    exit; // Exit if accessed directly
/**
 * Template Video
 * 
 * Access original fields: $args['mod_settings']
 * @author Themify
 */

$fields_default = array(
    'mod_title_video' => '',
    'style_video' => '',
    'url_video' => '',
    'autoplay_video' => 'no',
    'mute_video' => 'no',
    'width_video' => '',
    'unit_video' => 'px',
    'title_video' => '',
    'title_link_video' => false,
    'caption_video' => '',
    'css_video' => '',
    'animation_effect' => '',
    'o_i_c'=>'',
    'o_i'=>'',
    'o_w'=>'',
    'o_h' => '',
);

$fields_args = wp_parse_args($args['mod_settings'], $fields_default);
unset($args['mod_settings']);
$fields_default=null;
$mod_name=$args['mod_name'];
$builder_id = $args['builder_id'];
$element_id = $args['module_ID'];

if($fields_args['o_i_c']!==''){
    $fields_args['o_i_c'] = self::get_checkbox_data($fields_args['o_i_c']);
}
$video_maxwidth = $fields_args['width_video'] !== '' ? $fields_args['width_video'] . $fields_args['unit_video'] : '';
$video_autoplay_css = $fields_args['autoplay_video'] === 'yes' ? 'video-autoplay' : '';
if($fields_args['style_video']==='video-overlay'){
    Themify_Builder_Model::load_module_self_style($mod_name,'overlay');
}
$container_class = apply_filters('themify_builder_module_classes', array(
    'module',
    'module-' . $mod_name,
    $element_id, 
    $fields_args['style_video'], 
    $fields_args['css_video'], 
    $video_autoplay_css
), $mod_name, $element_id, $fields_args);

if(!empty($fields_args['global_styles']) && Themify_Builder::$frontedit_active===false){
    $container_class[] = $fields_args['global_styles'];
}
$container_props = apply_filters('themify_builder_module_container_props', self::parse_animation_effect($fields_args,array(
    'class' => implode(' ', $container_class),
	)), $fields_args, $mod_name, $element_id);
$args=null;
if(Themify_Builder::$frontedit_active===false){
    $container_props['data-lazy']=1;
}

$url = esc_url( $fields_args['url_video'] );
if ( ! empty( $url ) ) {
	$video_url = parse_url($fields_args['url_video']);
	$isLocal = $video_url['host'] !== 'www.youtube.com'
		&& $video_url['host'] !== 'youtube.com'
		&& $video_url['host'] !== 'youtu.be'
		&& $video_url['host'] !== 'www.vimeo.com'
		&& $video_url['host'] !== 'vimeo.com'
		&& $video_url['host'] !== 'player.vimeo.com';
	if($isLocal===false && $fields_args['autoplay_video'] === 'yes'){
		$container_props['data-auto']=true;
		$fields_args['mute_video']='yes';
	}
	if($fields_args['mute_video'] === 'yes'){
		$container_props['data-muted']=true;
	}
	if ( $isLocal === false || ! ( $fields_args['o_i_c'] !== '1' || $fields_args['o_i'] === '' ) ) {
		$container_props['data-url']=$url;
	}
}
?>
<!-- module video -->
<div <?php echo self::get_element_attributes(self::sticky_element_props($container_props,$fields_args)); ?>>
    <?php
	$container_props=$container_class=null;
	if ( !empty( $url ) ):?>
		<?php do_action('themify_builder_background_styling',$builder_id,array('styling'=>$fields_args,'mod_name'=>$mod_name),$element_id,'module');?>
		<?php if ($fields_args['mod_title_video'] !== ''): ?>
			<?php echo $fields_args['before_title'] , apply_filters('themify_builder_module_title', $fields_args['mod_title_video'], $fields_args),$fields_args['after_title']; ?>
		<?php endif; ?>
		<div class="video-wrap tf_rel tf_overflow"<?php echo '' !== $video_maxwidth ? ' style="max-width:' . $video_maxwidth . ';"' : ''; ?>>
			<?php
			if($fields_args['o_i_c']!=='1' || $fields_args['o_i']===''){
				if($isLocal===true){
					$video=wp_video_shortcode(array('src'=>$url,'preload'=>'none','autoplay'=>$fields_args['autoplay_video'] === 'yes','class'=>'tf_abs tf_w tf_h'));
					$r=' playsinline webkit-playsinline';
					if ($fields_args['mute_video'] === 'yes') {
						$r.=' muted';
					}
					echo str_replace(' preload=', $r.' preload=', $video);
					$r=null;
				}
			}
			else{
				?>
				<div class="tb_video_overlay tf_rel">
				<div class="tb_video_play"></div>
				<?php echo themify_get_image(array('src'=>$fields_args['o_i'],'w' => $fields_args['o_w'],'alt'=>$fields_args['title_video'], 'h' => $fields_args['o_h']))?>
				</div>
				<?php
			}
			?>
		</div>
		<!-- /video-wrap -->
		<?php if ('' !== $fields_args['title_video'] || '' !== $fields_args['caption_video']): ?>
			<div class="video-content">
				<?php if ('' !== $fields_args['title_video']): ?>
				<h3 class="video-title"<?php if(Themify_Builder::$frontedit_active===true && !$fields_args['title_link_video']):?> contenteditable="false" data-name="title_video"<?php endif;?>>
					<?php if ($fields_args['title_link_video']) : ?>
					<a<?php if(Themify_Builder::$frontedit_active===true):?> contenteditable="false" data-name="title_video"<?php endif;?> href="<?php echo esc_url($fields_args['title_link_video']); ?>"><?php echo $fields_args['title_video']; ?></a>
					<?php else: ?>
					<?php echo $fields_args['title_video']; ?>
					<?php endif; ?>
				</h3>
				<?php endif; ?>

				<?php if ('' !== $fields_args['caption_video']): ?>
				<div class="video-caption tb_text_wrap"<?php if(Themify_Builder::$frontedit_active===true):?> contenteditable="false" data-name="caption_video"<?php endif;?>>
					<?php echo apply_filters('themify_builder_module_content', $fields_args['caption_video']); ?>
				</div>
				<!-- /video-caption -->
				<?php endif; ?>
			</div>
			<!-- /video-content -->
		<?php endif; ?>
	<?php endif;?>
</div>
