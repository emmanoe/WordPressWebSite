<?php

class Themify_Builder_Component_Subrow extends Themify_Builder_Component_Base {

    public function get_name() {
	return 'subrow';
    }

    public function get_form_settings($onlyStyle=false) {
	$styles = $this->get_styling();
	if($onlyStyle===true){
	    return $styles;
	}
	$row_form_settings = array(
	    'styling' => array(
		'name' => __('Sub Row Styling', 'themify'),
		'options' => $styles
	    ),
	    'visibility' => true,
	    'animation' => true
	);
	return apply_filters('themify_builder_subrow_lightbox_form_settings', $row_form_settings);
    }

    /**
     * Get template Sub-Row.
     * 
     * @param int $rows 
     * @param int $cols 
     * @param int $index 
     * @param array $mod 
     * @param string $builder_id 
     * @param boolean $echo 
     */
    public static function template($rows, $cols, $index, $mod, $builder_id, $echo = false) {
	$print_sub_row_classes = array('themify_builder_sub_row module_subrow');
	$subrow_tag_attrs =  array();
	$count = 0;
	$video_data = '';
	$is_styling = !empty($mod['styling']);
	if ($is_styling===true) {
	    if (isset($mod['styling']['background_type']) && $mod['styling']['background_type'] === 'image' && isset($mod['styling']['background_zoom']) && $mod['styling']['background_zoom'] === 'zoom' && $mod['styling']['background_repeat'] === 'repeat-none') {
		$print_sub_row_classes[] = 'themify-bg-zoom';
	    }
	    $class_fields = array('custom_css_subrow', 'background_repeat');
	    foreach ($class_fields as $field) {
		if (!empty($mod['styling'][$field])) {
		    $print_sub_row_classes[] = $mod['styling'][$field];
		}
	    }
	    $class_fields=null;
	    // background video
	    $video_data = ' '.self::get_video_background($mod['styling']);
	    if(!empty( $mod['styling']['global_styles'] )){
		$print_sub_row_classes= Themify_Global_Styles::add_class_to_components($print_sub_row_classes , $mod['styling'] , $builder_id);
	    }
	}
	else{
	    $mod['styling']=array();
	}
	if (Themify_Builder::$frontedit_active===false) {
	    $count = !empty($mod['cols']) ? count($mod['cols']) : 0;
	    $row_content_classes = array();
	    if (!empty($mod['gutter']) && $mod['gutter'] !== 'gutter-default') {
		$row_content_classes[] = $mod['gutter'];
	    }
	    if (!empty($mod['column_h'])) {
		$row_content_classes[] = 'col_auto_height';
	    }
	    $row_content_classes[] = !empty($mod['column_alignment']) ? $mod['column_alignment'] : (function_exists('themify_theme_is_fullpage_scroll') && themify_theme_is_fullpage_scroll() ? 'col_align_middle' : 'col_align_top');

	    if ($count > 0) {
		$row_content_attr = self::get_directions_data($mod, $count);
		$order_classes = self::get_order($count);
		$is_phone = themify_is_touch('phone');
		$is_tablet = $is_phone===false && themify_is_touch('tablet');
		$is_right = false;
		if ($is_tablet===true) {
		    $is_right = isset($row_content_attr['data-tablet_dir']) || isset($row_content_attr['data-tablet_landscape_dir']);
		    if (isset($row_content_attr['data-col_tablet']) || isset($row_content_attr['data-col_tablet_landscape'])) {
			$row_content_classes[] = isset($row_content_attr['data-col_tablet_landscape']) ? $row_content_attr['data-col_tablet_landscape'] : $row_content_attr['data-col_tablet'];
		    }
		} elseif ($is_phone===true) {
		    $is_right = isset($row_content_attr['data-mobile_dir']);
		    if (isset($row_content_attr['data-col_mobile'])) {
			$row_content_classes[] = $row_content_attr['data-col_mobile'];
		    }
		} else {
		    $is_right = isset($row_content_attr['data-desktop_dir']);
		}
		if ($is_right===true) {
		    $row_content_classes[] = 'direction-rtl';
		    $order_classes = array_reverse($order_classes);
		}
	    }

	    $row_content_classes = implode(' ', $row_content_classes);
	    if (isset($mod['element_id'])) {
		$print_sub_row_classes[] = 'tb_' . $mod['element_id'];
	    }
	    if($is_styling===true ){
		$subrow_tag_attrs = self::sticky_element_props($subrow_tag_attrs,$mod['styling']);
	    }
	    $subrow_tag_attrs['data-lazy']=1;
	}
	$print_sub_row_classes = apply_filters('themify_builder_subrow_classes', $print_sub_row_classes, $mod, $builder_id);
	$print_sub_row_classes[]='tf_w clearfix';
	$subrow_tag_attrs['class'] = implode(' ', $print_sub_row_classes);
	$print_sub_row_classes=null;
	$subrow_tag_attrs = apply_filters('themify_builder_subrow_attributes',self::parse_animation_effect($mod['styling'],$subrow_tag_attrs) ,$mod['styling'], $builder_id);
	

	if (!$echo) {
	    $output = PHP_EOL; // add line break
	    ob_start();
	}
	// Start Sub-Row Render ######
	?>
	<div <?php echo self::get_element_attributes($subrow_tag_attrs),$video_data ?>>
	    <?php
	    $subrow_tag_attrs=$video_data=null;
	    if ($is_styling===true) {
		$mod['row_order'] = $index;
		do_action('themify_builder_background_styling', $builder_id, $mod, $rows . '-' . $cols . '-' . $index, 'subrow');
		self::background_styling($mod, 'subrow',$builder_id);
	    }
	    ?>
	    <div class="subrow_inner<?php if (Themify_Builder::$frontedit_active===false): ?> <?php echo $row_content_classes ?><?php $row_content_classes=null;endif; ?> tf_box tf_w" <?php if (!empty($row_content_attr)): ?> <?php echo self::get_element_attributes($row_content_attr) ?><?php $row_content_attr=null;endif; ?>>
		<?php
		if ($count > 0) {
		    foreach ($mod['cols'] as $col_key => $sub_col) {
			Themify_Builder_Component_Column::template_sub_column($rows, $cols, $index, $col_key, $sub_col, $builder_id, $order_classes, true);
		    }
		}
		?>
	    </div>
	</div><!-- /themify_builder_sub_row -->
	<?php
	// End Sub-Row Render ######

	if (!$echo) {
	    $output .= ob_get_clean();
	    // add line break
	    $output .= PHP_EOL;
	    return $output;
	}
    }

}
