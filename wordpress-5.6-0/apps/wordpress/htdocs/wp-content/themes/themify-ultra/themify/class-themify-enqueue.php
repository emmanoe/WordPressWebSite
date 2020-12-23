<?php

class Themify_Enqueue_Assets {
	
    private static $wc_data=array();
    private static $css = array();
    private static $mobileMenuCss=array();
    private static $done=array();
    private static $localiztion=array();
    private static $concateFile = null;
    private static $googleFonts=array();
    public static  $disableGoogleFontsLoad=null;
    private static $preLoadJs = array();
    private static $preLoadCss = array();
    public static $isInTop = true;
    public static $isHeader = false;
    public static $isFooter = false;
    private static $prefetchJs = array();
    private static $prefetchCss = array();
    public static $preLoadMedia = array();
    private static $guttenbergCss=array();
    public static $mediaMaxWidth=1200;
    public static $mobileMenuActive=1200;
    public static $SWIPER_VERSION='5.3.6';
    public static $ANIMATION_VERSION='3.6.2';
    public static $IMAGELOAD_VERSION='4.1.4';
    private static $concateDir='/themify-css/concate/';
    public static $THEMIFY_CSS_MODULES_URI;
    public static $THEME_CSS_MODULES_URI=null;
    public static $THEME_CSS_MODULES_DIR=null;
    public static $THEME_WC_CSS_MODULES_DIR=null;
    public static $THEME_WC_CSS_MODULES_URI=null;
    public static $themeVersion=null;
	public static $isContent=true;
	
	
    public static function init() {
		self::$THEMIFY_CSS_MODULES_URI=THEMIFY_URI . '/css/modules/';
		if (themify_is_themify_theme()) {
			self::$isContent=false;
			self::$THEME_CSS_MODULES_DIR=THEME_DIR.'/styles/modules/';
			self::$THEME_CSS_MODULES_URI=THEME_URI.'/styles/modules/';
			
			self::$THEME_WC_CSS_MODULES_DIR=THEME_DIR.'/styles/wc/modules/';
			self::$THEME_WC_CSS_MODULES_URI=THEME_URI.'/styles/wc/modules/';
			
			self::$mobileMenuActive=(int)themify_get('setting-mobile_menu_trigger_point', 1200, true);
			self::$themeVersion = wp_get_theme( get_template() )->display( 'Version' );
		}
		if ( ! is_admin()) {
			add_action('wp',array(__CLASS__,'lazy_init'),1);
		}
		else{
			add_action('wp_loaded',array(__CLASS__,'lazy_init'),1);
		    add_action('admin_init', array(__CLASS__, 'loadMainScript')); 
		    add_action('admin_footer', array(__CLASS__, 'js_localize'), 18);
		}
		add_filter('themify_loops_wrapper_class',array(__CLASS__,'load_loop_css'),100,6);
		add_filter('kses_allowed_protocols',array(__CLASS__,'allow_lazy_protocols'),100,1);
		if (!is_admin() || themify_is_ajax()) {
			add_filter('post_playlist',array(__CLASS__,'wp_media_playlist'),100,3);
		}
    }
    
    private static function createDir(){
		if(self::$concateFile===null){
			$upload_dir = themify_upload_dir();
			self::$concateFile = rtrim($upload_dir['basedir'],'/').self::$concateDir;
			if (!is_dir (self::$concateFile)) {
				wp_mkdir_p(self::$concateFile);
				if (!is_dir (self::$concateFile)) {
					clearstatcache();
					wp_mkdir_p(self::$concateFile);
					if (!is_dir (self::$concateFile)) {
						self::$concateFile = null;
						return false;
					}
				}
			}
		}
		return true;
    }

    public static function remove_default_js($scripts) {
		$ver = $scripts->registered['jquery']->ver;
		$scripts->remove('jquery');
		$scripts->add('jquery', false, array('jquery-core'), $ver);
		return $scripts;
    }

    public static function before_enqueue() {
		self::add_css('tf_base', THEMIFY_URI . '/css/base.min.css', null, THEMIFY_VERSION);
		if (self::$themeVersion!==null) {
			self::add_css('themify_common', THEMIFY_URI . '/css/themify.common.css', null, THEMIFY_VERSION);
		}
		self::loadMainScript();
    }

    public static function after_enqueue() {
		global $wp_styles,$wp_version;
		$css = array('wp-block-library');
		$is_theme=self::$themeVersion!==null;
		if (themify_is_woocommerce_active()) {
			$wc_ver=WC()->version;
			self::$localiztion['wc_version']=$wc_ver;
			if($is_theme===true && (themify_is_shop() || is_product() || (!is_checkout() && !is_cart() && !is_account_page() && !is_checkout_pay_page() && !is_edit_account_page() && !is_order_received_page() && !is_add_payment_method_page()))){
				wp_enqueue_script( 'wc-add-to-cart-variation' );//load tmpl files
				wp_enqueue_script( 'wc-single-product' );
				wp_enqueue_script('jquery-blockui');
				WC_Frontend_Scripts::localize_printed_scripts();
				global $wp_scripts;
                $js=apply_filters('themify_wc_js',array('js-cookie','wc-add-to-cart','wc-add-to-cart-variation','wc-cart-fragments','woocommerce','wc_additional_variation_images_script','wc-single-product'));
				$arr=array();
				foreach ($js as $v) {
					if (isset($wp_scripts->registered[$v]) && wp_script_is($v)) {
						if($v==='wc-single-product' && is_product()){
							continue;
						}
						$wp_scripts->done[]=$v;
						if(!empty($wp_scripts->registered[$v]->extra['data'])){
							self::$wc_data[]=$wp_scripts->registered[$v]->extra['data'];
						}
						$arr[$v]=$wp_scripts->registered[$v]->src;
						if($wc_ver!==$wp_scripts->registered[$v]->ver){
							$arr[$v].='?ver='.$wp_scripts->registered[$v]->ver;
						}
					}
				}
				self::$localiztion['wc_js']=$arr;
				// Localize photoswipe css
				if(!empty($wp_styles->registered['photoswipe']->src)){
					wp_dequeue_style( 'photoswipe');
					wp_dequeue_style( 'photoswipe-default-skin');
				    self::$localiztion['photoswipe']=array('main'=>$wp_styles->registered['photoswipe']->src,'skin'=>$wp_styles->registered['photoswipe-default-skin']->src);
				}
				$js=$arr=null;
			}
			$css[] = 'wc-block-style';
			$css[] = 'woocommerce-layout';
			$css[] = 'woocommerce-smallscreen';
			$css[] = 'woocommerce-general';
			$css[] = 'select2';
			$css[] = 'woocommerce_prettyPhoto_css';
		}
		foreach ($css as $v) {
			if (isset($wp_styles->registered[$v]) && wp_style_is($v)) {
				$wp_styles->done[]=$v;
				$src = $wp_styles->registered[$v]->src;
				if($v==='wp-block-library' || $v==='wc-block-style'){
					wp_dequeue_style( $v ); 
					self::$guttenbergCss[$v]=$src;
					continue;
				}
				$ver = $wp_styles->registered[$v]->ver;
				if (strpos($src, 'http') === false) {
					$src = home_url($src);
				}
				if (empty($ver)) {
					$ver = $wp_version;
				}
				wp_dequeue_style($v);
				self::add_css($v, $src, $wp_styles->registered[$v]->deps, $ver, $wp_styles->registered[$v]->args);
			}
		}
		$css = null;
		if ($is_theme===true) {
		    if(is_file(THEME_DIR.'/mobile-menu.css')){
			    self::addMobileMenuCss('mobile-menu',THEME_URI.'/mobile-menu.css');
		    }
		    if(function_exists('themify_theme_enqueue_header')){
				themify_theme_enqueue_header();
		    }
		    if(self::$mediaMaxWidth!==false){
				self::add_css( 'themify-media-queries', THEME_URI . '/media-queries.css', null, self::$themeVersion,'screen and (max-width:'.self::$mediaMaxWidth.'px)');
		    }
		}
    }

    public static function add_css($handle, $src, $deps, $ver, $media=false, $in_footer = false) {
		if (!isset(self::$css[$handle],self::$done[$src])) {
			self::$done[$src]=true;
			$src = themify_enque($src,false,false);
			if (!$media) {
				$media = 'all';
			}
			if(is_admin()){
				self::$css[$handle] = array('s' => $src, 'v' => $ver);
				if($media!=='all'){
				    self::$css[$handle]['m']=$media;
				}
				wp_enqueue_style($handle, themify_enque($src), $deps, $ver, $media);
				return;
			}
			$load = true;
			if ($in_footer !== true && self::$isFooter === false && self::$concateFile !== null) {
				if (Themify_Filesystem::get_file_content($src, true)) {
					self::$css[$handle] = array('s' => $src, 'v' => $ver);
					if ($media !== 'all') {
						self::$css[$handle]['m'] = $media;
					}
					$load = false;
				}
			}
			elseif ($in_footer === true) {
				self::$css[$handle] = 'footer';
			}	
			if ($load === true) {
				if(strpos($handle,'http')!==false){
					$handle=md5($handle);
				}
				wp_enqueue_style($handle, themify_enque($src), $deps, $ver, $media);
			}
		}
	}

	/**
	 * Deregister an stylesheet
	 *
	 * @param string $handle
	 */
	public static function remove_css( $handle ) {
		unset( self::$css[ $handle ] );
	}

