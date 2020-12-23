<template id="tmpl-small_toolbar">
    <div class="tb_disable_sorting" id="tb_small_toolbar">
        <ul class="tb_toolbar_menu">
            <li class="tb_toolbar_undo"><a href="#" class="tb_tooltip tb_undo_redo tb_undo_btn tb_disabled"><?php echo themify_get_icon('back-left','ti')?><span><?php _e('Undo (CTRL+Z)', 'themify'); ?></span></a></li>
            <li class="tb_toolbar_redo"><a href="#" class="tb_tooltip tb_undo_redo tb_redo_btn tb_disabled"><?php echo themify_get_icon('back-right','ti')?><span><?php _e('Redo (CTRL+SHIFT+Z)', 'themify'); ?></span></a></li>
            <li class="tb_toolbar_divider"></li>
            <li class="tb_toolbar_import"><a href="javascript:void(0);" tabindex="-1" class="tb_tooltip"><?php echo themify_get_icon('import','ti')?><span><?php _e('Import', 'themify'); ?></span></a>
                <ul>
                    <li><a href="#" data-component="file"><?php _e('Import From File', 'themify'); ?></a></li>
                    <li><a href="#" data-component="page"><?php _e('Import From Page', 'themify'); ?></a></li>
                    <li><a href="#" data-component="post"><?php _e('Import From Post', 'themify'); ?></a></li>
                </ul>
            </li>
            <li class="tb_toolbar_export"><a href="<?php echo wp_nonce_url('?themify_builder_export_file=true', 'themify_builder_export_nonce') ?>&postid=#postID#" class="tb_tooltip tb_export_link"><?php echo themify_get_icon('export','ti')?><span><?php _e('Export', 'themify'); ?></span></a></li>
            <li class="tb_toolbar_divider"></li>
            <li><a href="javascript:void(0);" tabindex="-1" class="tb_tooltip"><?php echo themify_get_icon('layout','ti')?><span><?php _e('Layout', 'themify'); ?></span></a>
                <ul>
                    <li><a href="#" class="tb_load_layout"><?php _e('Load Layout', 'themify'); ?></a></li>
                    <li><a href="#" class="tb_save_layout"><?php _e('Save as Layout', 'themify'); ?></a></li>
                </ul>
            </li>
        </ul>
        <div class="tb_toolbar_save_wrap">
            <div class="tb_toolbar_close">
                <a href="#" class="tb_tooltip tb_toolbar_close_btn tf_close" title="<?php _e('ESC', 'themify') ?>"><span><?php _e('Close', 'themify'); ?></span></a>
            </div>
            <div class="tb_toolbar_save_btn">
                <a href="#" class="tb_toolbar_save" title="<?php _e('Ctrl + S', 'themify') ?>"><?php _e('Save', 'themify'); ?></a>
            </div>
        </div>
    </div>
