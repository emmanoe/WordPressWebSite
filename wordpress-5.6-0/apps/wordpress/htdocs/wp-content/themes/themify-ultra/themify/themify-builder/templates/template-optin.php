<?php
if ( ! defined( 'ABSPATH' ) )
	exit; // Exit if accessed directly
/**
 * Template Newsletter
 * 
 * Access original fields: $mod_settings
 * @author Themify
 */

$fields_default = array(
	'mod_title' => '',
	'provider' => 'mailchimp',
	'layout' => 'inline_block',
	'label_firstname' => '',
	'fn_placeholder' => '',
	'fname_hide' => 0,
	'default_fname' => __( 'John', 'themify' ),
	'lname_hide' => 0,
	'label_lastname' => '',
	'ln_placeholder' => '',
	'default_lname' => __( 'Doe', 'themify' ),
	'label_email' => '',
	'email_placeholder' => '',
	'label_submit' => '',
	'button_icon' => '',
	'success_action' => 's2',
	'redirect_to' => '',
	'message' => '',
	'gdpr' => '',
	'gdpr_label' => '',
	'css' => '',
	'animation_effect' => '',
);
$fields_args = wp_parse_args( $args['mod_settings'], $fields_default );
unset( $args['mod_settings'] );
$fields_default=null;
$mod_name=$args['mod_name'];
$builder_id = $args['builder_id'];
$element_id = $args['module_ID'];

$instance = Builder_Optin_Services_Container::get_instance()->get_provider( $fields_args['provider'] );
$container_class = apply_filters( 'themify_builder_module_classes', array(
	'module', 
	'module-' . $mod_name,
	$element_id, 
	$fields_args['css'],
	$fields_args['layout']
	), $mod_name, $element_id, $fields_args
);
if(!empty($fields_args['global_styles']) && Themify_Builder::$frontedit_active===false){
    $container_class[] = $fields_args['global_styles'];
}
$container_props = apply_filters( 'themify_builder_module_container_props', self::parse_animation_effect($fields_args,array(
	'id' => $element_id,
	'class' => implode(' ', $container_class ),
)), $fields_args, $mod_name, $element_id );
$args=null;
$icon =$fields_args['button_icon']? sprintf( '<i>%s</i>', themify_get_icon($fields_args['button_icon'] )):'';
if(Themify_Builder::$frontedit_active===false){
    $container_props['data-lazy']=1;
}
?>
<!-- module optin -->
<div <?php echo self::get_element_attributes(self::sticky_element_props($container_props,$fields_args)); ?>>
	<?php $container_props=$container_class=null; 
	    do_action('themify_builder_background_styling',$builder_id,array('styling'=>$fields_args,'mod_name'=>$mod_name),$element_id,'module');
	?>
	<?php if ($instance ):?>
	    <?php if ( $fields_args['mod_title'] !== '' ) : ?>
		    <?php echo $fields_args['before_title'] . apply_filters( 'themify_builder_module_title', $fields_args['mod_title'], $fields_args ) . $fields_args['after_title']; ?>
	    <?php endif; ?>
	    <?php
	    if ( is_wp_error( ( $error = $instance->check_user_data( $fields_args ) ) ) ) :
		    if ( current_user_can( 'manage_options' ) ) {
			    echo $error->get_error_message();
		    }
	    ?>
	    <?php else: ?>
	    <form class="tb_optin_form" name="tb_optin" method="post"
		    action="<?php echo esc_attr( admin_url( 'admin-ajax.php' ) ); ?>"
		    data-success="<?php echo esc_attr( $fields_args['success_action'] ); ?>"
	    >
		    <input type="hidden" name="action" value="tb_optin_subscribe" />
		    <input type="hidden" name="tb_optin_redirect" value="<?php echo esc_attr( $fields_args['redirect_to'] ); ?>" />
		    <input type="hidden" name="tb_optin_provider" value="<?php echo esc_attr( $fields_args['provider'] ); ?>" />

		    <?php
		    foreach ( $instance->get_options() as $provider_field ) :
			    if ( isset( $provider_field['id'] ) && isset( $fields_args[ $provider_field['id'] ] ) ) : ?>
				    <input type="hidden" name="tb_optin_<?php echo $provider_field['id']; ?>" value="<?php echo esc_attr( $fields_args[ $provider_field['id'] ] ); ?>" />
			    <?php endif;
		    endforeach;
		    ?>

		    <?php if ( $fields_args['fname_hide'] ) : ?>
			    <input type="hidden" name="tb_optin_fname" value="<?php echo esc_attr( $fields_args['default_fname'] ); ?>" />
		    <?php else : ?>
			    <div class="tb_optin_fname">
				    <label class="tb_optin_fname_text"><?php echo esc_html( $fields_args['label_firstname'] ) ?></label>
				    <input type="text" name="tb_optin_fname" required="required" class="tb_optin_input"<?php echo !empty($fields_args['fn_placeholder'])?' placeholder="'.$fields_args['fn_placeholder'].'"':''; ?> />
			    </div>
		    <?php endif; ?>

		    <?php if ( $fields_args['lname_hide'] ) : ?>
			    <input type="hidden" name="tb_optin_lname" value="<?php echo esc_attr( $fields_args['default_lname'] ); ?>" />
		    <?php else : ?>
			    <div class="tb_optin_lname">
				    <label class="tb_optin_lname_text"><?php echo esc_html( $fields_args['label_lastname'] ) ?></label>
				    <input type="text" name="tb_optin_lname" required="required" class="tb_optin_input"<?php echo !empty($fields_args['ln_placeholder'])?' placeholder="'.$fields_args['ln_placeholder'].'"':''; ?>/>
			    </div>
		    <?php endif; ?>

		    <div class="tb_optin_email">
			    <label class="tb_optin_email_text"><?php echo esc_html( $fields_args['label_email'] ) ?></label>
			    <input type="email" name="tb_optin_email" required="required" class="tb_optin_input"<?php echo !empty($fields_args['email_placeholder'])?' placeholder="'.$fields_args['email_placeholder'].'"':''; ?> />
		    </div>

			<?php if ( $fields_args['gdpr'] === 'on' ) : ?>
				<div class="tb_optin_gdpr">
					<label class="tb_optin_gdpr_text">
						<input type="checkbox" name="tb_optin_gdpr" required="required" />
						<?php echo $fields_args['gdpr_label']; ?>
					</label>
				</div>
			<?php endif; ?>

		    <div class="tb_optin_submit">
			    <button>
					<?php if( $icon!==''):?>
						<?php echo $icon?>
					<?php endif;?>
                    <?php echo esc_html( $fields_args['label_submit'] ) ?>
                </button>
		    </div>
	    </form>
	    <div class="tb_optin_success_message tb_text_wrap" style="display: none;">
		    <?php echo $fields_args['message']!==''?apply_filters( 'themify_builder_module_content', $fields_args['message'] ):''; ?>
	    </div>
	<?php endif; ?>
    <?php endif; ?>
</div><!-- /module optin -->