    public static function header_meta(){
	?>
	    <meta charset="<?php echo get_bloginfo('charset') ?>">
	    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php
    }
    public static function wp_head() {
		
	if (themify_is_lazyloading() === true) {
		$blur=(int)themify_get('setting-lazy-blur',25,true );
	    ?>
	    <style id="tf_lazy_style">
		[data-tf-src]{opacity:0}.tf_svg_lazy{transition:filter .3s linear!important;<?php if($blur>0):?>filter:blur(<?php echo $blur?>px);<?php endif;?>opacity:1;transform:translateZ(0)}.tf_svg_lazy_loaded{filter:blur(0)}.module[data-lazy],.module[data-lazy] .ui,.module_row[data-lazy]:not(.tb_first),.module_row[data-lazy]:not(.tb_first)>.row_inner,.module_row:not(.tb_first) .module_column[data-lazy],.module_subrow[data-lazy]>.subrow_inner{background-image:none!important}
	    </style>
	    <noscript><style>[data-tf-src]{display:none!important}.tf_svg_lazy{filter:none!important;opacity:1!important}</style></noscript>
	    <?php
	}
	?>
	    <style id="tf_lazy_common">
			<?php if (self::$themeVersion!==null): ?>
				/*chrome bug,prevent run transition on the page loading*/
				body:not(.page-loaded),body:not(.page-loaded) #header,body:not(.page-loaded) a,body:not(.page-loaded) img,body:not(.page-loaded) figure,body:not(.page-loaded) div,body:not(.page-loaded) i,body:not(.page-loaded) li,body:not(.page-loaded) span,body:not(.page-loaded) ul{animation:none!important;transition:none!important}body:not(.page-loaded) #main-nav li .sub-menu{display:none}
				img{max-width:100%;height:auto}
			<?php endif;?>
			.tf_fa{display:inline-block;width:1em;height:1em;stroke-width:0;stroke:currentColor;overflow:visible;fill:currentColor;pointer-events:none;vertical-align:middle}#tf_svg symbol{overflow:visible}.tf_lazy{position:relative;visibility:visible;contain:paint;display:block;opacity:.3}.wow .tf_lazy{visibility:hidden;opacity:1;position:static;display:inline}.tf_audio_lazy audio{visibility:hidden;height:0}.mejs-container{visibility:visible}.tf_iframe_lazy{transition:opacity .3s ease-in-out;min-height:10px}.tf_carousel .swiper-wrapper{display:flex}.tf_carousel .swiper-slide{flex-shrink:0;opacity:0}.tf_carousel .tf_lazy{contain:none}.swiper-wrapper>br,.tf_lazy.swiper-wrapper .tf_lazy:after,.tf_lazy.swiper-wrapper .tf_lazy:before{display:none}.tf_lazy:after,.tf_lazy:before{content:'';display:inline-block;position:absolute;width:10px!important;height:10px!important;margin:0 3px;top:50%!important;right:50%!important;left:auto!important;border-radius:100%;background-color:currentColor;visibility:visible;animation:tf-hrz-loader infinite .75s cubic-bezier(.2,.68,.18,1.08)}.tf_lazy:after{width:6px!important;height:6px!important;right:auto!important;left:50%!important;margin-top:3px;animation-delay:-.4s}@keyframes tf-hrz-loader{0%{transform:scale(1);opacity:1}50%{transform:scale(.1);opacity:.6}100%{transform:scale(1);opacity:1}}.tf_lazy_lightbox{position:fixed;background:rgba(11,11,11,.8);color:#ccc;top:0;left:0;display:flex;align-items:center;justify-content:center;z-index:999}.tf_lazy_lightbox .tf_lazy:after,.tf_lazy_lightbox .tf_lazy:before{background:#fff}
		</style>
	<?php if (self::$themeVersion!==null): ?>
		<noscript><style>body:not(.page-loaded) #main-nav li .sub-menu{display:block}</style></noscript>
    <?php
		themify_favicon_action();
	endif;
	if (!( defined('THEMIFY_GOOGLE_FONTS') && !THEMIFY_GOOGLE_FONTS )):
	    ?>
	    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
	<?php endif; ?>
	<link rel="dns-prefetch" href="//www.google-analytics.com"/>
	<?php
	self::$isHeader = true;
	if (self::$isInTop===false) {
	    global $wp_styles;
	    $wp_styles->done=array();
	}
	if(self::$concateFile===null){
	    self::createDir();
	}
	if (self::$concateFile !== null) {
	    ob_start();
	}
    }

	/**
	 * Outputs Header Code
	 *
	 * Hooked to "wp_head"[10], load after other scripts in the header
	 */
	public static function header_html() {
		if ( self::$themeVersion !== null ) {
			echo themify_get( 'setting-header_html', '', true );
		}
	}

    public static function style_header_tag($tag, $handle, $href, $media) {
		if ('themify-framework' === $handle) {
			unset(self::$css[$handle]);
			$tag = '<meta name="' . $handle . '-css" data-href="' . $href . '" content="' . $handle . '-css" id="' . $handle . '-css" />';
		}
		else{
			if(self::$isInTop===false && self::$isHeader===false){
				return '';
			}
			$src=strtok($href, '?');
			unset(self::$prefetchCss[$src],self::$preLoadCss[$src]);
			$preload = '<link rel="preload" href="'.$href.'" as="style"';
			if($media!=='all' && $media){
				$preload.=' media="'.$media.'"';
			}
			$preload.=' />'.$tag;
			$tag=$preload;
		}
		return $tag;
    }

    /**
     * Set a default title for the front page
     *
     * @return string
     * @since 1.7.6
     */
    public static function wp_title($title, $sep) {
		if (empty($title) && ( is_home() || is_front_page() )) {
			global $aioseop_options;
			return  !empty($aioseop_options) && class_exists('All_in_One_SEO_Pack')?$aioseop_options['aiosp_home_title']:get_bloginfo('name');
		}
		return str_replace($sep, '', $title);
    }
    public static function js_localize(){
		$isActive=class_exists('Themify_Builder') ? Themify_Builder_Model::is_front_builder_activate() === true: false;
	    if(self::$themeVersion!==null && !is_admin()){
			self::add_css( 'theme-style',  THEME_URI . '/style.css' , null, self::$themeVersion );
			if( themify_is_woocommerce_active()) {
				remove_action( 'wp_footer', 'wc_no_js' );
				if(is_file(THEME_DIR. '/styles/wc/woocommerce.css')){
					self::add_css( 'tf_theme_wc', THEME_URI . '/styles/wc/woocommerce.css', null, self::$themeVersion );
					if(is_product()){
						self::loadThemeWCStyleModule( 'single/product' );
					}
					elseif(is_account_page()){
							if(is_user_logged_in()){
							self::loadThemeWCStyleModule('pages/account');
							}
							else{
							self::loadThemeWCStyleModule('pages/register');
							}
					}
					elseif(is_checkout()){
						self::loadThemeWCStyleModule('pages/checkout');
					}
					elseif(is_cart()){
						self::loadThemeWCStyleModule('pages/cart');
					}
				}
			}
			if(function_exists('themify_theme_enqueue_footer')){
				themify_theme_enqueue_footer();
			}
			if(is_rtl() && is_file(THEME_DIR. '/rtl.css')){
			   self::add_css( 'theme-style-rtl',  THEME_URI . '/rtl.css' , null, self::$themeVersion);
			}
			themify_enqueue_framework_assets();
			// Themify child base styling
			if( is_child_theme() ) {
				self::add_css( 'theme-style-child',get_stylesheet_uri() , null, self::$themeVersion );
			}
			// User stylesheet
			if (is_file(get_template_directory() . '/custom_style.css')) {
				themify_enque_style('custom-style', THEME_URI . '/custom_style.css', null, THEMIFY_VERSION);
			}
			
			if(is_admin_bar_showing() && is_file(self::$THEME_CSS_MODULES_DIR.'admin-bar.css')){
				self::loadThemeStyleModule('admin-bar',false,true);
			}
			if($isActive===true && is_file(self::$THEME_CSS_MODULES_DIR.'builderActive.css') ){
				self::loadThemeStyleModule('builderActive',false,true);
			}
	    }
	    wp_localize_script( 'themify-main-script', 'themify_vars',apply_filters('themify_main_script_vars',self::$localiztion) );
	    if($isActive===false && !is_admin()){
			global $wp_scripts;
			?>
			<script type="text/template" id="tf_vars">
				<?php echo $wp_scripts->registered['themify-main-script']->extra['data'];?>
			</script>
			<script nomodule defer src="<?php echo themify_enque(THEMIFY_URI.'/js/modules/fallback.js')?>"></script>
			<?php
			 $wp_scripts->registered['themify-main-script']->extra['data']=null;
	    }
	    else{
		self::loadIcons();
	    }
	    self::$localiztion=null;
    }
	
