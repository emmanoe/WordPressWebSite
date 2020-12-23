<?php
/**
 * Template for cart
 * @package themify
 * @since 1.0.0
 */
?>
<?php themify_shopdock_before(); //hook ?>
<div id="shopdock-ultra">

	<?php themify_shopdock_start(); //hook 
	if(themify_is_ajax()):
		// check whether cart is not empty
		if (!empty( WC()->cart->get_cart() )):
		?>
			<div id="cart-wrap">
				<div id="cart-list">
					<?php get_template_part( 'includes/loop-product', 'cart' ); ?>
				</div>
				<!-- /cart-list -->

				<p class="cart-total">
					<?php echo WC()->cart->get_cart_subtotal(); ?>
					<a id="view-cart" href="<?php echo wc_get_cart_url(); ?>">
						<?php _e('View Cart', 'themify') ?>
					</a>
				</p>

				<?php themify_checkout_start(); //hook ?>

				<p class="checkout-button">
				    <button type="submit" class="button checkout white flat" onClick="document.location.href='<?php echo  wc_get_checkout_url(); ?>'; return false;"><?php _e('Checkout', 'themify')?></button>
				</p>
				<!-- /checkout-botton -->

				<?php themify_checkout_end(); //hook ?>

			</div>
			<!-- /#cart-wrap -->
		<?php else: ?>
			<?php
			printf('%s <a href="%s">%s</a>.' ,
				__('Your cart is empty. Go to','themify'),
				themify_get_shop_permalink(),
				__('Shop','themify')
			);
			?>
		<?php endif; // cart whether is not empty?>
	<?php endif;?>

	<?php themify_shopdock_end(); //hook ?>

</div>
<!-- /#shopdock -->
<?php themify_shopdock_after();
