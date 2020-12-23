<?php
/**
 * Builder Data Manager API
 *
 * ThemifyBuilder_Data_Manager class provide API
 * to get Builder Data, Save Builder Data to Database.
 * 
 *
 * @package    Themify_Builder
 * @subpackage Themify_Builder/classes
 */
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * The Builder Data Manager class.
 *
 * This class provide API to get and update builder data.
 *
 *
 * @package    Themify_Builder
 * @subpackage Themify_Builder/classes
 * @author     Themify
 */
class ThemifyBuilder_Data_Manager {

	/**
	 * Builder Meta Key
	 * 
	 * @access public
	 * @var string $meta_key
	 */
	 
	private $old_meta_key = '_themify_builder_settings';
	
	public $meta_key = '_themify_builder_settings_json';

	private static $static_content_process;

	private static $regex_static_content = '/(?:<p>)?(?:<|&lt;)!--themify_builder_static--(?:>|&gt;)(?:.*?)?(?:<|&lt;)!--\/themify_builder_static--(?:>|&gt;)(?:<\/p>)?/s';

	private static $regex_builder_block = '/<!-- wp:themify-builder\/canvas \/-->/';


	/**
	 * Constructor
	 * 
	 * @access public
	 */
	public function __construct() {
		add_action( 'import_post_meta', array( $this, 'import_post_meta' ), 10, 3 );
        
        /* disable this due to issue #7087 */
        /*$option = get_option( 'tb-data-updater-notice-dismissed' );
		if ( empty( $option ) ) {
			add_action( 'admin_notices', array( $this, 'static_content_notices' ) );
		}*/
		add_action( 'admin_init', array( $this, 'init_static_content_updater' ) );
		if ( is_multisite() ) {
			add_action( 'network_admin_menu', array( $this, 'network_builder_updater_menu' ) );
		}
		//add_action( 'init', array( $this, 'init_static_content_bg_process' ) ); /* disable this due to issue #7087 */
		add_action( 'wp_ajax_tb_dismiss_data_updater_notice', array($this, 'dismiss_data_updater_notice'), 10);
	}


	/**
	 * Get Builder Data
	 * 
	 * @access public
	 * @param int $post_id 
	 * @return array
	 */
	public function get_data( $post_id ) {
			
		$data = get_post_meta( $post_id, $this->meta_key, true );
		if(!empty($data)){
			$is_old=strpos($data,'\\\\\\')!==false ||  (strpos($data,'row_order')!==false && strpos($data,'column_order')!==false);//backward compatibility,only old version data contains row_order
			$data =json_decode( $data, true );
			if($is_old===true){
			    $data = stripslashes_deep(stripslashes_deep($data));
			}
		}
		else{
			$data = get_post_meta( $post_id, $this->old_meta_key, true);
			if(!empty($data)){
				$data = stripslashes_deep(maybe_unserialize( $data ));
			}
		}
		return $data;
	}

	/**
	 * Save Builder Data.
	 * 
	 * @access public
	 * @param string|array $builder_data 
	 * @param int $post_id 
	 * @param string $action 
	 */
	public function save_data( $builder_data, $post_id, $action = 'main', $source_editor = 'frontend' ) {
				$result = array();
				if($this->get_data($post_id)===$builder_data){
					$result['builder_data']=self::json_remove_unicode( $builder_data );;
				}
				else{
					$result['builder_data'] = $this->construct_data( $builder_data, $post_id, $action );
					
					if($action==='main'){
						/* save the data in json format */
						$result['mid']=$this->update_builder_meta($post_id,$result['builder_data']);
						if(!empty($result['mid'])){
							if ( 'backend' === $source_editor ) {
								// include static content data
								$plain_text = $this->_get_all_builder_text_content( $builder_data );
								if ( ! empty( $plain_text ) ) 
									$result['static_content'] = $this->add_static_content_wrapper( $plain_text );
							}
							if(class_exists('Themify_Builder_Revisions')){
							    Themify_Builder_Revisions::create_revision($post_id,$result['builder_data'],$source_editor);
							 
							}  
							// Save used GS
							Themify_Global_Styles::save_used_global_styles($result['builder_data'], $post_id);

							/**
							 * Fires After Builder Saved.
							 * 
							 * @param array $builder_data
							 * @param int $post_id
							 */		
							do_action( 'themify_builder_save_data', $result['builder_data'], $post_id );
						}
					}
				}
				return $result;
	}