    public static function wp_footer() {
	    do_action('tf_load_styles');

		if (self::$concateFile !== null) {
			global $wp_version;
			$key = '';
			$is_minify= themify_is_minify_enabled();
			$exist=false;
			$medias = array();
			foreach (self::$css as $k => $v) {
				if ($v !== true && $v!=='footer') {
					if (!isset($v['m'])) {
					$key.=$k . $v['v'];
					} else {
					$medias[$k] = self::$css[$k];
					unset(self::$css[$k]);
					}
				}
			}
			$object=wp_get_theme();
			$output = '';
			if ($key !== '') {
				$key.=THEMIFY_VERSION . $wp_version.$object->get('Name');
				$key.=self::$themeVersion!==null?self::$themeVersion:$object->get('Version');
				if(themify_is_woocommerce_active()){
					$key.=WC()->version;
				}
				$key = md5($key);
				if($is_minify===true){
					$key.='.min';
				}
				self::$concateFile.='themify-concate-' . $key . '.css';
				self::$concateFile=apply_filters('themify_concate_css',self::$concateFile,'main');

				if (!is_file(self::$concateFile)) {
					$home_url=home_url();
					$str =  '@charset "UTF-8";';
					$replace=array(THEMIFY_URI,$home_url);
					if(self::$themeVersion!==null){
						$replace[]=THEME_URI;
					}
					foreach (self::$css as $k => $v) {
						if ($v !== true && $v!=='footer') {
							$content = $key !== '' ? Themify_Filesystem::get_file_content($v['s']) : null;
							if (!empty($content)) {
								$dir = dirname($v['s']);
								$content = PHP_EOL . '/*' . str_replace($replace,'',$v['s']) . '*/' . PHP_EOL.$content;
								if($k==='tf_megamenu'){
									$content=PHP_EOL.'@media screen and (min-width:'.(self::$mobileMenuActive+1).'px){'.$content.'}';
								}
								else{
									$content=str_replace(array('@charset "UTF-8";','..',"url('fonts/","url('images/"), array('',dirname($dir),"url('{$dir}/fonts/","url('{$dir}/images/"), $content);
									if($k==='woocommerce-general'){
										$content = str_replace('@font-face{','@font-face{font-display:swap;',$content);
									}
								}
								$str.=$content;
							}
							else{
								$key =$str= '';
							}
							if(isset(self::$preLoadCss[$k])){
								unset(self::$preLoadCss[$k]);
							}
							$output.='<link rel="preload" href="' . $v['s'] . '?ver=' . $v['v'] . '" as="style">' . "\n" . '<link id="' . $k . '-css" rel="stylesheet" href="' . $v['s'] . '?ver=' . $v['v'] . '">'. "\n";
						}
					}
					if($key !== ''){
						clearstatcache();
						if ( empty( self::$concateFile ) || ( !is_file(self::$concateFile) && !file_put_contents(self::$concateFile,$str, LOCK_EX) ) ) {//maybe another proccess has already created it?
						$key='';
						}
					}
					$str=null;
				}
			}
			$upload_dir = themify_upload_dir();
			if ($key !== '') {
			$href=str_replace($upload_dir['basedir'], $upload_dir['baseurl'], self::$concateFile);
			$path = '<link rel="preload" href="' . $href. '" as="style"><link id="themify_concate-css" rel="stylesheet" href="' . $href. '">';
			} else {
			$path = $output;
			}
			$output='';
			$mobileDir=self::$concateFile!==null && self::$themeVersion!==null?rtrim(dirname(self::$concateFile),'/').'/':null;

			self::$concateFile = null;
			if($mobileDir!==null){
				$key='';
				foreach (self::$mobileMenuCss as $k => $v) {
					$key.=$k;
				}
				if($key!==''){
					$key.=THEMIFY_VERSION . $wp_version.$object->get('Name');
					$key.=self::$themeVersion;
					if(themify_is_woocommerce_active()){
						$key.=WC()->version;
					}
					$object=null;
					$key = md5($key);
					if($is_minify===true){
						$key.='.min';
					}
					$mobileDir.='themify-mobile-'.$key.'.css';
					$media='screen and (max-width:'.self::$mobileMenuActive.'px)';
					$mobileDir=apply_filters('themify_concate_css',$mobileDir,'mobile');
					if (!is_file($mobileDir)) {
						$str='';
						foreach (self::$mobileMenuCss as $k => $v) {
							$content = $mobileDir !== null ? Themify_Filesystem::get_file_content($v) : null;
							if(!empty($content)){
							$str.=PHP_EOL . '/*' . $k . '*/' . PHP_EOL.trim($content);
							}
							else{
							$str=$mobileDir=null;
							}
							$output.='<link rel="preload" href="' . $v . '?ver=' . self::$themeVersion . '" media="' . $media . '" as="style"><link id="tf-mobile-' . $k . '-css" rel="stylesheet" href="' . $v . '?ver=' . self::$themeVersion . '" media="' . $media . '">';
						}
						self::$mobileMenuCss=null;
						if($mobileDir!==null){
						clearstatcache();
						if ( empty( self::$concateFile ) || ( !is_file(self::$concateFile) && !file_put_contents($mobileDir, $str, LOCK_EX ) ) ) {//maybe another proccess has already created it?
							$mobileDir=null;
						}
						}
						$str=null;
					} 
					if($mobileDir===null){
					$path.=$output;
					}
					else{
					$mobileDir=str_replace($upload_dir['basedir'], $upload_dir['baseurl'], $mobileDir);
					$path.= '<link rel="preload" href="' . $mobileDir. '" as="style" media="' . $media . '"><link id="themify_mobile_concate-css" rel="stylesheet" href="' . $mobileDir. '" media="' . $media . '">';
					}
					$output=$mobileDir=$key=null;
				}
			}
			foreach ($medias as $k => $v) {
				$path.='<link rel="preload" href="' . $v['s'] . '?ver=' . $v['v'] . '" media="' . $v['m']. '" as="style"><link id="' . $k . '-css" rel="stylesheet" href="' . $v['s'] . '?ver=' . $v['v'] . '" media="' .$v['m'] . '">';
			}
			$medias = null;
			$content=themify_make_lazy(ob_get_clean());
			if(isset(self::$css['woocommerce-general']) && strpos($content,'star-rating')!==false){
				self::addPreLoadMedia(dirname(dirname(self::$css['woocommerce-general']['s'])).'/fonts/star.woff','preload','font');
			}
            if (self::$themeVersion!==null && $custom_css = themify_get('setting-custom_css',false,true)){
              echo '<!-- custom css : start --><style>'.$custom_css.'</style><!-- custom css : end -->';
            }
			if(self::$isInTop===true){
				echo $path;
			} 
			echo $content,self::loadIcons(false);
			$content=null;
			if(self::$isInTop===false){
				echo $path;
			}
			$path=null;
		}
		else{
			self::loadIcons();
		}
		self::$isFooter = true;
		self::addPrefetchJs(THEMIFY_URI.'/js/modules/jquery.imagesloaded.min.js', self::$IMAGELOAD_VERSION);
		if (!empty(self::$preLoadCss)) {
			foreach (self::$preLoadCss as $src => $arr) {
			if ($arr['v'] !== null) {
				$src = $src . '?ver=' . $arr['v'];
			}
			?>
			<link rel="preload" href="<?php echo $src ?>" as="style" media="<?php echo $arr['m'] ?>"/> 
			<?php
			}
		}
		if (!empty(self::$preLoadJs)) {
			foreach (self::$preLoadJs as $src => $v) {
			?>
			<link rel="preload" href="<?php echo $src ?><?php if($v):?>?ver=<?php echo $v ?><?php endif;?>" as="script"/> 
			<?php
			}
		}
		foreach (self::$prefetchCss as $src => $arr) {
			if (!isset(self::$preLoadCss[$src]) &&!isset(self::$css[$src])) {
			if ($arr['v'] !== null) {
				$src = $src . '?ver=' . $arr['v'];
			}
			?>
			<link rel="prefetch" href="<?php echo $src ?>" as="style" media="<?php echo $arr['m'] ?>"/> 
			<?php
			}
		}
		foreach (self::$prefetchJs as $src => $v) {
			if (!isset(self::$preLoadJs[$src])) {
			?>
			<link rel="prefetch" href="<?php echo $src ?><?php if($v):?>?ver=<?php echo $v ?><?php endif;?>" as="script"/> 
			<?php
			}
		}
		foreach (self::$preLoadMedia as $src => $arr) {
			?>
			<link rel="<?php echo $arr['r'] ?>" href="<?php echo $src ?>" as="<?php echo $arr['t'] ?>"<?php if($arr['t']==='font'):?> type="font/<?php echo strtok(pathinfo($src,PATHINFO_EXTENSION),'?')?>" crossorigin <?php endif;?>/> 
			<?php
		}
		self::$prefetchJs = self::$prefetchCss = self::$css =self::$preLoadJs = self::$preLoadCss = self::$preLoadMedia = null;
		if (self::$themeVersion!==null) {
			echo "\n\n", themify_get('setting-footer_html','',true);
		}
		if(self::$disableGoogleFontsLoad===null){
			echo self::loadGoogleFonts(true);
		}
		if(!empty(self::$wc_data)):?>
			<script>
				<?php foreach(self::$wc_data as $v){
					echo $v;
				}
			?>
			</script>
		<?php endif;
		self::$wc_data=null;
    }
    
    
	public static function loadIcons($echo=true){

		$fonts=Themify_Icon_Font::get_used_icons();
		$svg='<svg id="tf_svg" style="display:none"><defs>';
		if(!empty($fonts)){
				$st='';
				foreach($fonts as $k=>$v){
					$w=isset($v['vw'])?$v['vw']:'32';
					$h=isset($v['vh'])?$v['vh']:'32';
					$p=isset($v['is_fontello'])?' transform="matrix(1 0 0 -1 0 '.$h.')"':'';
					$svg.= '<symbol id="tf-'.$k.'" viewBox="0 0 '.$w.' '.$h.'"><path d="'.$v['p'].'"'.$p.'></path></symbol>';
					if(isset($v['w'])){
						$st.='.tf_fa.tf-'.$k.'{width:'.$v['w'].'em}';
					}
				}
				if($st!==''){
				$svg.='<style id="tf_fonts_style">'.$st.'</style>';
				$st=null;
				}
		}
		$svg.='</defs></svg>';
		$fonts=null;
		if($echo===false){
			return $svg;
		}
		echo $svg;
    }

