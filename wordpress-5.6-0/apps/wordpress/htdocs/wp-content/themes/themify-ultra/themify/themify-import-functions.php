<?php
/**
 * Runs before importing/erasing sample contents of the theme
 *
 * @package Themify
 */

defined( 'ABSPATH' ) or die;

/* disable error reporting */
error_reporting( 0 );
@ini_set( 'display_errors', 0 );
add_filter( 'doing_it_wrong_trigger_error', '__return_false' );

require_once ABSPATH . 'wp-admin/includes/post.php';
require_once ABSPATH . 'wp-admin/includes/taxonomy.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

class Themify_Import_Helper {

	/* map old_id from demo site to new IDs */
	private static $processed_terms = array();
	private static $processed_posts = array();

	/* list of actions to run after demo content has been imported */
	private static $import_actions = array();

	/**
	 * Add an Import Action, this data is stored for processing after import is done.
	 *
	 * Each action is sent as an Ajax request and is handled by themify-ajax.php file
	 */ 
	public static function add_import_action( $action = '', $data = array() ) {
		if ( ! isset( self::$import_actions[ $action ] ) ) {
			self::$import_actions[ $action ] = array();
		}

		self::$import_actions[ $action ][] = $data;
	}

	public static function get_import_actions() {
		return self::$import_actions;
	}

	public static function import_post( $post ) {
		if ( ! post_type_exists( $post['post_type'] ) ) {
			return;
		}

		/* Menu items don't have reliable post_title, skip the post_exists check */
		if( $post['post_type'] !== 'nav_menu_item' ) {
			$post_exists = post_exists( $post['post_title'], '', $post['post_date'] );
			if ( $post_exists && get_post_type( $post_exists ) == $post['post_type'] ) {
				self::$processed_posts[ intval( $post['ID'] ) ] = intval( $post_exists );
				return;
			}
		}

		if( $post['post_type'] == 'nav_menu_item' ) {
			if( ! isset( $post['tax_input']['nav_menu'] ) || ! term_exists( $post['tax_input']['nav_menu'], 'nav_menu' ) ) {
				return;
			}
			$_menu_item_type = $post['meta_input']['_menu_item_type'];
			$_menu_item_object_id = $post['meta_input']['_menu_item_object_id'];

			if ( 'taxonomy' == $_menu_item_type && isset( self::$processed_terms[ intval( $_menu_item_object_id ) ] ) ) {
				$post['meta_input']['_menu_item_object_id'] = self::$processed_terms[ intval( $_menu_item_object_id ) ];
			} else if ( 'post_type' == $_menu_item_type && isset( self::$processed_posts[ intval( $_menu_item_object_id ) ] ) ) {
				$post['meta_input']['_menu_item_object_id'] = self::$processed_posts[ intval( $_menu_item_object_id ) ];
			} else if ( 'custom' != $_menu_item_type ) {
				// associated object is missing or not imported yet, we'll retry later
				// $missing_menu_items[] = $item;
				return;
			}
		}

		$post_parent = ( $post['post_type'] == 'nav_menu_item' ) ? $post['meta_input']['_menu_item_menu_item_parent'] : (int) $post['post_parent'];
		$post['post_parent'] = 0;
		if ( $post_parent ) {
			// if we already know the parent, map it to the new local ID
			if ( isset( self::$processed_posts[ $post_parent ] ) ) {
				if( $post['post_type'] == 'nav_menu_item' ) {
					$post['meta_input']['_menu_item_menu_item_parent'] = self::$processed_posts[ $post_parent ];
				} else {
					$post['post_parent'] = self::$processed_posts[ $post_parent ];
				}
			}
		}

		/**
		 * for hierarchical taxonomies, IDs must be used so wp_set_post_terms can function properly
		 * convert term slugs to IDs for hierarchical taxonomies
		 */
		if( ! empty( $post['tax_input'] ) ) {
			foreach( $post['tax_input'] as $tax => $terms ) {
				if( is_taxonomy_hierarchical( $tax ) ) {
					$terms = explode( ', ', $terms );
					$post['tax_input'][ $tax ] = array_map( 'Themify_Import_Helper::get_term_id_by_slug', $terms, array_fill( 0, count( $terms ), $tax ) );
				}
			}
		}

		$post['post_author'] = (int) get_current_user_id();
		$post['post_status'] = 'publish';

		$old_id = $post['ID'];

		unset( $post['ID'] );
		$post_id = wp_insert_post( $post, true );
		if( is_wp_error( $post_id ) ) {
			return false;
		} else {
			self::$processed_posts[ $old_id ] = $post_id;

			return $post_id;
		}
	}

	public static function get_placeholder_image() {
		static $placeholder_image = null;

		if ( $placeholder_image == null ) {
			if ( ! function_exists( 'WP_Filesystem' ) ) {
				require_once ABSPATH . 'wp-admin/includes/file.php';
			}
			WP_Filesystem();
			global $wp_filesystem;

			$post = array();

			$upload = wp_upload_bits( 'themify-placeholder.jpg', null, $wp_filesystem->get_contents( THEMIFY_DIR . '/img/image-placeholder.jpg' ) );

			if ( $info = wp_check_filetype( $upload['file'] ) )
				$post = array(
					'post_mime_type' => $info['type']
				);
			else
				return new WP_Error( 'attachment_processing_error', __( 'Invalid file type', 'themify' ) );

			$post['guid'] = $upload['url'];
			$placeholder_image = wp_insert_attachment( $post, $upload['file'] );
			require_once( ABSPATH . 'wp-admin/includes/image.php' );
			wp_update_attachment_metadata( $placeholder_image, wp_generate_attachment_metadata( $placeholder_image, $upload['file'] ) );
		}

		return $placeholder_image;
	}