	/**
	 * Construct data builder for saving.
	 * 
	 * @access public
	 * @param array $builder_data 
	 * @param int $post_id 
	 * @param string $action 
	 * @return array
	 */
	public function construct_data( $builder_data, $post_id, $action='main' ) { 
		 /* if it's serialized, convert to array */
		 
		if( is_serialized( $builder_data ) ) {
			$builder_data = stripslashes_deep( unserialize( $builder_data ) );
		} elseif( is_string( $builder_data ) ) { /* perhaps it's a JSON string */
			/* validation: convert to JSON and see if it works */
			$converted = json_decode( $builder_data );
			if( is_array( $converted ) ) {
				$builder_data = $converted;
			}
			$converted=null;
		}
		
		$builder_data = apply_filters( 'themify_builder_data_before_construct', $builder_data, $post_id );

		if ($action==='import' && is_array($builder_data) && !empty($builder_data)) {
			$builder_data = Themify_Builder_Import_Export::replace_export(json_decode(json_encode($builder_data),true),$post_id);
		}
		elseif($action==='main'){
		    $builder_data = self::json_remove_unicode( $builder_data );
		    /**
		     * Ensure site URLs are saved without being escaped
		     * This is so the "search and replace" tools can later find the site URL without issue
		     * Ticket: #5336
		     */
		    $builder_data = map_deep( $builder_data, array( __CLASS__, 'unescape_home_url' ) );

		}
		return $builder_data;
	}

	/**
	 * Finds escaped home_url() and returns the unescaped version
	 *
	 * @return string|mixed
	 */
	public static function  unescape_home_url( $value ) {
		$formatted_url = str_replace( '/', '\\\/', home_url() );
		return is_string( $value ) ? str_replace( $formatted_url, home_url(), $value ) : $value;
	}

	/**
	 * Remove unicode sequences back to original character
	 * 
	 * @access public
	 * @param array $data 
	 * @return json
	 */
	public static function json_remove_unicode( $data ) {
	    return version_compare( PHP_VERSION, '5.4', '>=')?json_encode( $data, JSON_UNESCAPED_UNICODE ):json_encode( $data );
	}

	/**
	 * fix importing Builder contents using WP_Import
	 * 
	 * @access public
	 */
	public function import_post_meta( $post_id, $key, $value ) {
	    if( $key === $this->meta_key ) {
			$this->update_builder_meta($post_id, $value);
	    }
	}

	/**
	 * Check if content has static content
	 * @param string $content 
	 */
	public function has_static_content( $content ) {
		return preg_match( self::$regex_static_content, $content );
	}

	/**
	 * Get static content
	 * @param string $content 
	 * @return string
	 */
	public function get_static_content( $content ) {
		if ( preg_match( self::$regex_static_content, $content, $matches ) ) {
			return $matches[0];
		}
		return '';
	}

	/**
	 * Check if content has builder block
	 * @param string $content 
	 */
	public function has_builder_block( $content ) {
		return preg_match( self::$regex_builder_block, $content );
	}

	/**
	 * Update static content string in the string.
	 * 
	 * @param string $replace_string 
	 * @param string $content 
	 * @param bool $first_instance True: replace only the first instance of Builder placeholder and remove the rest; False: replace all instances with $replace_string
	 * @return string
	 */
	public function update_static_content_string( $replace_string, $content, $first_instance = true ) {
		if ( $this->has_static_content( $content ) ) {
			$replace_string = preg_replace( '/\$(\d)/', '\\$$1', $replace_string ); // escape dollar sign
			$replace_string = str_replace('<!-- /themify_builder_content -->', '', $replace_string );

			if ( $first_instance ) {
				// replace first instance of 'themify_builder_static' with output, clear the rest
				$counter = 0;
				$content = preg_replace_callback( self::$regex_static_content, function( $matches ) use ( $replace_string, &$counter ) {
					return $counter++ === 0 ? $replace_string : '';
				}, $content );
			} else {
				$content = preg_replace( self::$regex_static_content, $replace_string, $content );
			}
			$content = $this->remove_empty_p( $content );
		}
		return $content;
	}