    private static function get_webp_support() {
	return PHP_EOL . '#BEGIN_WEBP_OUTPUT_BY_THEMIFY
		<IfModule mod_rewrite.c>
			RewriteEngine On
			# serves a .webp image instead of jpg/png
			RewriteCond %{HTTP_ACCEPT} image/webp
			RewriteCond %{REQUEST_FILENAME} ^(.+)\.(jpe?g|jpg|png)$
			RewriteCond %1\.webp -f
			RewriteRule ^(.+)\.(jpe?g|jpg|png)$ $1.webp [T=image/webp,E=accept:1]
		</IfModule>
		<IfModule mod_headers.c>
		  Header append Vary Accept env=REQUEST_image
		</IfModule>
		<IfModule mod_mime.c>
		  AddType image/webp .webp
		</IfModule>
		#END_WEBP_OUTPUT_BY_THEMIFY
		' . PHP_EOL;
    }

    private static function get_gzip_htaccess() {
	return PHP_EOL . '#BEGIN_GZIP_OUTPUT_BY_THEMIFY
	    <IfModule mod_rewrite.c>
		    <Files *.js.gz>
			AddType "text/javascript" .gz
			AddEncoding gzip .gz
		    </Files>
		    <Files *.css.gz>
			AddType "text/css" .gz
			AddEncoding gzip .gz
		    </Files>
		    <Files *.svg.gz>
			AddType "image/svg+xml" .gz
			AddEncoding gzip .gz
		    </Files>
		    <Files *.json.gz>
			AddType "application/json" .gz
			AddEncoding gzip .gz
		    </Files>
		    # Serve pre-compressed gzip assets
		    RewriteCond %{HTTP:Accept-Encoding} gzip
		    RewriteCond %{REQUEST_FILENAME}.gz -f
		    RewriteRule ^(.*)$ $1.gz [QSA,L]
	    </IfModule>
	    #END_GZIP_OUTPUT_BY_THEMIFY
	    ' . PHP_EOL;
    }

    private static function get_mod_rewrite() {

	return PHP_EOL . '#BEGIN_GZIP_COMPRESSION_BY_THEMIFY
                <IfModule mod_deflate.c>
		    #add content typing
		    AddType application/x-gzip .gz .tgz
		    AddEncoding x-gzip .gz .tgz
		    # Insert filters
		    AddOutputFilterByType DEFLATE text/plain
		    AddOutputFilterByType DEFLATE text/html
		    AddOutputFilterByType DEFLATE text/xml
		    AddOutputFilterByType DEFLATE text/css
		    AddOutputFilterByType DEFLATE application/xml
		    AddOutputFilterByType DEFLATE application/xhtml+xml
		    AddOutputFilterByType DEFLATE application/rss+xml
		    AddOutputFilterByType DEFLATE application/javascript
		    AddOutputFilterByType DEFLATE application/x-javascript
		    AddOutputFilterByType DEFLATE application/x-httpd-php
		    AddOutputFilterByType DEFLATE application/x-httpd-fastphp
		    AddOutputFilterByType DEFLATE image/svg+xml
		    AddOutputFilterByType DEFLATE image/svg
		    # Drop problematic browsers
		    BrowserMatch ^Mozilla/4 gzip-only-text/html
		    BrowserMatch ^Mozilla/4\.0[678] no-gzip
		    BrowserMatch \bMSI[E] !no-gzip !gzip-only-text/html
		    <IfModule mod_headers.c>
			    # Make sure proxies don\'t deliver the wrong content
			    Header append Vary User-Agent env=!dont-vary
		    </IfModule>
		</IfModule>
                # END GZIP COMPRESSION
		## EXPIRES CACHING ##
		<IfModule mod_expires.c>
			ExpiresActive On
			ExpiresByType image/jpg "access plus 4 months"
			ExpiresByType image/jpeg "access plus 4 months"
			ExpiresByType image/gif "access plus 4 months"
			ExpiresByType image/png "access plus 4 months"
			ExpiresByType image/webp "access plus 4 months"
			ExpiresByType image/apng "access plus 4 months"
			ExpiresByType image/svg+xml "access plus 4 months"
			ExpiresByType image/svg "access plus 4 months"
			ExpiresByType text/css "access plus 4 months"
			ExpiresByType text/html "access plus 1 week"
			ExpiresByType text/plain "access plus 1 week"
			ExpiresByType text/x-component "access plus 4 months"
			ExpiresByType text/javascript "access plus 4 months"
			ExpiresByType text/x-javascript "access plus 4 months"
			ExpiresByType application/pdf "access plus 4 months"
			ExpiresByType application/javascript "access plus 4 months"
			ExpiresByType application/x-javascript "access plus 4 months"
			ExpiresByType application/x-shockwave-flash "access plus 4 months"
			ExpiresByType image/x-icon "access plus 1 year"
			ExpiresByType application/json "access plus 1 week"
			ExpiresByType application/ld+json "access plus 1 week"
			ExpiresByType application/xml "access plus 0 seconds"
			ExpiresByType text/xml "access plus 0 seconds"
			ExpiresByType application/x-web-app-manifest+json "access plus 0 seconds"
			ExpiresByType text/cache-manifest "access plus 0 seconds"
			ExpiresByType audio/ogg "access plus 4 months"
			ExpiresByType video/mp4 "access plus 4 months"
			ExpiresByType video/ogg "access plus 4 months"
			ExpiresByType video/webm "access plus 4 months"
			ExpiresByType application/atom+xml "access plus 1 day"
			ExpiresByType application/rss+xml "access plus 1 day"
			ExpiresByType application/font-woff "access plus 6 months"
			ExpiresByType application/vnd.ms-fontobject "access plus 6 months"
			ExpiresByType application/x-font-ttf "access plus 6 months"
			ExpiresByType font/opentype "access plus 6 months"
			ExpiresByType font/woff "access plus 6 months"
			ExpiresByType font/woff2 "access plus 6 months"
			ExpiresByType application/font-woff2 "access plus 6 months"
		</IfModule>
		#Alternative caching using Apache`s "mod_headers", if it`s installed.
		#Caching of common files - ENABLED
		<IfModule mod_headers.c>
		    <FilesMatch "\.(jpg|jpeg|gif|png|svg|js|css|mp3|ogg|mpe?g|avi|zip|gz|rar|swf|woff|woff2|eot|ttf|pdf|mp4|doc|html|flv|ico|xml|txt|ogv|svgz|otf|rss|atom|tgz|xls|ppt|tar|mid|midi|wav|bmp|rtf)$">
			    Header set Cache-Control "max-age=10512000, public"
		    </FilesMatch>
		    # Set Keep Alive Header
		    Header set Connection keep-alive
		</IfModule>

		<IfModule mod_gzip.c>
		  mod_gzip_on Yes
		  mod_gzip_dechunk Yes
		  mod_gzip_item_include file \.(html?|txt|css|js|php|pl)$
		  mod_gzip_item_include handler ^cgi-script$
		  mod_gzip_item_include mime ^text/.*
		  mod_gzip_item_include mime ^application/x-javascript.*
		  mod_gzip_item_exclude mime ^image/.*
		  mod_gzip_item_exclude rspheader ^Content-Encoding:.*gzip.*
		</IfModule>

		# If your server don`t support ETags deactivate with "None" (and remove header)
		<IfModule mod_expires.c>
		  <IfModule mod_headers.c>
			Header unset ETag
		  </IfModule>
		  FileETag None
		</IfModule>
		## EXPIRES CACHING ##
		#END_GZIP_COMPRESSION_BY_THEMIFY' . PHP_EOL;
    }

