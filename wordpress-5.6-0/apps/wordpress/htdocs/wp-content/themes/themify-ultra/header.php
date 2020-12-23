<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<?php global $themify; 
wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php
    themify_theme_add_section_loader();
    themify_body_start();
    $search_form=themify_theme_show_area( 'search_form' )?themify_get('setting_search_form',false,true):false;
?>
<?php if ( $search_form !== 'search_form' && $search_form!==false ){
	get_template_part( 'includes/search-box' );
}
?>
<div id="pagewrap" class="tf_box hfeed site">

	<?php if ( themify_theme_show_area( 'header' ) && themify_theme_do_not_exclude_all( 'header' ) ) : ?>
		<?php 
			$header_design=  themify_theme_get_header_design();
			$cl='tf_box tf_w';
			if($header_design==='header-leftpane' || $header_design==='header-rightpane'){
				$cl.=' tf_scrollbar';
			}
		?>
		<div id="headerwrap" <?php themify_theme_header_background('header',$cl) ?>>

			<?php themify_header_before(); // hook ?>

			<?php   
				$cl=null;	
				$show_mobile_menu = themify_theme_do_not_exclude_all( 'mobile-menu' );
				$show_menu_navigation = $show_mobile_menu && themify_theme_show_area( 'menu_navigation' );
			$cart_icon_show=false;
			$shodWidgets = themify_theme_show_area( 'header_widgets' );
			if ( $shodWidgets ) {
				ob_start();
				get_template_part( 'includes/header-widgets');
				$header_widgets = ob_get_clean();
				$shodWidgets = !empty($header_widgets);
				$pull_down= $shodWidgets===true && ($header_design==='boxed-compact' || $header_design==='header-horizontal' || $header_design==='header-top-bar' || $header_design==='header-stripe')?'<a href="#" class="pull-down tf_inline_b tf_text_dec tf_overflow"><span class="pull-down-inner tf_inline_b tf_vmiddle"></span></a>':'';
				?>
				<?php if ($shodWidgets===true && $header_design==='header-top-widgets') : ?>
					<div class="header-widget-full clearfix">
					<div class="header-widget-inner">
						<?php echo $header_widgets; ?>
						<?php $header_widgets = null; ?>
					</div>
					</div>
					<!-- /header-widgets -->
				<?php endif; // exclude header widgets ?>
			<?php } ?>
                        <?php if($show_menu_navigation):?>
                            <div class="header-icons tf_hide">
                                <a id="menu-icon" class="tf_inline_b tf_text_dec" href="#mobile-menu" aria-label="<?php _e('Menu','themify') ?>"><span class="menu-icon-inner tf_inline_b tf_vmiddle tf_overflow"></span><span class="screen-reader-text"><?php _e( 'Menu', 'themify' ); ?></span></a>
				<?php if($header_design!=='header-leftpane' && $header_design!=='header-rightpane'){
				    get_template_part('includes/cart-icon');
				}
				?>
                            </div>
                        <?php endif;?>

			<header id="header" class="tf_box pagewidth clearfix" itemscope="itemscope" itemtype="https://schema.org/WPHeader">

	            <?php themify_header_start(); // hook ?>

	            <div class="header-bar tf_box">
				    <?php if ( themify_theme_show_area( 'site_logo' ) ){
					    echo themify_logo_image();
					}

					if ( themify_theme_show_area( 'site_tagline' ) ){
					    echo themify_site_description();
					}
				    ?>
				</div>
				<!-- /.header-bar -->

				<?php if ( $show_mobile_menu ) : ?>
					<div id="mobile-menu" class="sidemenu sidemenu-off<?php if($header_design!=='header-leftpane' && $header_design!=='header-rightpane'):?> tf_scrollbar<?php endif;?>">
						<?php if($header_design==='header-overlay'):?>
						    <div class="overlay-menu-sticky">
							<div class="overlay-menu-sticky-inner">
						<?php endif;?>
						<?php themify_mobile_menu_start(); // hook ?>

						<div class="navbar-wrapper clearfix">
                            <?php if('header-classic' === $header_design): ?>
                            <div class="navbar-wrapper-inner">
                            <?php endif; ?>
							<?php if($header_design!=='header-leftpane'  && $header_design!=='header-rightpane' && $header_design!=='boxed-compact'){
								get_template_part('includes/cart-icon');
							}
							?>
							<?php if ( themify_theme_show_area( 'social_widget' ) ) : ?>
								<div class="social-widget tf_inline_b tf_vmiddle">
									<?php if ( themify_theme_show_area( 'social_widget' ) ) {
										 dynamic_sidebar( 'social-widget' ); 
									}
									?>
								    <?php if($header_design==='header-leftpane' || $header_design==='header-rightpane'){
									get_template_part('includes/cart-icon');
								    }
								    ?>
								</div>
								<!-- /.social-widget -->
							<?php endif; // exclude social widgeticon ?>

							<?php if ($search_form!==false ){
									if ($search_form  === 'search_form') {
										Themify_Enqueue_Assets::loadThemeStyleModule('search-form');
										echo '<div id="searchform-wrap">';
											get_template_part('searchform');
										echo '</div>';
									}else{
										echo '<a class="search-button tf_vmiddle tf_inline_b" href="#">'.themify_get_icon('search','fa').'</a>';
									}
							}?>

							<nav id="main-nav-wrap" itemscope="itemscope" itemtype="https://schema.org/SiteNavigationElement">
								<?php if ( $show_menu_navigation ){
									themify_menu_nav( array( 'walker' => new Themify_Mega_Menu_Walker,'post_count'=>themify_check( 'setting-mega_menu_post_count',true ) ) );
									if( ! empty( $pull_down ) ) {
										Themify_Enqueue_Assets::loadThemeStyleModule('pull-down');
										echo $pull_down;
									}
								}
								else {
								    echo '<span id="main-nav"></span>';
									if( ! empty( $pull_down ) ) {
										Themify_Enqueue_Assets::loadThemeStyleModule('pull-down');
										echo $pull_down;
									}
								}
								if($header_design==='boxed-compact'){
									get_template_part('includes/cart-icon');
								}
								?>
							</nav>
							<!-- /#main-nav-wrap -->
                            <?php if('header-classic' === $header_design): ?>
                            </div>
                            <?php endif; ?>
                        </div>
						<?php if ($shodWidgets===true && $header_design!=='header-top-widgets') : ?>
							<?php echo $header_widgets; ?>
							<?php $header_widgets = null; ?>
							<!-- /header-widgets -->
						<?php endif; // exclude header widgets ?>

							<a id="menu-icon-close" aria-label="<?php _e('Close menu','themify'); ?>" class="tf_close tf_hide" href="#"><span class="screen-reader-text"><?php _e( 'Close Menu', 'themify' ); ?></span></a>

						<?php themify_mobile_menu_end(); // hook ?>
						<?php if($header_design==='header-overlay'):?>
						    </div>
						    </div>
						<?php endif;?>
					</div><!-- #mobile-menu -->
                     <?php
                        if ( $themify->sticky_sidebar || ( themify_theme_is_single_infinite_enabled() && is_singular( 'post' ) ) ) : ?>
                            <div id="toggle-mobile-sidebar-button" class="tf_hide open-toggle-sticky-sidebar toggle-sticky-sidebar">
                                <i class="mobile-sticky-sidebar-icon "></i>
                            </div>
                        <?php  endif;?>
					<!-- /#mobile-menu -->
				<?php endif; // do not exclude all this ?>

				<?php if ( themify_is_woocommerce_active() && themify_theme_show_area( 'cart_icon' ) && themify_show_slide_cart() ) : ?>
					<div id="slide-cart" class="sidemenu sidemenu-off tf_scrollbar">
						<a href="#" id="cart-icon-close" class="tf_close"><span class="screen-reader-text"><?php _e( 'Close Cart', 'themify' ); ?></span></a>
						<?php themify_get_ecommerce_template( 'includes/shopdock' ); ?>
					</div>
				<?php endif; ?>

				<?php themify_header_end(); // hook ?>

			</header>
			<!-- /#header -->
			<?php
			// If there's a header background slider, show it.
			get_template_part( 'includes/header-slider');
			?>
	        <?php themify_header_after(); // hook ?>

		</div>
		<!-- /#headerwrap -->
	<?php endif; // exclude header ?>

	<div id="body" class="tf_box tf_clear tf_mw clearfix">
		
	<?php themify_layout_before(); //hook 
	   