	/**
	 * Update builder block tag in the string.
	 * 
	 * @param string $replace_string 
	 * @param string $content 
	 * @return string
	 */
	public function replace_builder_block_tag( $replace_string, $content ) {
		if ( $this->has_builder_block( $content ) ) {
			$replace_string = preg_replace( '/\$(\d)/', '\\\$$1', $replace_string ); // escape dollar sign
			$content = preg_replace( self::$regex_builder_block, $replace_string, $content );
			$content = $this->remove_empty_p( $content );
		}
		return $content;
	}

	/**
	 * Add extra div wrapper to hide static content div 
	 * 
	 * @param string $content 
	 * @return string
	 */
	public function wrap_static_content_if_fail( $content ) {
		if ( ! $this->has_static_content( $content ) ) {
			return $content;
		}
		return preg_replace_callback( self::$regex_static_content, array( $this, 'wrap_static_content_cb'), $content );
	}

	/**
	 * Wrap static content callback
	 * 
	 * @param aray $matches 
	 * @return string
	 */
	public function wrap_static_content_cb( $matches ) {
		return '<div class="themify-builder-static-content">' . $matches[0] .'</div>';
	}

	/**
	 * Add static content wrapper
	 * @param string $string 
	 * @return string
	 */
	public function add_static_content_wrapper( $string ) {
		return '<!--themify_builder_static-->' . $string . '<!--/themify_builder_static-->';
	}

	/**
	 * Save the builder plain content into post_content
	 * 
	 * @param int $post_id
	 * @param json string $data 
	 */
	private function save_builder_text_only( $post_id, $data ) {
		if(wp_is_post_revision( $post_id )){
		    return false;
		}
		$post = get_post($post_id); 
		if(!empty($post)){
		    $text_only = $this->_get_all_builder_text_content(json_decode($data,true) );
		    if (!empty( $text_only ) ){
			$post_content = $post->post_content;
			if ( $this->has_static_content( $post_content ) ) {
			    $post_content = $this->update_static_content_string( $this->add_static_content_wrapper( $text_only ), $post_content );
			} else {
			    $post_content = $post_content . $this->add_static_content_wrapper( $text_only );
			}
			self::update_post($post_id,array('post_content'=>$post_content));
		    }
		    return true;
		}
		return false;
	}
	
	
	private static function removeTags($text){
	    

	    // Remove unnecessary tags.
	    $text = preg_replace( '/<\/?div[^>]*\>/i', '', $text );
	    $text = preg_replace( '/<\/?span[^>]*\>/i', '', $text );
	    $text = preg_replace( '@<(script|style)[^>]*?>.*?</\\1>@si', '', $text );
	    $text = preg_replace( '/<i [^>]*><\\/i[^>]*>/', '', $text );
	    $text = preg_replace( '/ class=".*?"/', '', $text );
	    $text = preg_replace( '/<!--(.|\s)*?-->/' , '' , $text );

	    // Remove line breaks
	    $text = preg_replace( '/(^|[^\n\r])[\r\n](?![\n\r])/', '$1 ', $text );
	    return normalize_whitespace( $text );
	}
	/**
	 * Get all module output plain content.
	 * 
	 * @param array $data 
	 * @return string
	 */
	public function _get_all_builder_text_content( $data ) {
		global $ThemifyBuilder;
		$data = $ThemifyBuilder->get_flat_modules_list( null, $data );
		$text = array();
		if( is_array( $data ) ) {
			foreach( $data as $module ) {
				if(isset($module['mod_name']) ) {
					if(!isset(Themify_Builder_Model::$modules[ $module['mod_name'] ])){
						Themify_Builder_Component_Module::load_modules($module['mod_name']);
					}
					if(isset(Themify_Builder_Model::$modules[ $module['mod_name'] ])){
						$text[] = self::removeTags(Themify_Builder_Model::$modules[ $module['mod_name'] ]->get_plain_content( $module ));
					}
				}
			}
		}
		$data=null;
		return implode( "\n", $text );
	}