    public static function rewrite_htaccess($gzip = false, $webp = false) {
		$htaccess_file = self::getHtaccessFile();
		if (is_file($htaccess_file) && Themify_Filesystem::is_writable($htaccess_file)) {
			if(themify_get_server()==='iis'){//for iis we need to add webp mimeType
				$iis_config=get_home_path().'web.config';
				if(is_file($iis_config) && Themify_Filesystem::is_writable($iis_config)){
					$rules = trim(Themify_Filesystem::get_contents($iis_config));
					if(!empty($rules) && strpos($rules,'mimeType="image/webp"')===false){
						$replace='<!--BEGIN_WEBP_OUTPUT_BY_THEMIFY-->
							<staticContent>
								<mimeMap fileExtension=".webp" mimeType="image/webp"/>
							</staticContent>
						<!--END_WEBP_OUTPUT_BY_THEMIFY-->
						<rewrite>';
						$rules=preg_replace('#\<rewrite\>#',$replace,$rules,1);
						unset($replace);
						Themify_Filesystem::put_contents($iis_config, trim($rules));
					}
				}
				unset($iis_config);
			}
			$rules = trim(Themify_Filesystem::get_contents($htaccess_file));
			$startOutputTag = '#BEGIN_GZIP_OUTPUT_BY_THEMIFY';
			$endOutputTag = '#END_GZIP_OUTPUT_BY_THEMIFY';

			$startGzipTag = '#BEGIN_GZIP_COMPRESSION_BY_THEMIFY';
			$endGzipTag = '#END_GZIP_COMPRESSION_BY_THEMIFY';

			$startWebTag = '#BEGIN_WEBP_OUTPUT_BY_THEMIFY';
			$endWebTag = '#END_WEBP_OUTPUT_BY_THEMIFY';
			$hasChange = false;


			if ($webp === false) {
			if (strpos($rules, $startWebTag) === false) {
				$rules = self::get_webp_support() . $rules;
				$hasChange = true;
			}
			} elseif (strpos($rules, $startWebTag) !== false) {
			$startsAt = strpos($rules, $startWebTag);
			$endsAt = strpos($rules, $endWebTag, $startsAt);
			$textToDelete = substr($rules, $startsAt, ($endsAt + strlen($endWebTag)) - $startsAt);
			$rules = str_replace($textToDelete, '', $rules);
			$hasChange = true;
			}
			if ($gzip === false) {
			if (strpos($rules, $startOutputTag) === false) {
				$rules = self::get_gzip_htaccess() . $rules;
				$hasChange = true;
			}
			if (strpos($rules, 'mod_deflate.c') === false && strpos($rules, 'mod_gzip.c') === false) {
				$rules.= self::get_mod_rewrite();
				$hasChange = true;
			}
			} else {
			if (strpos($rules, $startOutputTag) !== false) {
				$startsAt = strpos($rules, $startOutputTag);
				$endsAt = strpos($rules, $endOutputTag, $startsAt);
				$textToDelete = substr($rules, $startsAt, ($endsAt + strlen($endOutputTag)) - $startsAt);
				$rules = str_replace($textToDelete, '', $rules);
				$hasChange = true;
			}
			if (strpos($rules, $startGzipTag) !== false) {
				$startsAt = strpos($rules, $startGzipTag);
				$endsAt = strpos($rules, $endGzipTag, $startsAt);
				$textToDelete = substr($rules, $startsAt, ($endsAt + strlen($endGzipTag)) - $startsAt);
				$rules = str_replace($textToDelete, '', $rules);
				$hasChange = true;
			}
			}
			if ($hasChange === true) {
			return Themify_Filesystem::put_contents($htaccess_file, trim($rules));
			}
		}
    }

    public static function getHtaccessFile() {
	return get_home_path() . '.htaccess';
    }
	
	public static function addCssToFile($handle,$src, $ver=THEMIFY_VERSION,$position=false) {
		if(self::$concateFile===null){
			return false;
		}
		if(!isset(self::$css[$handle])){
			$src=themify_enque($src,false,false);
			if($position===false){
				self::$css[$handle]=array('s' => $src, 'v' => $ver);
			}
			elseif(isset(self::$css[$position])){
				$keys = array_keys( self::$css );
				$index = array_search( $position, $keys )+1;
				self::$css=array_slice( self::$css, 0, $index )+ array($handle=>array('s' => $src, 'v' => $ver))+ array_slice( self::$css, $index );
			}
			else{
				return false;
			}
		}
		return true;
    }
    public static function addPreLoadJs($src, $ver) {
		$src=themify_enque($src);
		self::$preLoadJs[$src] = $ver;
    }

    public static function addPreLoadCss($src, $ver, $m = 'all') {
		$src=themify_enque($src);
		self::$preLoadCss[$src] = array('v' => $ver, 'm' => $m);
    }
    
	
    public static function addPrefetchJs($src,$v){
		$src=themify_enque($src);
		if(!isset(self::$preLoadJs[$src])){
			self::$prefetchJs[$src]=$v;
		}
    }
    
    public static function addPrefetchCss($src, $ver, $m = 'all'){
		$src=themify_enque($src);
		if(!isset(self::$preLoadCss[$src])){
			self::$prefetchCss[$src]= array('v' => $ver, 'm' => $m);
		}
    }
    
    public static function addPreLoadMedia($src, $rel = 'preload', $type = 'image') {
	self::$preLoadMedia[$src] = array('t' => $type, 'r' => $rel);
    }
    
    public static function add_js($handle, $src, $deps, $ver, $in_footer = true) {
		$src = themify_enque($src);
		if (self::$isFooter === false) {
			self::addPreLoadJs($src, $ver);
		}
		if ($in_footer !== 'preload') {
			wp_enqueue_script($handle, $src, $deps, $ver, $in_footer);
		}
    }

    public static function getKnownJs() {
		static $arr=null;
		if($arr===null){
		    $arr=array();
			if(!is_admin()){
				if(themify_is_woocommerce_active() && !themify_check( 'setting-defer-wc', true )){
					$arr=array('flexslider', 'wc-single-product', 'woocommerce', 'zoom', 'js-cookie', 'jquery-blockui', 'jquery-cookie', 'jquery-payment', 'prettyPhoto', 'prettyPhoto-init', 'select2', 'selectWoo', 'wc-address-i18n', 'wc-add-payment-method', 'wc-cart', 'wc-cart-fragments', 'wc-checkout', 'wc-country-select', 'wc-credit-card-form', 'wc-add-to-cart', 'wc-add-to-cart-variation', 'wc-geolocation', 'wc-lost-password', 'wc-password-strength-meter','photoswipe','photoswipe-ui-default');
					//Authorize.Net Gateway for WooCommerce
					if(function_exists('wc_authorize_net_cim')){
						$arr[]='wc-authorize-net-cim';
						$arr[]='wc-authorize-net-apple-pay';
						$arr[]='wc-authorize-net-my-payment-methods';
						$arr[]='sv-wc-payment-gateway-payment-form-v5_8_1';
						$arr[]='sv-wc-payment-gateway-my-payment-methods-v5_8_1';
						$arr[]='sv-wc-jilt-prompt-customers';
						$arr[]='sv-wc-apple-pay-v5_8_1';
					}
                    if(defined( 'WOOCOMMERCE_GATEWAY_EWAY_VERSION' )) {//plugin eWAY WooCommerce gateway
                        $arr[]='eway-credit-card-form';
                    }
				}
				if(defined('WPCF7_PLUGIN')){
					$arr[]='contact-form-7';
				}
				if(defined( 'SBI_PLUGIN_DIR' )){//plugin instagram feed
					$arr[]='sb_instagram_scripts';
				}
				if(defined( 'LP_PLUGIN_FILE' )){//plugin learnpress
					$arr[]='lp-global';
					$arr[]='global';
					$arr[]='learnpress';
					$arr[]='lp-plugins-all';
					$arr[]='learn-press-enroll';
					$arr[]='quiz';
					$arr[]='wp-utils';
					$arr[]='course';
					$arr[]='checkout';
					$arr[]='profile-user';
					$arr[]='become-a-teacher';
					$arr[]='jquery-caret';
				}
			}
		}
		return $arr;    
	
	}

    public static function removeWebp($dir = null) {
		if ($dir === null) {
			$upload_dir = themify_upload_dir();
			$dir = $upload_dir['basedir'];
			if (!Themify_Filesystem::is_dir ($dir) || !Themify_Filesystem::is_readable($dir)) {
			return array('error' => sprintf(__('The directory %s doesn`t exist or not readable', 'themify'), $dir));
			}
		}
		$arr=array('.png','.jpg','.jpeg');
		$files = scandir($dir);
		foreach ($files as $value) {
			$path = realpath($dir . DIRECTORY_SEPARATOR . $value);
			if (!Themify_Filesystem::is_dir($path)) {
			    if (pathinfo($path, PATHINFO_EXTENSION) === 'webp') {
				foreach($arr as $v){
				    if(Themify_Filesystem::is_file (str_replace('.webp',$v,$path))){
					unlink($path);
					break;
				    }
				}
			    }
			} 
			elseif ($value !== '.' && $value !== '..') {
			    self::removeWebp($path);
			}
		}
    }

    public static function is_http2_support() {
		static $is = null;
		if ($is === null) {
			$is = (isset($_SERVER['H2_PUSH']) && $_SERVER['H2_PUSH'] === 'on') || (isset($_SERVER['H2PUSH']) && $_SERVER['H2PUSH'] === 'on');
		}
		return $is;
    }
	
	

