<?php
/**
 * Adds Schema.org Microdata Support
 * Adds Organization fields in User Profile Page
 * @since 2.6.6
 * @return json
 */

if( ! class_exists( 'Themify_Microdata' ) ) :
class Themify_Microdata {

    private $output = array();

	function __construct() {
		if ( is_admin() ) {
			add_filter( 'themify_metabox/user/fields', array( $this, 'custom_user_meta_fields' ) );
		} else {
			add_action( 'themify_body_start', array( $this, 'schema_markup_homepage' ) );
			add_action( 'themify_content_start', array( $this, 'schema_markup_page' ) );
			add_action( 'themify_post_start', array( $this, 'schema_markup_post' ) );
			add_action( 'themify_body_end', array( $this, 'display_schema_markup' ) );
			add_filter( 'get_avatar', array( $this, 'authorbox_microdata' ) );
		}
		if ( themify_is_woocommerce_active() ) {
			add_action( 'woocommerce_after_shop_loop_item', array( $this, 'schema_markup_wc_product' ) );
		}
	}

	function schema_markup_homepage() {
		// Homepage
		if ( is_home() || is_front_page() && ! is_paged() ) {
			include_once( ABSPATH . 'wp-admin/includes/plugin.php' );
			if ( is_plugin_inactive( 'wordpress-seo/wp-seo.php' ) ) {
				$current_page_url = $_SERVER["HTTP_HOST"] . $_SERVER["REQUEST_URI"];
				$microdata = array(
					'@context' => 'https://schema.org',
					'@type' => 'WebSite',
					'url' => esc_url( $current_page_url ),
					'potentialAction' => array(
						'@type' => 'SearchAction',
						'target' => esc_url( $current_page_url ) .'?&s={search_term_string}',
						'query-input' => 'required name=search_term_string'
					)
				);
				$this->output[] = $microdata;
			}
		}
	}