	public static function process_import_term( $term ) {
		if( ERASEDEMO ) {
			self::undo_import_term( $term );
		} else {
			self::import_term( $term );
		}
	}

	public static function import_term( $term ) {
		if( $term_id = term_exists( $term['slug'], $term['taxonomy'] ) ) {
			if ( is_array( $term_id ) ) $term_id = $term_id['term_id'];
			if ( isset( $term['term_id'] ) )
				self::$processed_terms[ intval( $term['term_id'] ) ] = (int) $term_id;
			return (int) $term_id;
		}

		if ( empty( $term['parent'] ) || ! isset( self::$processed_terms[ intval( $term['parent'] ) ] ) ) {
			$parent = 0;
		} else {
			$parent = term_exists( self::$processed_terms[ intval( $term['parent'] ) ], $term['taxonomy'] );
			if ( is_array( $parent ) ) $parent = $parent['term_id'];
		}

		$id = wp_insert_term( $term['name'], $term['taxonomy'], array(
			'parent' => $parent,
			'slug' => $term['slug'],
			'description' => $term['description'],
		) );
		if ( ! is_wp_error( $id ) ) {
			if ( isset( $term['term_id'] ) ) {
				// success!
				self::$processed_terms[ intval($term['term_id']) ] = $id['term_id'];
				if ( isset( $term['thumbnail'] ) ) {
					self::add_import_action( 'term_thumb', array(
						'id' => $id['term_id'],
						'thumb' => $term['thumbnail'],
					) );
				}
				return $term['term_id'];
			}
		}

		return false;
	}

	public static function get_term_id_by_slug( $slug, $tax ) {
		$term = get_term_by( 'slug', $slug, $tax );
		if( $term ) {
			return $term->term_id;
		}

		return false;
	}

	public static function undo_import_term( $term ) {
		$term_id = term_exists( $term['slug'], $term['taxonomy'] );
		if ( $term_id ) {
			if ( is_array( $term_id ) ) $term_id = $term_id['term_id'];

			if ( $term_thumbnail = get_term_meta( $term['term_id'], 'thumbnail_id', true ) ) {
				wp_delete_attachment( $term_thumbnail, true );
			}

			if ( isset( $term_id ) ) {
				wp_delete_term( $term_id, $term['taxonomy'] );
			}
		}
	}

	/**
	 * Determine if a post exists based on title, content, and date
	 *
	 * @global wpdb $wpdb WordPress database abstraction object.
	 *
	 * @param array $args array of database parameters to check
	 * @return int Post ID if post exists, 0 otherwise.
	 */
	public static function post_exists( $args = array() ) {
		global $wpdb;

		$query = "SELECT ID FROM $wpdb->posts WHERE 1=1";
		$db_args = array();

		foreach ( $args as $key => $value ) {
			$value = wp_unslash( sanitize_post_field( $key, $value, 0, 'db' ) );
			if( ! empty( $value ) ) {
				$query .= ' AND ' . $key . ' = %s';
				$db_args[] = $value;
			}
		}

		if ( !empty ( $args ) )
			return (int) $wpdb->get_var( $wpdb->prepare($query, $args) );

		return 0;
	}

	public static function undo_import_post( $post ) {
		if( $post['post_type'] == 'nav_menu_item' ) {
			$post_exists = self::post_exists( array(
				'post_name' => $post['post_name'],
				'post_modified' => $post['post_date'],
				'post_type' => 'nav_menu_item',
			) );
		} else {
			$post_exists = post_exists( $post['post_title'], '', $post['post_date'] );
		}
		if( $post_exists && get_post_type( $post_exists ) == $post['post_type'] ) {
			/**
			 * check if the post has been modified, if so leave it be
			 *
			 * NOTE: posts are imported using wp_insert_post() which modifies post_modified field
			 * to be the same as post_date, hence to check if the post has been modified,
			 * the post_modified field is compared against post_date in the original post.
			 */
			if( $post['post_date'] == get_post_field( 'post_modified', $post_exists ) ) {
				// find and remove all post attachments
				$attachments = get_posts( array(
					'post_type' => 'attachment',
					'posts_per_page' => -1,
					'post_parent' => $post_exists,
				) );
				if ( $attachments ) {
					foreach ( $attachments as $attachment ) {
						wp_delete_attachment( $attachment->ID, true );
					}
				}
				wp_delete_post( $post_exists, true ); // true: bypass trash
			}
		}
	}

	public static function process_post_import( $post ) {
		if( ERASEDEMO ) {
			self::undo_import_post( $post );
		} else {
			if ( $id = self::import_post( $post ) ) {
				if ( defined( 'IMPORT_IMAGES' ) && ! IMPORT_IMAGES ) {
					/* if importing images is disabled and post is supposed to have a thumbnail, create a placeholder image instead */
					if ( isset( $post['thumb'] ) ) { // the post is supposed to have featured image
						$placeholder = self::get_placeholder_image();
						if ( ! empty( $placeholder ) && ! is_wp_error( $placeholder ) ) {
							set_post_thumbnail( $id, $placeholder );
						}
					}
				} else {
					if ( isset( $post["thumb"] ) ) {
						self::add_import_action( 'post_thumb', array(
							'id' => $id,
							'thumb' => $post["thumb"],
						) );
					}
					if ( isset( $post["gallery_shortcode"] ) ) {
						self::add_import_action( 'gallery_field', array(
							'id' => $id,
							'fields' => $post["gallery_shortcode"],
						) );
					}
					if ( isset( $post["_product_image_gallery"] ) ) {
						self::add_import_action( 'product_gallery', array(
							'id' => $id,
							'images' => $post["_product_image_gallery"],
						) );
					}
				}
			}
		}
	}
}