	/**
	 * Load assets required by Themify framework
	 *
	 * @since 1.1.2
	 */
	public static function loadMainScript() {
		//Enqueue main js that will load others needed js
		if ( ! wp_script_is( 'themify-main-script' )) {
				wp_enqueue_script( 'themify-main-script', themify_enque(THEMIFY_URI.'/js/main.js'), array('jquery'), THEMIFY_VERSION, true );
				global $wp_scripts,$wp_styles,$wp_version;
				$jsUrl=THEMIFY_URI . '/js/modules/';
				$args=array(
					'version' =>THEMIFY_VERSION,
					'url' => THEMIFY_URI,
					'wp'=>$wp_version,
					'ajax_url' => admin_url( 'admin-ajax.php' ),
					'map_key' => themify_builder_get('setting-google_map_key', 'builder_settings_google_map_key'),
					'bing_map_key' => themify_builder_get('setting-bing_map_key', 'builder_settings_bing_map_key'),
					'includesURL' => includes_url(),
					'emailSub' => __('Check this out!','themify'),
					'lightbox' => themify_lightbox_vars_init(),
					's_v'=>self::$SWIPER_VERSION,
					'a_v'=>self::$ANIMATION_VERSION,
					'i_v'=>self::$IMAGELOAD_VERSION,
					'js_modules'=>array(
						'fxh' => themify_enque( $jsUrl . 'fixedheader.js' ),
						'lb'=> themify_enque(THEMIFY_URI . '/js/lightbox.min.js'),
						'gal'=> themify_enque(THEMIFY_URI . '/js/themify.gallery.js'),
						'sw'=> themify_enque($jsUrl . 'swiper/swiper.min.js'),
						'tc' => themify_enque( $jsUrl . 'themify.carousel.js' ),
						'map' => themify_enque( $jsUrl . 'map.js' ),
						'img' => themify_enque( $jsUrl . 'jquery.imagesloaded.min.js' ),
						'at' => themify_enque( $jsUrl . 'autoTiles.js' ),
						'iso' => themify_enque( $jsUrl . 'isotop.js' ),
						'inf' => themify_enque( $jsUrl . 'infinite.js' ),
						'lax' => themify_enque( $jsUrl . 'lax.js' ),
						'video' => themify_enque( $jsUrl . 'video-player.js' ),
						'audio' => themify_enque( $jsUrl . 'audio-player.js' ),
						'side' => themify_enque( $jsUrl . 'themify.sidemenu.js' ),
						'edge' => themify_enque( $jsUrl . 'edge.Menu.js' ),
						'wow' => themify_enque( $jsUrl . 'tf_wow.js' ),
						'share' => themify_enque( $jsUrl . 'sharer.js' ),
						'mega'=>themify_enque( $jsUrl . 'megamenu.js' ),
						'drop' => themify_enque( $jsUrl . 'themify.dropdown.js' ),
						'wc' => themify_enque( $jsUrl . 'wc.js' )
					),
					'css_modules'=>array(
						'sw'=> themify_enque(THEMIFY_URI . '/css/swiper/swiper.css'),
						'an'=>themify_enque(THEMIFY_URI . '/css/animate.min.css'),
						'video' => themify_enque(self::$THEMIFY_CSS_MODULES_URI . 'video.css'),
						'audio' => themify_enque(self::$THEMIFY_CSS_MODULES_URI . 'audio.css'),
						'drop' => themify_enque(self::$THEMIFY_CSS_MODULES_URI . 'dropdown.css'),
						'lb'=> themify_enque(THEMIFY_URI . '/css/lightbox.css')
					)
				);
				if(current_theme_supports('themify-mega-menu')){
					$args['js_modules']['mega']=themify_enque( THEMIFY_URI.'/megamenu/js/themify.mega-menu.js' );
					$args['css_modules']['mega']=themify_enque( THEMIFY_URI.'/megamenu/css/megamenu.css' );
				}
				if(!themify_is_lazyloading()){
					$args['lz']=1;
				}
				if(themify_is_minify_enabled()){
				    $args['is_min']=1;
				}
				self::$localiztion+=$args;
				$args=null;
				if(!is_admin()){
			
					    if(!empty($wp_scripts->registered['wp-embed'])){
						    self::$localiztion['wp_embed']=home_url($wp_scripts->registered['wp-embed']->src);
						    $wp_scripts->done[]='wp-embed';
					    }
					    global $wp_filter;
					    if(isset($wp_filter['wp_head'],$wp_filter['wp_head']->callbacks[7],$wp_filter['wp_head']->callbacks[7]['print_emoji_detection_script'])){
						    add_filter( 'wp_resource_hints', array(__CLASS__,'remove_emoji_prefetch'),100,2);
						    if(themify_check( 'setting-emoji',true )){
							    $src = apply_filters( 'script_loader_src', includes_url( 'js/wp-emoji-release.min.js'), 'concatemoji' );
							    if(!empty($src)){
								    ob_start();
								    print_emoji_detection_script();
								    self::$localiztion['wp_emoji']=trim(str_replace(array('<script type="text/javascript">','<script>','</script>'),array('',''),ob_get_clean()));
							    }
						    }
						    else{
							    remove_action( 'wp_print_styles', 'print_emoji_styles' ); 
						    }
						    remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
						    remove_filter( 'embed_head', 'print_emoji_detection_script' );
					    }
					if(self::$themeVersion!==null){
						$src = themify_enque(THEME_URI . '/js/themify.script.js');
						$ver = self::$themeVersion;
						self::$localiztion['theme_js']=$src;
						self::$localiztion['theme_v']=$ver;
						self::$localiztion['theme_url']=THEME_URI;
						self::$localiztion['menu_point']=self::$mobileMenuActive;
						self::addPreLoadJs($src,$ver);
						if(is_singular() && comments_open() && get_option('thread_comments') == 1){
							self::$localiztion['commentUrl']=home_url($wp_scripts->registered['comment-reply']->src);
							$wp_scripts->done[]='comment-reply';
						}  
						$wp_scripts->done[]='wp-playlist';
					} 

					if(!empty($wp_scripts->registered['mediaelement']) && !empty($wp_scripts->registered['mediaelement-core'])){
						self::$localiztion['media']=array(
							'css' => array_combine(array('wp-mediaelement','mediaelement'),wpview_media_sandbox_styles()),
							'_wpmejsSettings'=>$wp_scripts->registered['mediaelement']->extra['data'],
							'js'=>array(
								'mediaelement-core'=>array('src'=>home_url($wp_scripts->registered['mediaelement-core']->src),'v'=>$wp_scripts->registered['mediaelement-core']->ver,'extra'=>(!empty($wp_scripts->registered['mediaelement-core']->extra)?$wp_scripts->registered['mediaelement-core']->extra:'')),
								'mediaelement-migrate'=>array('src'=>home_url($wp_scripts->registered['mediaelement-migrate']->src),'v'=>$wp_scripts->registered['mediaelement-migrate']->ver,'extra'=>(!empty($wp_scripts->registered['mediaelement-migrate']->extra)?$wp_scripts->registered['mediaelement-migrate']->extra:'')),
								'wp-mediaelement'=>array('src'=>home_url($wp_scripts->registered['wp-mediaelement']->src),'v'=>$wp_scripts->registered['wp-mediaelement']->ver,'extra'=>(!empty($wp_scripts->registered['wp-mediaelement']->extra)?$wp_scripts->registered['wp-mediaelement']->extra:'')),
							)
						);
						if ( ! empty( $wp_styles ) ) {
							$wp_styles->done[]='wp-mediaelement';
							$wp_styles->done[]='mediaelement';
							$wp_scripts->done[]='mediaelement-core';
							$wp_scripts->done[]='mediaelement-migrate';
							$wp_scripts->done[]='wp-mediaelement';
						}
					}
				}
				else{
					self::$localiztion['is_admin']=1;
				}
				if(!self::$localiztion['bing_map_key']){
					unset(self::$localiztion['bing_map_key']);
				}
				if(!self::$localiztion['map_key']){
					unset(self::$localiztion['map_key']);
				}
				
		}
	}
	
	public static function remove_emoji_prefetch($urls, $relation_type){
		if($relation_type ==='dns-prefetch'){
			remove_filter( 'wp_resource_hints', array(__CLASS__,'remove_emoji_prefetch'),100,2);	
			foreach($urls as $k=>$v){
				if(strpos('core/emoji/',$v)!==false){
					unset($urls[$k]);
					break;
				}
			}
		}
		return $urls;
	}
	
	public static function addLocalization($key,$val,$type=false,$object_val=true){
		if(self::$localiztion!==null){
			if(!isset(self::$localiztion[$key])){
				if($type===false){
					self::$localiztion[$key]=$val;
				}
				else{
					self::$localiztion[$key]=array();
					if($type==='arr'){
						self::$localiztion[$key][]=$val;
					}
					else{
						self::$localiztion[$key][$val]=$object_val;
					}
				}
			}
			else{
				if($type===false){
					self::$localiztion[$key]=$val;
				}
				elseif($type==='arr'){
					self::$localiztion[$key][]=$val;
				}
				else{
					self::$localiztion[$key][$val]=$object_val;
				}
			}
		}
	}
	
	public static function getLocalization(){
		return self::$localiztion;
	}

	public static function loadGalleryCss(){
	    self::add_css( 'tf_wp_gallery', THEMIFY_URI . '/css/gallery.min.css', null, THEMIFY_VERSION);
	}
	
	public static function preFetchMasonry(){
	   self::addPrefetchJs(THEMIFY_URI . '/js/modules/isotop.js', THEMIFY_VERSION);
	} 
	
	public static function loadFluidMasonryCss($in_footer=false){
	    if(!isset(self::$css['tf_fluid_masonry'])){
			self::preFetchMasonry();
			self::add_css( 'tf_fluid_masonry', self::$THEMIFY_CSS_MODULES_URI . 'fluid-masonry.css', null, THEMIFY_VERSION,null,$in_footer);
			self::addLocalization('done','tf_fluid_masonry',true);
	    }
	} 
	
	public static function loadAutoTilesCss(){
		self::loadGridCss('auto_tiles');
	}
	