	/**
	 * Display admin notices when builder should be updated
	 * to support static content
	 */
	public function static_content_notices() {

		if ( 'yes' === get_option( 'themify_builder_static_content_done' ) ) {
			return;
		} elseif ( ! $this->has_existing_builder_data() ) {
			$_key='themify_builder_static_content_done';
			delete_option($_key);
			add_option($_key,'yes', '', false );
			return;
		}
		
		if ( self::$static_content_process->is_updating() || empty( $_GET['do_update_themify_builder_static_content'] ) ):
		$settings_page = themify_is_themify_theme() ? 'themify' : 'themify-builder';
		?>

		<div class="tb_builder_data_updater_notice notice notice-warning is-dismissible">
			<?php if ( self::$static_content_process->is_updating() ): ?>
				<p><strong><?php _e( 'Themify Builder data updater', 'themify' ); ?></strong> &#8211; <?php _e( 'Builder static content is being updated in the background.', 'themify' ); ?></p>
			<?php else: ?>
				<p><strong><?php _e( 'Themify Builder data updater', 'themify' ); ?></strong> &#8211; <?php _e( 'Run updater to convert your existing posts and pages to support Builder static content (<a href="https://themify.me/docs/builder#static-content" target="_blank">learn more</a>).', 'themify' ); ?></p>
				<p class="submit"><a href="<?php echo esc_url( add_query_arg( 'do_update_themify_builder_static_content', 'true', admin_url( 'admin.php?page=' . $settings_page ) ) ); ?>" class="tb_static_update_now button-primary"><?php _e( 'Run the updater', 'themify' ); ?></a></p>
			<?php endif; ?>
		</div>
		<script type="text/javascript">
			jQuery( '.tb_static_update_now' ).on( 'click', function() {
				return window.confirm( '<?php echo esc_js( __( 'It is strongly recommended that you backup your database before proceeding. Are you sure you wish to run the updater now?', 'themify' ) ); ?>' );
			});
			jQuery(document).on('click', '.tb_builder_data_updater_notice .notice-dismiss', function(event){
				jQuery.ajax({
					type: 'POST',
					url: ajaxurl,
					data: {
						action: 'tb_dismiss_data_updater_notice'
					}
				});
			});
		</script>

		<?php else: ?> 
			<div class="notice notice-success">
				<p><?php _e( 'Themify Builder static content update complete.', 'themify' ); ?></p>
			</div>
		<?php
		endif;
	}

	/**
	 * Init the static content class.
	 */
	public function init_static_content_bg_process() {
		include_once( THEMIFY_BUILDER_CLASSES_DIR . '/class-themify-builder-static-content-updater.php' );
		self::$static_content_process = new Themify_Builder_Static_Content_Updater();
	}

	/**
	 * Init background process the static content updater.
	 */
	public function init_static_content_updater() {
		if ( ! empty( $_GET['do_update_themify_builder_static_content'] ) ) {
			global $wpdb;

			// get all posts
			$post_types = array();
			foreach( themify_post_types() as $type ) {
				$post_types[] = "'" . $type . "'";
			}

			$last_id = 0;
 			self::$static_content_process = new Themify_Builder_Static_Content_Updater();
			do {
				$sql = "SELECT $wpdb->posts.ID 
					FROM $wpdb->posts, $wpdb->postmeta 
					WHERE $wpdb->posts.ID > ". $last_id ."
					AND $wpdb->posts.ID = $wpdb->postmeta.post_id 
					AND $wpdb->postmeta.meta_key = '" . $this->meta_key . "' 
					AND $wpdb->posts.post_status = 'publish' 
					AND post_type IN (" . implode( ',', $post_types ) .") 
					ORDER BY ID ASC 
					LIMIT 10";

				$posts = $wpdb->get_results( $sql );
			 
				foreach ( $posts as $post ) {
					self::$static_content_process->push_to_queue( $post->ID );
					$last_id = $post->ID;
				}
			// Do it until we have no more records
			} while ( ! empty( $posts ) );
			self::$static_content_process->save()->dispatch();
		}
	}