</template>
<template id="tmpl-builder_inline_editor">
<div id="tb_editor">
    <div class="tb_editor_options" id="tb_editor_link_wrapper">
        <button class="tf_close themify-tooltip-top"><span class="themify_tooltip"><?php _e('Go Back', 'themify') ?></span></button>
        <input class="tb_link_input" placeholder="<?php _e('URL','themify')?>" type="text" required="1" />
        <button class="ti-check themify-tooltip-top"><span class="themify_tooltip"><?php _e('Insert Link', 'themify') ?></span></button>
        <button class="ti-angle-double-up themify-tooltip-top"><span class="themify_tooltip"><?php _e('Link Options', 'themify') ?></span></button>
        <div class="tb_editor_link_options">
            <label for="tb_editor_link_type"><?php _e('Open Link In','themify')?></label>
            <div class="tb_selectwrapper">
                <select id="tb_editor_link_type">
                    <option value=""><?php _e('Same Window','themify')?></option>
                    <option value="blank"><?php _e('New Window','themify')?></option>
                    <option value="lightbox"><?php _e('Lightbox','themify')?></option>
                </select>
            </div>
            <div class="tb_editor_lightbox_actions">
                <div class="tb_editor_lightbox_width">
                    <label for="tb_editor_lightbox_w"><?php _e('Lightbox Width','themify')?></label>
                    <input type="text" class="small" id="tb_editor_lightbox_w"/>
                    <div class="tb_selectwrapper noborder">
                        <select id="tb_editor_lightbox_w_unit">
                            <option value="">px</option>
                            <option value="%">%</option>
                        </select>
                    </div>
                </div>
                <div class="tb_editor_lightbox_height">
                    <label for="tb_editor_lightbox_h"><?php _e('Lightbox Height','themify')?></label>
                    <input type="text" class="small" id="tb_editor_lightbox_h"/>
                    <div class="tb_selectwrapper noborder">
                        <select id="tb_editor_lightbox_h_unit">
                            <option value="">px</option>
                            <option value="%">%</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div id="tb_editor_color_wrapper" class="tb_editor_options">
        <?php /*
        echo themify_builder_styling_field(array(
            'type'=>'color',
            'id'=>'tb_editor_color'
        ))*/?>
        <button class="tf_close themify-tooltip-top"><span class="themify_tooltip"><?php _e('Close', 'themify') ?></span></button>
    </div>
    <div id="tb_editor_fonts_wrapper" class="tb_editor_options">
        <button class="tf_close themify-tooltip-top"><span class="themify_tooltip"><?php _e('Close', 'themify') ?></span></button> 
        <div class="tb_editor_font_select_wrapper">
            <label for="tb_editor_font_select"><?php _e('Font Family','themify')?></label>
            <div class="tb_selectwrapper">
                <select  id="tb_editor_font_select">
                    <option></option>
                    <optgroup data-type="safe" label="<?php _e('Web Safe Fonts', 'themify') ?>"></optgroup>
                    <optgroup data-type="google" label="<?php _e( 'Google Fonts', 'themify' ) ?>"></optgroup>
                </select>
            </div>
        </div>
        <div>
            <?php /*
            $font = Themify_Builder_Component_Base::get_font_size('','tb_editor_font_size');
            ?>
            <label for="<?php echo $font['id']?>"><?php echo $font['label']?></label>
            <?php 
            $font['units']['PX']['min'] = 1;
            echo themify_builder_module_create_range_field($font,true);
	     * 
	     */
            ?>
        </div>
        <div>
            <?php /*$font = Themify_Builder_Component_Base::get_letter_spacing('','tb_editor_letter_spacing')*/?>
            <label for="<?php /* echo $font['id']*/?>"><?php /*echo $font['label']*/?></label>
            <?php /*
            echo themify_builder_module_create_range_field($font,true);*/
            ?>
        </div>
        <div>
            <?php /*$font = Themify_Builder_Component_Base::get_letter_spacing('','tb_editor_line_height')*/?>
            <label for="<?php /* echo $font['id']*/?>"><?php _e('Line Height','themify')?></label>
            <?php /*
            echo themify_builder_module_create_range_field($font,true);
            unset($font);*/
            ?>
        </div>
    </div>
    <div id="tb_editor_link_edit" class="tb_editor_options">
        <div class="tb_editor_link_value">
            <button  title="<?php _e('Edit','themify')?>"></button>
        </div>
        <div class="tb_editor_link_actions">
            <a href="#" target="_blank" class="ti-new-window themify-tooltip-top"><span class="themify_tooltip"><?php _e('Click to open in a new tab', 'themify') ?></span></a>
            <button class="ti-unlink themify-tooltip-top"><span class="themify_tooltip"><?php _e('Unlink', 'themify') ?></span></button>
        </div>
    </div>
    <ul id="tb_editor_menu">
        <li class="themify-tooltip-top tb_editor_paragraph tb_editor_action" data-action="top" data-default="ti-paragraph">
            <span class="themify_tooltip"><?php _e('Paragraph', 'themify') ?></span>
            <ul data-type="paragraph">
                <li><button class="tb_editor_action" data-action="p"></button>P</li>
                <li><button class="tb_editor_action" data-action="h1"></button>H1</li>
                <li><button class="tb_editor_action" data-action="h2"></button>H2</li>
                <li><button class="tb_editor_action" data-action="h3"></button>H3</li>
                <li><button class="tb_editor_action" data-action="h4"></button>H4</li>
                <li><button class="tb_editor_action" data-action="h5"></button>H5</li>
                <li><button class="tb_editor_action" data-action="h6"></button>H6</li>
            </ul>
        </li>
        <li class="themify-tooltip-top ti-align-left tb_editor_text_align tb_editor_action" data-action="top" data-default="ti-align-left">
            <span class="themify_tooltip"><?php _e('Text Align', 'themify') ?></span>
            <ul data-type="text_align">
                <li class="themify-tooltip-top ti-align-left"><button class="tb_editor_action" data-action="justifyLeft"></button><span class="themify_tooltip"><?php _e('Left', 'themify') ?></span></li>
                <li class="themify-tooltip-top ti-align-center"><button class="tb_editor_action" data-action="justifyCenter"></button><span class="themify_tooltip"><?php _e('Center', 'themify') ?></span></li>
                <li class="themify-tooltip-top ti-align-right"><button class="tb_editor_action" data-action="justifyRight"></button><span class="themify_tooltip"><?php _e('Right', 'themify') ?></span></li>
                <li class="themify-tooltip-top ti-align-justify"><button class="tb_editor_action" data-action="justifyFull"></button><span class="themify_tooltip"><?php _e('Justify', 'themify') ?></span></li>
            </ul>
        </li>
        <li class="themify-tooltip-top ti-link tb_editor_link">
            <span class="themify_tooltip"><?php _e('Link', 'themify') ?></span>
            <button class="tb_editor_action" data-type="link"></button>
        </li>
        <li class="themify-tooltip-top tb_editor_bold">
            <button class="tb_editor_action" data-type="bold"></button>
            <span class="themify_tooltip"><?php _e('Bold', 'themify') ?></span>
        </li>
        <li class="themify-tooltip-top ti-Italic tb_editor_italic">
            <button class="tb_editor_action" data-type="italic"></button>
            <span class="themify_tooltip"><?php _e('Italic', 'themify') ?></span>
        </li>
        <li class="themify-tooltip-top ti-underline tb_editor_text_decoration">
            <button class="tb_editor_action" data-type="underline"></button>
            <span class="themify_tooltip"><?php _e('Text Decoration', 'themify') ?></span>
        </li>
        <li class="themify-tooltip-top ti-list tb_editor_list tb_editor_action" data-action="top" data-default="ti-list">
            <span class="themify_tooltip"><?php _e('List Settings', 'themify') ?></span>
            <ul data-type="list">
                <li class="themify-tooltip-top ti-list"><button class="tb_editor_action" data-action="insertUnorderedList"></button><span class="themify_tooltip"><?php _e('Underscore List', 'themify') ?></span></li>
                <li class="themify-tooltip-top ti-list-ol"><button class="tb_editor_action" data-action="insertOrderedList"></button><span class="themify_tooltip"><?php _e('Ordered List', 'themify') ?></span></li>
                <li class="themify-tooltip-top ti-control-skip-forward"><button class="tb_editor_action" data-action="Indent"></button><span class="themify_tooltip"><?php _e('Increase Indent', 'themify') ?></span></li>
                <li class="themify-tooltip-top ti-control-skip-backward"><button class="tb_editor_action" data-action="Outdent"></button><span class="themify_tooltip"><?php _e('Decrease Indent', 'themify') ?></span></li>
            </ul>
        </li>
        <li class="themify-tooltip-top ti-paint-bucket tb_editor_color">
            <button class="tb_editor_action" data-type="color"></button>
            <span class="themify_tooltip"><?php _e('Text Color', 'themify') ?></span>
        </li>
        <li class="themify-tooltip-top ti-text icon tb_editor_fonts">
            <button class="tb_editor_action" data-type="fonts"></button>
            <span class="themify_tooltip"><?php _e('Fonts', 'themify') ?></span>
        </li>
        <li class="themify-tooltip-top ti-new-window tb_editor_expand">
            <button class="tb_editor_action" data-type="expand"></button>
            <span class="themify_tooltip"><?php _e('Expand', 'themify') ?></span>
        </li>
    </ul>
</div>
</template>