	public static function loadinfiniteCss(){
	    if(!isset(self::$css['tf_infinite'])){
		self::add_css( 'tf_infinite', self::$THEMIFY_CSS_MODULES_URI . 'infinite.css', null, THEMIFY_VERSION,null,true );
		self::addLocalization('done','tf_infinite',true);
	    }
	}
	
	public static function loadThemeStyleModule($file,$media=null,$in_footer=false){
		self::add_css('tf_theme_'.str_replace('/','_',$file),self::$THEME_CSS_MODULES_URI.$file.'.css',null,self::$themeVersion,$media,$in_footer);
	}
	
	public static function loadThemeWCStyleModule($file,$media=null,$in_footer=false){
	    if(is_file(self::$THEME_WC_CSS_MODULES_DIR.$file. '.css')){
		self::add_css( 'tf_theme_wc_'.str_replace('/','_',$file), self::$THEME_WC_CSS_MODULES_URI.$file. '.css',null,self::$themeVersion,$media,$in_footer );
	    }
	}
	
	public static function loadGridCss($grid,$in_footer=false){
		if(!isset(self::$css['tf_grid_'.$grid]) && in_array($grid,array('list-post','grid2-thumb','grid2','grid3','grid4','grid5','grid6','list-large-image','list-thumb-image','auto_tiles'),true)){
		    if($grid==='auto_tiles'){
				self::addPrefetchJs(THEMIFY_URI . '/js/modules/autoTiles.js', THEMIFY_VERSION);
		    }
			self::add_css('tf_grid_'.$grid, THEMIFY_URI . '/css/grids/'.$grid.'.css', null, THEMIFY_VERSION,null,$in_footer);
		    if(self::$THEME_CSS_MODULES_DIR!==null && is_file(self::$THEME_CSS_MODULES_DIR.'grids/'.$grid.'.css')){
				self::add_css('tf_grid_theme_'.$grid, self::$THEME_CSS_MODULES_URI . 'grids/'.$grid.'.css', null, self::$themeVersion,null,$in_footer);
				self::addLocalization('done','tf_grid_theme_'.$grid,true);
		    }
		    self::addLocalization('done','tf_grid_'.$grid,true);
		}
	}
	
	public static function loadGoogleFonts($return=false){
		if ( defined( 'THEMIFY_GOOGLE_FONTS' ) && THEMIFY_GOOGLE_FONTS != true ) {
			return;
		}
		$fonts = apply_filters( 'themify_google_fonts', self::$googleFonts );
		$res = array();
		foreach ( $fonts as $font ) {
			if ( ! empty( $font ) && preg_match( '/^\w/', $font ) ) {
				/* fix the delimiter with multiple weight variants, it should use `,` and not `:`
					reset the delimiter between font name and first variant */
				$font=preg_replace( '/,/', ':', str_replace( ':', ',', $font ), 1 );
				$key = explode(':',$font);
				$key=$key[0];
				if(!isset($res[ $key ] )){
					$res[ $key ] =array();
				}
				if(strpos($font,',')!==false || strpos($font,':')!==false){
					$font = str_replace(array($key.':',$key),array('',''),explode(',',$font));
					foreach($font as $f){
						$res[ $key ][]=$f;
					}
				}
				else{
					$res[ $key ][]='400';
				}
			}
		}
		$fonts=null;
		if ( ! empty( $res ) ) {
			$items=array();
			foreach($res as $k=>$v){
				$items[] = $k.':'.implode(',',array_unique($v));
			}
			$res=null;
			$id='themify-google-fonts-css';
			$path = ( is_ssl() ? 'https' : 'http' ) . '://fonts.googleapis.com/css?family=' . implode( '%7C', $items ).'&display=swap';
			if($return===true){
				return '<link rel="preload" as="style" href="'.$path.'"/><link id="'.$id.'" rel="stylesheet" href="'.$path.'"/>';
			}
			wp_enqueue_style( $id, $path,null,null);
		}
		elseif($return===true){
			return '';
		}
	}
	
	public static function addGoogleFont(array $fonts){
		foreach($fonts as $v){
			self::$googleFonts[]=$v;
		}
	}
	
	public static function addMobileMenuCss($handler,$src){
	    if(!isset(self::$mobileMenuCss[$handler]) && !isset(self::$done[$src]) && !isset(self::$css[$handler])){
		self::$done[$src]=true;
		self::$mobileMenuCss[$handler]=themify_enque($src);
	    }
	}
	
	public static function preLoadAnimtion($only_css=false){
		static $is=false;
		if(!isset(self::$preLoadCss[THEMIFY_URI . '/css/animate.min.css'])){
		    self::addPreLoadCss(THEMIFY_URI . '/css/animate.min.css',self::$ANIMATION_VERSION);
		}
		if($only_css===false && $is===false){
		    $is=true;
		    self::addPreLoadJs(THEMIFY_URI . '/js/modules/tf_wow.js',THEMIFY_VERSION);
		    self::preLoadImageLoad();
		}
	}
	
	public static function preLoadImageLoad(){
		self::addPreLoadJs(THEMIFY_URI.'/js/modules/jquery.imagesloaded.min.js',self::$IMAGELOAD_VERSION);
	}
	
	public static function preLoadSwiperJs($type='prefetch',$only='all'){
		$url=THEMIFY_URI . '/js/modules/themify.carousel.js';
		$sw_url=THEMIFY_URI . '/js/modules/swiper/swiper.min.js';
		$sw_css=THEMIFY_URI . '/css/swiper/swiper.css';
		if($type==='prefetch'){
			if($only==='all' || $only==='css'){
				self::addPrefetchCss($sw_css, THEMIFY_VERSION);
			}
			if($only==='all' || $only==='js'){
				self::addPrefetchJs($url, THEMIFY_VERSION);
				self::addPrefetchJs($sw_url, self::$SWIPER_VERSION);
			}
	    }
	    else{
			if($only==='all' || $only==='css'){
				self::addPreLoadCss($sw_css, THEMIFY_VERSION);
			}
			if($only==='all' || $only==='js'){
				self::addPreLoadJs($url, THEMIFY_VERSION);
				self::addPreLoadJs($sw_url, self::$SWIPER_VERSION);
			}
	    }
	}
	
	public static function preFetchFixedHeaderJs($type='prefetch'){
	    $url=THEMIFY_URI . '/js/modules/fixedheader.js';
	    if($type==='prefetch'){
		self::addPrefetchJs($url, THEMIFY_VERSION);
	    }
	    else{
		self::addPreLoadJs($url, THEMIFY_VERSION);
	    }
	}
	
	public static function preFetchSideMenuJs($type='prefetch'){
	    $url=THEMIFY_URI . '/js/modules/themify.sidemenu.js';
	    if($type==='prefetch'){
		self::addPrefetchJs($url, THEMIFY_VERSION);
	    }
	    else{
		self::addPreLoadJs($url, THEMIFY_VERSION);
	    }
	}
	
	public static function preFetchAnimtion($only_css=false){
		static $is=false;
		if(!isset(self::$prefetchCss[THEMIFY_URI . '/css/animate.min.css'])){
		    self::addPrefetchCss(THEMIFY_URI . '/css/animate.min.css', self::$ANIMATION_VERSION);
		}
		if($only_css===false && $is===false){
		    $is=true;
		    self::addPrefetchJs(THEMIFY_URI . '/js/modules/tf_wow.js', THEMIFY_VERSION);
		}
	}
	
	public static function clearConcateCss($blog_id=false){
		$upload_dir = themify_upload_dir($blog_id);
		$dir=rtrim($upload_dir['basedir'],'/').self::$concateDir;
		if (Themify_Filesystem::is_dir($dir) && Themify_Filesystem::delete($dir)) {
		    self::$concateFile=null;
		    self::createDir();
		}
		TFCache::remove_cache('blog',false,$blog_id);
		TFCache::clear_3rd_plugins_cache();
	}
	
