<?php

class Builder_Optin_Service {

	function get_id() {}

	/**
	 * Checks whether this service is available.
	 *
	 * @return bool
	 */
	function is_available() {
		return true;
	}

	/**
	 * Provider Name
	 *
	 * @return string
	 */
	function get_label() {}

	/**
	 * Module options, displayed in the Optin module form
	 *
	 * @return array
	 */
	function get_options() {}

	/**
	 * Provider options that are not unique to each module
	 * These are displayed in the Builder settings page
	 *
	 * @return array
	 */
	function get_global_options() {
		return array();
	}

	/**
	 * Returns the value of a setting
	 */
	function get( $id, $default = null ) {
		if ( $value = themify_builder_get( "setting-{$id}", "setting-{$id}" ) ) {
			return $value;
		} else {
			return $default;
		}
	}

	/**
	 * Retrieves the $fields_args from module and determines if there is valid form to show.
	 *
	 * @param $fields_args array module options
	 * @return bool|WP_Error true if there's a form to show, WP_Error otherwise
	 */
	function check_user_data( $fields_args ) {
		return new WP_Error( 'missing_check_user_data_method', __( 'Error', 'themify' ) );
	}

	/**
	 * Action to perform when Clear Cache is requested
	 *
	 * @return null
	 */
	function clear_cache() {}

	/**
	 * Subscribe visitor to the mailing list
	 *
	 * @param $args array( 'fname', 'lname', 'email' )
	 *        it also includes options from get_options() method with their values.
	 *
	 * @return WP_Error|true
	 */
	function subscribe( $args ) {}
}

class Builder_Optin_Services_Container {

	/* array list of provider instances */
	public $providers;

	/**
	 * Creates or returns an instance of this class.
	 *
	 * @return	A single instance of this class.
	 */
	public static function get_instance() {
		static $instance = null;
		if ( $instance === null ) {
			$instance = new self;
		}
		return $instance;
	}

	private function __construct() {
		if ( did_action( 'init' ) ) {
			$this->init_providers();
		} else {
			add_action( 'init', array( $this, 'init_providers' ), 100 );
		}
		if ( is_admin() ) {
			add_action( 'wp_ajax_tb_optin_subscribe', array( $this, 'ajax_subscribe' ) );
			add_action( 'wp_ajax_nopriv_tb_optin_subscribe', array( $this, 'ajax_subscribe' ) );
		}
	}

	/**
	 * Initialize data providers for the module
	 *
	 * Other plugins or themes can extend or add to this list
	 * by using the "builder_optin_services" filter.
	 */
	function init_providers() {
		$dir = trailingslashit( dirname( __FILE__ ) );
		include( $dir . '/mailchimp.php' );
		include( $dir . '/activecampaign.php' );
		include( $dir . '/convertkit.php' );
		include( $dir . '/getresponse.php' );
		include( $dir . '/mailerlite.php' );
		include( $dir . '/newsletter.php' );
		$providers = apply_filters( 'builder_optin_services', array(
			'mailchimp' => 'Builder_Optin_Service_MailChimp',
			'activecampaign' => 'Builder_Optin_Service_ActiveCampaign',
			'convertkit' => 'Builder_Optin_Service_ConvertKit',
			'getresponse' => 'Builder_Optin_Service_GetResponse',
			'mailerlite' => 'Builder_Optin_Service_MailerLite',
			'newsletter' => 'Builder_Optin_Service_Newsletter',
		) );

		foreach ( $providers as $id => $provider ) {
			if ( class_exists( $provider ) ) {
				$this->providers[ $id ] = new $provider();
			}
		}
	}

	/**
	 * Helper function to retrieve list of providers
	 *
	 * @return object
	 */
	public function get_providers() {
		return $this->providers;
	}

	/**
	 * Helper function to retrieve a provider instance
	 *
	 * @return object
	 */
	public function get_provider( $id ) {
		return isset( $this->providers[ $id ] ) ? $this->providers[ $id ] : false;
	}

	/**
	 * Handles the Ajax request for subscription form
	 *
	 * Hooked to wp_ajax_tb_optin_subscribe
	 */
	public function ajax_subscribe() {
		if ( ! isset( $_POST['tb_optin_provider'], $_POST['tb_optin_fname'], $_POST['tb_optin_lname'], $_POST['tb_optin_email'] ) ) {
			wp_send_json_error( array( 'error' => __( 'Required fields are empty.', 'themify' ) ) );
		}

		$data = array();
		foreach ( $_POST as $key => $value ) {
			// remove "tb_optin_" prefix from the $_POST data
			$key = preg_replace( '/^tb_optin_/', '', $key );
			$data[ $key ] = sanitize_text_field( trim( $value ) );
		}

		if ( $provider = $this->get_provider( $data['provider'] ) ) {
			$result = $provider->subscribe( $data );
			if ( is_wp_error( $result ) ) {
				wp_send_json_error( array( 'error' => $result->get_error_message() ) );
			} else {
				wp_send_json_success( array(
					/* send name and email in GET, these may come useful when building the page that the visitor will be redirected to */
					'redirect' => add_query_arg( array(
						'fname' => $data['fname'],
						'lname' => $data['lname'],
						'email' => $data['email'],
					), $data['redirect'] )
				) );
			}
		} else {
			wp_send_json_error( array( 'error' => __( 'Unknown provider.', 'themify' ) ) );
		}
	}
}
Builder_Optin_Services_Container::get_instance();