	// Pages
	function schema_markup_page() {
		global $post;

		if( ! isset( $post ) ) {
			return;
		}

		$post_title         = get_the_title();
		$date_added         = get_the_time('c');
		$date_modified      = $date_added;
		$permalink          = get_permalink();
		$excerpt            = $post->post_excerpt;
		$comments           = get_comments(array('post_id' => $post->ID,'status' => 'approve'));
		$comment_count      = 0;
		$post_image         = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), 'large' );
		$current_page_url   = $_SERVER["HTTP_HOST"] . $_SERVER["REQUEST_URI"];
		$author             = get_the_author();
		$author_description = get_the_author_meta('description');
		$author_url         = get_the_author_meta('user_url');
		$author_avatar      = get_avatar_url( get_the_author_meta('user_email') );
		$author_avatar_data = get_avatar_data( get_the_author_meta('user_email') );

		if ( is_attachment() && is_single() ) {
			$post_schema_type = 'CreativeWork';
		} elseif ( is_author() ) {
			$post_schema_type = 'ProfilePage';
		} elseif ( is_search() ) {
			$post_schema_type = 'SearchResultsPage';
		} elseif ( themify_is_shop() ) {
			$post_schema_type = 'Store';
		} elseif ( themify_is_woocommerce_active() && is_product() ) {
			$post_schema_type = 'Product';
		} elseif ( is_page() ) {
			$post_schema_type = 'WebPage';
		}

		// Page
		if( is_page() && ! post_password_required() ) {
			if( ! (  themify_is_shop() ) ) {
				$microdata = array(
					'@context' => 'https://schema.org',
					'@type' => $post_schema_type,
					'mainEntityOfPage' => array(
						'@type' => 'WebPage',
						'@id' => $permalink,
					),
					'headline' => $post_title,
					'datePublished' => $date_added,
					'dateModified' => $date_modified,
					'description' => $excerpt
				);
				if( has_post_thumbnail() ) {
					$microdata['image'] = array(
						'@type' => 'ImageObject',
						'url' => $post_image[0],
						'width' => $post_image[1],
						'height' => $post_image[2]
					);
				}
				if(!empty($comments)){
					foreach ( $comments as $comment ) {
						$microdata['comment'][] = array(
							'@type' => 'Comment',
							'author' => array(
								'@type' => 'Person',
								'name' => $comment->comment_author
							),
							'text' => $comment->comment_content
						);
						++$comment_count;
					}
					$microdata['commentCount']=$comment_count;
				}
					
				$this->output[] = $microdata;
			}
		}

		// Profile Page
		elseif ( is_author() ) {
			$microdata = array(
				'@context' => 'https://schema.org',
				'@type' => $post_schema_type,
				'mainEntityOfPage' => array(
					'@type' => 'WebPage',
					'@id' => $current_page_url,
				),
				'author' => array(
					'@type' => 'Person',
					'name' => $author
				),
				'image' => array(
					'@type' => 'ImageObject',
					'url' => $author_avatar,
					'width' => $author_avatar_data['width'],
					'height' => $author_avatar_data['height']
				),
				'description' => $author_description,
				'url' => $author_url
			);
			$this->output[] = $microdata;
		}

		// Search Page
		elseif ( is_search() ) {
			$microdata = array(
				'@context' => 'https://schema.org',
				'@type' => $post_schema_type,
				'mainEntityOfPage' => array(
					'@type' => 'WebPage',
					'@id' => $current_page_url,
				)
			);
			$this->output[] = $microdata;
		}
		// Shop Page
		elseif ( themify_is_shop() ) {
			$microdata = array(
				'@context' => 'https://schema.org',
				'@type' => $post_schema_type,
				'mainEntityOfPage' => array(
					'@type' => 'WebPage',
					'@id' => $current_page_url,
				)
			);
			$this->output[] = $microdata;
		}

	}

	// Posts
	function schema_markup_post() {
		global $post;

		if ( post_password_required() ) {
			return;
		}

		$post_title     = get_the_title();
		$date_added     = get_the_time('c');
		$date_modified  = $date_added;
		$permalink      = get_permalink();
		$author         = get_the_author();
		$excerpt        = get_the_excerpt();
		$publisher_name = get_the_author_meta('user_meta_org_name');
		$publisher_logo = get_the_author_meta('user_meta_org_logo');
		$logo_width = $logo_height = 0;
		if ( $publisher_logo ) {
			$publisher_logo_id = themify_get_attachment_id_from_url( $publisher_logo);
			if( $publisher_logo_id ) {
				$publisher_logo_meta = wp_get_attachment_metadata( $publisher_logo_id );
				if ( ! empty( $publisher_logo_meta['width'] ) ) {
					$logo_width = $publisher_logo_meta['width'];
				}
				if ( ! empty( $publisher_logo_meta['height'] ) ) {
					$logo_height = $publisher_logo_meta['height'];
				}
			}
		}
		$comments       = get_approved_comments($post->ID, array('type'=>'comment','no_found_rows'=>false) );
		$comment_count  = 0;
		$post_types     = array( 'post', 'press' );
		$creative_types   = apply_filters( 'tb_creative_works_items', array( 'audio', 'highlight', 'quote', 'portfolio', 'testimonial', 'video' ) );
		$post_image     = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), 'large' );
		// Cases
		if ( is_singular('post') ) {
			$post_schema_type = 'BlogPosting';
		} elseif ( in_array( $post->post_type, $creative_types,true ) ) {
			$post_schema_type = 'CreativeWork';
		} elseif ( $post->post_type === 'team' ) {
			$post_schema_type = 'Person';
		} elseif ( $post->post_type === 'event' ) {
			$post_schema_type = 'Event';
		} elseif ( $post->post_type === 'gallery' ) {
			$post_schema_type = 'ImageGallery';
		} elseif ( $post->post_type === 'press' ) {
			$post_schema_type = 'NewsArticle';
		} else {
			$post_schema_type = 'Article';
		}

		if ( in_array( $post->post_type, $post_types,true )) {
			$microdata = array(
				'@context' => 'https://schema.org',
				'@type' => $post_schema_type,
				'mainEntityOfPage' => array(
					'@type' => 'WebPage',
					'@id' => $permalink
				),
				'headline' => $post_title,
				'datePublished' => $date_added,
				'dateModified' => $date_modified,
				'author' => array(
					'@type' => 'Person',
					'name' => $author
				),
				'publisher' => array(
					'@type' => 'Organization',
					'name' => $publisher_name,
					'logo' => array(
						'@type' => 'ImageObject',
						'url' => $publisher_logo,
						'width' => $logo_width,
						'height' => $logo_height
					),
				),
				'description' => $excerpt
			);
			if ( has_post_thumbnail() ) {
				$microdata['image'] = array(
					'@type' => 'ImageObject',
					'url' => $post_image[0],
					'width' => $post_image[1],
					'height' => $post_image[2]
				);
			}
			if ( !empty($comments) && is_single() ) {
				foreach ( $comments as $comment ) {
					$microdata['comment'][] = array(
						'@type' => 'Comment',
						'author' => array(
							'@type' => 'Person',
							'name' => $comment->comment_author
						),
						'text' => $comment->comment_content
					);
					++$comment_count;
				}
				$microdata['commentCount']=$comment_count;
			}
			$this->output[] = $microdata;
		} elseif ( $post->post_type === 'event' && class_exists( 'Themify_Event_Post' ) ) {
			$microdata = array(
				'@context' => 'https://schema.org',
				'@type' => $post_schema_type,
				'mainEntityOfPage' => array(
					'@type' => 'WebPage',
					'@id' => $permalink
				),
				'name' => $post_title,
				'description' => $excerpt,
				'startDate' => themify_get( 'start_date' ),
                                'endDate' => themify_get( 'end_date' ),
				'location' => array(
					'@type' => 'Place',
					'name' => themify_get( 'location' ),
					'address' => themify_get( 'map_address' )
				)
			);
			if ( themify_check( 'buy_tickets' ) ) {
				$microdata['offers'] = array(
					'@type' => 'Offer',
					// "price" => "",
					'url' => themify_get( 'buy_tickets' )
				);
			}
			if( has_post_thumbnail() ) {
				$microdata['image'] = array(
					'@type' => 'ImageObject',
					'url' => $post_image[0],
					'width' => $post_image[1],
					'height' => $post_image[2]
				);
			}
			$this->output[] = $microdata;
		} elseif ( $post->post_type === 'gallery' ) {
			$microdata = array(
				'@context' => 'https://schema.org',
				'@type' => $post_schema_type,
				'mainEntityOfPage' => array(
					'@type' => 'WebPage',
					'@id' => $permalink
				),
				'headline' => $post_title,
				'datePublished' => $date_added,
				'dateModified' => $date_modified,
				'author' => array(
					'@type' => 'Person',
					'name' => $author
				),
				'publisher' => array(
					'@type' => 'Organization',
					'name' => $publisher_name,
					'logo' => array(
						'@type' => 'ImageObject',
						'url' => $publisher_logo,
						'width' => $logo_width,
						'height' => $logo_height
					),
				),
				'description' => $excerpt
			);
			if ( has_post_thumbnail() ) {
				$microdata['image'] = array(
					'@type' => 'ImageObject',
					'url' => $post_image[0],
					'width' => $post_image[1],
					'height' => $post_image[2]
				);
			}
			if (!empty($comments) && is_single() ) {
				foreach ( $comments as $comment ) {
					$microdata['comment'][] = array(
						'@type' => 'Comment',
						'author' => array(
							'@type' => 'Person',
							'name' => $comment->comment_author
						),
						'text' => $comment->comment_content
					);
					++$comment_count;
				}
				$microdata['commentCount']=$comment_count;
			}
			$this->output[] = $microdata;
		} elseif ( in_array( $post->post_type, $creative_types,true ) ) { // Audio, Highlight, Quote, Portfolio, Testimonial, Video
			$microdata = array(
				'@context' => 'https://schema.org',
				'@type' => $post_schema_type,
				'mainEntityOfPage' => array(
					'@type' => "WebPage",
					'@id' => $permalink
				),
				'headline' => $post_title,
				'datePublished' => $date_added,
				'dateModified' => $date_modified,
				'description' => $excerpt
			);
			if( has_post_thumbnail() ) {
				$microdata['image'] = array(
					'@type' => 'ImageObject',
					'url' => $post_image[0],
					'width' => $post_image[1],
					'height' => $post_image[2]
				);
			}
			if ( $post->post_type === 'post'  && !empty($comments) && is_single() ) {
				
				foreach ( $comments as $comment ) {
					$microdata['comment'][] = array(
						'@type' => 'Comment',
						'author' => array(
							'@type' => 'Person',
							'name' => $comment->comment_author
						),
						'text' => $comment->comment_content
					);
					++$comment_count;
				}
				$microdata['commentCount']=$comment_count;
			}
			if ( themify_get( 'video_url' ) != '' ) {
				$post_video = themify_get('video_url');
				$video_meta = $this->fetch_video_meta( $post_video );
				if( $video_meta ) {
					$microdata['video'] = array(
						'@type' => 'VideoObject',
						'url' => $post_video
					);
					if( isset( $video_meta->thumbnail_url ) ) {
						$microdata['video']['thumbnailUrl'] = $video_meta->thumbnail_url;
					}
					$microdata['video']['uploadDate'] = isset( $video_meta->upload_date )?$video_meta->upload_date:$date_added;
					$microdata['video']['description'] = isset( $video_meta->description )?$video_meta->description:$excerpt;
					$microdata['video']['name'] = isset( $video_meta->title )?$video_meta->title:$post_title;
				}
			}
			$this->output[] = $microdata;
		} elseif ( $post->post_type === 'team' ) {
			$microdata = array(
				'@context' => 'https://schema.org',
				'@type' => $post_schema_type,
				'mainEntityOfPage' => array(
					'@type' => 'WebPage',
					'@id' => $permalink
				),
				'name' => $post_title,
				'description' => $excerpt
			);
			if( has_post_thumbnail() ) {
				$microdata['image'] = array(
					'@type' => 'ImageObject',
					'url' => $post_image[0],
					'width' => $post_image[1],
					'height' => $post_image[2]
				);
			}
			$this->output[] = $microdata;
		}
	}

	// WooCommerce Products
	function schema_markup_wc_product() {
		// Product
		if ( ! is_singular( 'product' ) && ! post_password_required() ) {
			global $post, $product;

			if ( ! isset( $product, $post ) ) {
				return;
			}

			$post_title = $product->get_title();
			$excerpt    = $post->post_excerpt;
			$price      = $product->get_price();
			$currency   = apply_filters( 'woocommerce_currency', get_option( 'woocommerce_currency' ) );
			$sku         = $product->get_sku();
			$brand       = '';
			$price_valid_until = ( $date = get_post_meta( $post->ID, '_sale_price_dates_to', true ) ) ? date_i18n( 'Y-m-d', $date ) : '';
			// Output only for product loops, not single product.
			// Single product metadata added by WooCommerce.
			$microdata = array(
				'@context' => 'https://schema.org',
				'@type' => 'Product',
				'name' => $post_title,
				'description' => $excerpt,
				'sku' => $sku,
				'brand' => $brand,
				'offers' => array(
					'@type' => 'Offer',
					'price' => $price,
					'priceCurrency' => $currency,
					'priceValidUntil' => $price_valid_until,
					'availability' => "https://schema.org/InStock",
					'url' => get_permalink( $product->get_id() )
				)
			);
			if ( $product->get_review_count() && ('yes' === get_option( 'woocommerce_enable_reviews', 'yes' )) ) {
				$microdata['aggregateRating'] = array(
					'@type'       => 'AggregateRating',
					'ratingValue' => $product->get_average_rating(),
					'reviewCount' => $product->get_review_count(),
				);
			}
			if ( has_post_thumbnail() ) {
				$post_image = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ),  'large' );
				$microdata['image'] = array(
					'@type' => 'ImageObject',
					'url' => $post_image[0],
					'width' => $post_image[1],
					'height' => $post_image[2]
				);
			}
			$this->output[] = $microdata;
		}
	}

	// Output Schema.org JSON-LD
	function display_schema_markup() {
		$this->output = apply_filters( 'themify_microdata', $this->output );
		if ( ! empty( $this->output ) ) {
			echo '<!-- SCHEMA BEGIN --><script type="application/ld+json">';
			echo json_encode( $this->output );
			echo '</script><!-- /SCHEMA END -->';
			$this->output = array();
		}
	}

	/**
	 * Adds itemprop='image' microdata to avatar called by author box
	 * @param string $avatar The original markup for avatar
	 * @return string Modified markup with microdata
	 */
	function authorbox_microdata( $avatar ) {
		return str_replace( "class='avatar", "itemprop='image' class='avatar", $avatar );
	}

	function custom_user_meta_fields( $fields ) {
		Themify_Metabox::get_instance()->admin_enqueue_scripts();
		Themify_Metabox::get_instance()->enqueue();
		$fields['themify-microdata'] = array(
			'title' => __( 'Organization', 'themify' ),
			'description' => sprintf( __( 'These fields are required to fully comply with <a href="%s">Rich Snippets</a> standards.', 'themify' ), 'https://developers.google.com/structured-data/rich-snippets/articles' ),
			'fields' => array(
				array(
					'name' => 'user_meta_org_name',
					'title' => __( 'Organization Name', 'themify' ),
					'type' => 'textbox',
				),
				array(
					'name' => 'user_meta_org_logo',
					'title' => __( 'Organization Logo', 'themify' ),
					'description' => __( 'Organizaition Logo should be no wider than 600px, and no taller than 60px.', 'themify' ),
					'type' => 'image',
					'meta' => array()
				),
			),
		);

		return $fields;
	}

	function fetch_video_meta( $video_url ) {
		$cache_key = 'themify_video_meta_' . md5( $video_url );
		if ( false === ( $meta = get_transient( $cache_key ) ) ) {
			if ( preg_match( '%(?:youtube(?:-nocookie)?\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)([^"&?/ ]{11})%i', $video_url, $match ) ) {
				$request = wp_remote_get( "https://www.youtube.com/oembed?url=". urlencode( $video_url ) ."&format=json" );
			} elseif ( false !== stripos( $video_url, 'vimeo' ) ) {
				$request = wp_remote_get( 'https://vimeo.com/api/oembed.json?url='.urlencode( $video_url ) );
			} elseif( false !== stripos( $video_url, 'funnyordie' ) ) {
				$request = wp_remote_get( 'https://www.funnyordie.com/oembed.json?url='.urlencode( $video_url ) );
			} elseif( false !== stripos( $video_url, 'dailymotion' ) ) {
				$video_id = parse_url( $video_url, PHP_URL_PATH );
				$request = wp_remote_get( 'https://api.dailymotion.com/' . str_replace( '/embed/', '', $video_id ) . '?fields=thumbnail_large_url', array( 'sslverify' => false ) );
			} elseif( false !== stripos( $video_url, 'blip' ) ) {
				$request = wp_remote_get( 'https://blip.tv/oembed?url=' . $video_url, array( 'sslverify' => false ) );
			}

			if ( isset( $request ) && ! is_wp_error( $request ) ) {
				$response_body = wp_remote_retrieve_body( $request );
				if ( '' != $response_body ) {
					$meta = json_decode( $response_body );
					set_transient( $cache_key, $meta, YEAR_IN_SECONDS );
					return $meta;
				}
			}
		} else {
			return $meta;
		}

		return false;
	}
}
endif;
$GLOBALS['themify_microdata'] = new Themify_Microdata;

/**
 * Deprecated functions
 * Keep these for backward compatibility
 */
if ( ! function_exists( 'themify_display_publisher_microdata' ) ) {
	function themify_display_publisher_microdata() {}
}

if ( ! function_exists( 'themify_display_date_microdata' ) ) {
	function themify_display_date_microdata() {}
}

if ( ! function_exists( 'themify_schema_markup' ) ) {
	function themify_schema_markup( $args ) {}
}

if ( ! function_exists( 'themify_get_html_schema' ) ) {
	function themify_get_html_schema() {}
}