	public static function wp_media_playlist($html,$attr,$instance){
		if(!isset($attr['type']) || $attr['type']==='audio'){
			return self::audio_playlist($attr);
		}
		return $html;
	}
	
	
	public static function audio_playlist($attr){
		
		$post = get_post();
		$atts = shortcode_atts(
			array(
				'order'        => 'ASC',
				'orderby'      => 'menu_order ID',
				'id'           => $post ? $post->ID : 0,
				'include'      => '',
				'exclude'      => '',
				'tracklist'    => true,
				'tracknumbers' => true,
				'images'       => true,
				'artists'      => true
			),
			$attr,
			'playlist'
		);
		$atts['type']='audio';
		$showImages=!empty($atts['images']);
		if(empty($attr['tracks'])){
			$id = (int)$atts['id'];
			$args = array(
				'post_status'    => 'inherit',
				'post_type'      => 'attachment',
				'post_mime_type' => $atts['type'],
				'order'          => $atts['order'],
				'orderby'        => $atts['orderby'],
				'no_found_rows'=>true
			);

			if ( ! empty( $atts['include'] ) ) {
				$args['include'] = $atts['include'];
				$_attachments    = get_posts( $args );
				$attachments = array();
				foreach ( $_attachments as $key => $val ) {
					$attachments[ $val->ID ] = $_attachments[ $key ];
				}
				$_attachments=null;
			}
			else {
				$args['post_parent'] = $id;
				if ( ! empty( $atts['exclude'] ) ){
					$args['exclude']= $atts['exclude'];
				}
				$attachments= get_children( $args );
			}
			$args=null;
			if ( empty( $attachments ) ) {
				return '<div></div>';
			}

			if ( is_feed() ) {
				$output = "\n";
				foreach ( $attachments as $att_id => $attachment ) {
					$output .= wp_get_attachment_link( $att_id ) . "\n";
				}
				return $output;
			}

			
			$tracks = array();
			$mime_types=wp_get_mime_types();
			$metaArr=array('artist','album','length_formatted');
			foreach ( $attachments as $attachment ) {
				$url   = wp_get_attachment_url( $attachment->ID );
				$ftype = wp_check_filetype( $url, $mime_types );
				$track = array(
					'src'         => trim($url),
					'type'        => $ftype['type'],
					'title'       => $attachment->post_title,
					'caption'     => $attachment->post_excerpt
				);
				$meta = wp_get_attachment_metadata( $attachment->ID );
				if ( ! empty( $meta )  ) {
					$track['meta'] = array();
					foreach($metaArr as $m){
						if ( ! empty( $meta[ $m ] ) ) {
							$track['meta'][ $m ] = $meta[ $m ];
						}
					}
				}
				if ( $showImages===true ) {
					$thumb_id = get_post_thumbnail_id( $attachment->ID );
					if ( ! empty( $thumb_id ) ) {
						list( $src, $width, $height ) = wp_get_attachment_image_src( $thumb_id, 'thumbnail' );
					} else {
						$src  = wp_mime_type_icon( $attachment->ID );
						$width= 48;
						$height= 64;
					}
					$track['thumb'] = array('src'=>$src,'width'=>$width,'height'=>$height);
				}

				$tracks[] = $track;
			}
			$mime_types=$metaArr=$attachments=null;
		}
		else{
			$tracks=$attr['tracks'];
		}
		$data = array(
			'type'         => 'audio',
			'tracklist'    => $atts['tracklist']?1:0,
			'tracknumbers' => $atts['tracknumbers']?1:0,
			'images'       => $showImages===true?1:0,
			'artists'      => $atts['artists']?1:0,
			'tracks'=>$tracks
		);
		$autoplay=!empty( $attr['autoplay'])?' autoplay':'';
		$loop=!empty( $attr['loop'])?' data-loop':'';
		$loop.=!empty( $attr['muted'])?' muted':'';
		$tracks=$atts=null;
		$output='<div class="wp-audio-playlist">'.themify_make_lazy('<audio controls="controls" preload="none"'.$autoplay.$loop.'></audio>');
		$output.='<script type="application/json" class="tf-playlist-script">'.wp_json_encode( $data ).'</script></div>';
		return $output;
	}
	
	public static function widget_css($instance, $thiz, $args){
		$id=$thiz->id_base;
		if($id){
			if($id==='themify-most-commented'){
			    $id='themify-feature-posts';
			}
			elseif($id==='themify-social-links'){
			    self::add_css('tf_theme_social_links', self::$THEMIFY_CSS_MODULES_URI . 'social-links.css',null, THEMIFY_VERSION );
			}
			$k='tf_theme_widget_'.str_replace('-','_',$id);
			if(!isset(self::$css[$k])){
				$file='widgets/'.$id.'.css';	
				if(is_file(self::$THEME_CSS_MODULES_DIR.$file)){
				    self::add_css($k,self::$THEME_CSS_MODULES_URI.$file,null,self::$themeVersion);
				}
			}
		}
		return $instance;
	}
	
	
	public static function lazy_init(){
		if(!is_admin() && !themify_is_login_page()){
			self::createDir();
			remove_action( 'wp_head', 'wp_resource_hints', 2);
			if(self::$themeVersion!==null){
				self::$isInTop=themify_get('setting-css',false,true) !== 'bottom';
				add_action('wp_head', array(__CLASS__, 'header_meta'), 0);
				add_filter('wp_title', array(__CLASS__, 'wp_title'), 10, 2);
				add_filter('widget_display_callback', array(__CLASS__, 'widget_css'), 100,3);
				remove_action( 'wp_head', 'locale_stylesheet' );//remove rtl loading
			}
			add_action('wp_enqueue_scripts', array(__CLASS__, 'before_enqueue'), 7);
			add_action('wp_enqueue_scripts', array(__CLASS__, 'after_enqueue'), 11);
			add_filter('wp_default_scripts', array(__CLASS__, 'remove_default_js'));
			add_filter('style_loader_tag', array(__CLASS__, 'style_header_tag'), 10, 4);
			add_filter('the_content', array(__CLASS__, 'loadGuttenbergCss'), 100);
			add_action('wp_head', array(__CLASS__, 'wp_head'), 1);
			add_action('wp_footer', array(__CLASS__, 'wp_footer'), 100);
			add_action('wp_footer', array(__CLASS__, 'js_localize'), 18);
			add_action('wp_head', array( __CLASS__, 'header_html' ) );
		}
		add_filter('wp_audio_shortcode_library', array(__CLASS__,'media_shortcode_library'), 100, 1);
		add_filter('wp_video_shortcode_library', array(__CLASS__,'media_shortcode_library'), 100, 1);
		add_filter('wp_audio_shortcode',array(__CLASS__,'media_shortcode'),100,5);
		if(themify_is_lazyloading()){
			themify_disable_other_lazy();
			add_filter('wp_video_shortcode',array(__CLASS__,'media_shortcode'),100,5);
		}
	}
	
	public static function allow_lazy_protocols($protocols ){
		$protocols[]='data';
		return $protocols;
	}

	
	public static function media_shortcode($html, $atts, $media, $post_id, $library ){
		if(current_filter()==='wp_audio_shortcode'){
			$html = themify_make_lazy($html);
		}
		else{
			$html= str_replace(array(' preload=','<video '),array(' data-preload=','<video data-lazy="1" preload="none"'),$html);
		}
		return $html;
	}
		
	public static function media_shortcode_library($library){
		return 'tf_lazy';
	}
	
	public static function load_loop_css($class,$post_type,$layout,$type,$moduleArgs=array(),$slug=false){
	    global $themify;
	    if(self::$themeVersion!==null){//only in themify theme
		if ( !empty($themify->post_layout_type) && $themify->post_layout_type!=='default' ) {
		    $class[] = $themify->post_layout_type;
		}
		if($post_type==='product'){
		    global $woocommerce_loop;
		    if((isset($woocommerce_loop['name']) && ($woocommerce_loop['name']==='related' || $woocommerce_loop['name']==='up-sells') )|| wc_get_loop_prop( 'is_shortcode' )){
				$layout=(int)wc_get_loop_prop( 'columns' );
				$index=array_search('columns-'.$layout,$class,true);
				if($index!==false){
					unset($class[$index]);
				}
				$index=array_search('masonry',$class,true);
				if($index!==false){
					unset($class[$index]);
				}
				$index=array_search('infinite',$class,true);
				if($index!==false){
					unset($class[$index]);
				}
				$index=array_search('no-gutter',$class,true);
				if($index!==false){
					unset($class[$index]);
				}
				$layout=$layout===1?'list-post':'grid'.$layout;
		    }
		}
	    }
	    self::loadGridCss($layout);
	    if(in_array('masonry',$class,true)){
			if(!in_array( $layout, array( 'list-post','grid2-thumb','slider','auto_tiles' ),true)){
				$class[]='tf_rel';
				if(in_array('tf_fluid',$class,true)){
					self::loadFluidMasonryCss();
				}
				else{
					self::preFetchMasonry();
				}
			}
			else{
				$index=array_search('masonry',$class,true);
				if($index!==false){
					unset($class[$index]);
				}
			}
	    }
	    $class[]=$layout;
	    return array_unique($class);
	}
	
	
	public static function get_css(){
		return self::$css;
	}
	
	
	/**
	 * Check if the file belong to themify(plugin, FW, theme and etc.)
	 *
	 * return boolean
	*/
	public static function is_themify_file( $file, $handler ) {
	    if (strpos( $file, 'maps.google.com' ) === false &&(
		    strpos( $handler, 'themify' ) !== false
		    || strpos( $handler, 'builder-' ) === 0
		    || strpos( $handler, 'tbp' ) === 0
		    || (defined('THEME_URI') && strpos( $file, THEME_URI ) !== false)
		    || preg_match( '/themify[\.-][^\/]*\.js/', $file ) // match "themify.*.js" or "themify-*.js"
	    )) {
		    return true;
	    }

	    return false;
	}
	
	public static function loadGuttenbergCss($content){
		if(function_exists('has_blocks') && !empty(self::$guttenbergCss) ){
			if($content!=='' && has_blocks(get_the_id()) && strpos($content,'wp-block')!==false){
				global $wp_styles,$wp_version;
				foreach(self::$guttenbergCss as $k=>$src){
					if(isset($wp_styles->registered[$k])){

						$ver = $wp_styles->registered[$k]->ver;
						if (empty($ver)) {
							$ver = $wp_version;
						}
						if (strpos($src, 'http') === false) {
							$src = home_url($src);
						}
						self::add_css($k,$src, $wp_styles->registered[$k]->deps, $ver, $wp_styles->registered[$k]->args);
					}
				}
				self::$guttenbergCss=null;
				remove_filter('the_content', array(__CLASS__, 'loadGuttenbergCss'), 100);
			}
		}
		else{
			remove_filter('the_content', array(__CLASS__, 'loadGuttenbergCss'), 100);
		}
		return $content;
	}
}
Themify_Enqueue_Assets::init();