	/**
	 * Check if site has existing builder data
	 * 
	 * @access public
	 * @return boolean
	 */
	public function has_existing_builder_data() {
		global $wpdb;
		$sql = "SELECT post_id FROM $wpdb->postmeta WHERE AND meta_key = '" . $this->meta_key . "' LIMIT 1";
		$id = $wpdb->get_var( $sql );
		if(!empty($id)){
		    $sql = "SELECT 1 FROM $wpdb->posts WHERE ID = '".$id."' AND post_status = 'publish' LIMIT 1";
		    $id = $wpdb->get_var( $sql );
		    $id=$id>0;
		}
		else{
		    $id=false;
		}
		return $id;
	}

	/**
	 * Perform static content conversion.
	 * 
	 * @param int $item
	 */
	public function run_static_content_updater( $item ) {
		$data = $this->get_data( $item );

		if ( is_array( $data ) && ! empty( $data ) ) {
			wp_update_post(array(
				'ID' => $item,
				'post_modified' => current_time('mysql'),
				'post_modified_gmt' => current_time('mysql', 1),
			));
		}
	}

	/**
	 * Remove empty paragraph
	 * 
	 * @access public
	 * @param string $content 
	 * @return string
	 */
	public function remove_empty_p( $content ) {
		return preg_replace( array(
			'#<p>\s*<(div)#',
			'#</(div)>\s*</p>#',
			'#</(div)>\s*<br ?/?>#',
			'#<(div)(.*?)>\s*</p>#',
			'#<p>\s*</(div)#',
		), array(
			'<$1',
			'</$1>',
			'</$1>',
			'<$1$2>',
			'</$1',
		), $content );
	}

	/**
	 * Dismiss builder data updater static content.
	 * 
	 * @access public
	 */
	public function dismiss_data_updater_notice() {
		$_key='tb-data-updater-notice-dismissed';
		delete_option($_key);
		add_option($_key,1, '', false );
		wp_send_json_success();
	}

	/**
	 * Register network menu for builder updater.
	 * 
	 * @access public
	 */
	public function network_builder_updater_menu() {
		add_menu_page( esc_html__( 'Themify Builder Data Updater', 'themify' ), esc_html__( 'Builder Updater', 'themify' ), 'manage_options', 'themify-builder-data-updater', array($this, 'network_builder_data_updater_page') );
	}

	/**
	 * Collect all builder data in all sites.
	 * 
	 * @access public
	 */
	public function network_collect_builder_data() {
		$sites = get_sites();
		$ids = array();

		foreach( $sites as $site ) {
			switch_to_blog( $site->blog_id );
			if ( 'yes' !== get_option( 'themify_builder_static_content_done' ) && $this->has_existing_builder_data() ) {
				$ids[] = $site->blog_id;
			}
			restore_current_blog();
		}
		return $ids;
	}

	/**
	 * Network Builder Data update page.
	 * 
	 * @access public
	 */
	public function network_builder_data_updater_page() { ?>
		<div class="wrap">
			<h2><?php esc_html_e( 'Themify Builder Data Updater', 'themify' );?></h2>
			
			<?php
			$action = isset($_GET['tb_action']) ? $_GET['tb_action'] : 'show'; 

			switch ( $action ) {
				case 'update':
					$n = ( isset($_GET['n']) ) ? intval($_GET['n']) : 0;
					$limit = 5;

					$site_ids = get_sites( array(
						'spam'       => 0,
						'deleted'    => 0,
						'archived'   => 0,
						'network_id' => get_current_network_id(),
						'number'     => $limit,
						'offset'     => $n,
						'fields'     => 'ids',
						'order'      => 'DESC',
						'orderby'    => 'ID',
					) );
					if ( empty( $site_ids ) ) {
						echo '<p>' . __( 'All done!', 'themify' ) . '</p>';
						break;
					}
					echo '<ul>';
					foreach ( (array) $site_ids as $site_id ) {
						switch_to_blog( $site_id );
						$siteurl = site_url();
						$upgrade_url = add_query_arg( array( 'page' => 'themify', 'do_update_themify_builder_static_content' => true ), admin_url('admin.php') );
						$cookies = array();

						foreach ( $_COOKIE as $name => $value ) {
							$cookies[] = new WP_Http_Cookie( array( 'name' => $name, 'value' => $value ) );
						}

						restore_current_blog();

						echo "<li>$siteurl</li>";

						$response = wp_remote_get( $upgrade_url, array(
							'timeout' => 10000, 
							'cookies' => $cookies,
							'httpversion' => '1.1',
							'sslverify'   => false
						) );
						if ( is_wp_error( $response ) ) {
							wp_die( sprintf(
								__( 'Warning! Problem updating builder data in %1$s. Your server may not be able to connect to sites running on it. Error message: %2$s', 'themify' ),
								$siteurl,
								'<em>' . $response->get_error_message() . '</em>'
							) );
						}
					}
					echo '</ul>';

					$action_url = add_query_arg( array(
						'page'   => 'themify-builder-data-updater',
						'tb_action' => 'update',
						'n' => $n+$limit
					), network_admin_url( 'admin.php' ) );

					?><p><?php _e( 'If your browser doesn&#8217;t start loading the next page automatically, click this link:', 'themify' ); ?> <a class="button" href="<?php echo $action_url; ?>"><?php _e('Next Sites', 'themify'); ?></a></p>
					<script type="text/javascript">
					<!--
					function nextpage() {
						document.location.href = "<?php echo $action_url; ?>";
					}
					setTimeout( "nextpage()", 250 );
					//-->
					</script><?php
				break;
				case 'show':
				default: ?>
					
					<p><?php _e( 'Run updater to convert your existing posts and pages to support Builder static content (<a href="https://themify.me/docs/builder#static-content" target="_blank">learn more</a>).', 'themify' ); ?></p>
					
					<p><?php _e( 'The update process may take a little while, so please be patient.', 'themify' ); ?></p>
					<p><a class="button button-primary" href="<?php echo network_admin_url( 'admin.php?page=themify-builder-data-updater&tb_action=update' );?>"><?php _e( 'Update Builder Data Now', 'themify' ); ?></a></p>
					
					<?php
				break;
			} ?>
		</div>
	<?php
	}

	
	/**
	 * Save the builder in post meta
	 * 
	 * @param int $post_id 
	 * @param json string $data 
	 */
	private function update_builder_meta($post_id,$data){
	    $data = apply_filters( 'themify_builder_data_before_update_meta', $data, $post_id );
	    $isRevision=wp_is_post_revision( $post_id );
	    if($isRevision || $this->save_builder_text_only($post_id, $data)){
		//Don't use delete_post_meta will remove revision parent builder data
		delete_metadata( 'post', $post_id,$this->meta_key );
		if(!$isRevision){
		    /* remove the old data format */
		    delete_metadata( 'post', $post_id,$this->old_meta_key );
		}
		if(!empty($data)){
		    global $wpdb;
		    do_action( 'add_post_meta', $post_id, $this->meta_key, $data);
		    $result = $wpdb->insert(
			    _get_meta_table('post'),
			    array(
				    'post_id'      => $post_id,
				    'meta_key'   =>  $this->meta_key,
				    'meta_value' =>$data
			    ),
			    array('%d','%s','%s')
		    );
		    if ( ! $result ) {
				return false;
		    }
		    $mid = (int) $wpdb->insert_id;
		}
		
		if(!$isRevision){
		    Themify_Builder_Model::remove_cache($post_id);
		    wp_cache_delete( $post_id,'post_meta' );
		    TFCache::remove_cache($post_id);
		    themify_clear_menu_cache();
            TFCache::clear_3rd_plugins_cache($post_id);
		}
		if(!empty($data)){
		    do_action( 'added_post_meta', $mid, $post_id, $this->meta_key, $data );
		}
		if(!$isRevision){
		    // update the post modified date time, to indicate the post has been modified
		    self::update_post($post_id,array('post_modified'=>current_time('mysql'),'post_modified_gmt'=>current_time('mysql', 1)));
		}
		return $mid;
	    }
	    return false;
	}
	
	public static function update_post($post_id,$data){
		global $wpdb;
		return $wpdb->update( $wpdb->posts, $data,array('ID'=>$post_id),null,array('%d'));

	}
}

$GLOBALS['ThemifyBuilder_Data_Manager'] = new ThemifyBuilder_Data_Manager();
