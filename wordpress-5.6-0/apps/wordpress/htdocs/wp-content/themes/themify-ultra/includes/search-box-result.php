<?php
global $query,$found_types;
if( $query->have_posts()):
	?>
    <ul class="search-option-tab">
        <li class="active"><a href="#all"><?php _e('All results','themify')?></a></li>
		<?php foreach ($found_types as $type): ?>
			<?php
			switch ($type){
				case 'product':
					$title=__('Shop','themify');
					break;
				case 'post':
					$title=__('Blog','themify');
					break;
				case 'page':
					$title=__('Page','themify');
					break;
				default:
					$type_obj = get_post_type_object( $type );
					$title=$type_obj->labels->singular_name;
					$type_obj=null;
					break;
			}
			?>
            <li><a href="#<?php echo $type ?>"><?php echo $title; ?></a></li>
		<?php endforeach; ?>
    </ul>
	<?php $is_disabled = themify_is_image_script_disabled();?>
	<?php  while ( $query->have_posts() ):?>
	<?php
	$query->the_post();
	$post_type  = get_post_type();
	$is_product = $post_type === 'product';
	if(has_post_thumbnail()){
		$post_image = !$is_disabled?themify_get_image(array('w'=>47,'h'=>48,'crop'=>true,'urlonly'=>true)):'';
		if(!$post_image){
			$post_image = $is_product?get_the_post_thumbnail_url( null,'shop_thumbnail'):get_the_post_thumbnail_url( null,'thumbnail');
		}
	}
	else{
		$post_image = false;
	}
	?>
    <div class="result-item result-<?php echo $post_type; ?>">
        <a href="<?php the_permalink()?>">
			<?php if($post_image!==false):?>
                <img src="<?php echo $post_image;?>" width="47" height="48" />
			<?php endif;?>
            <h3 class="title"><?php the_title()?></h3>
			<?php if($is_product):?>
				<?php global $product?>
                <span class="price"><?php echo $product->get_price_html()?></span>
			<?php endif;?>
        </a>
    </div>
    <!-- /result-item -->
<?php endwhile;?>

	<?php if($query->max_num_pages>1):?>
    <div class="view-all-wrap">
		<?php $search_link = get_search_link($_POST['term']);?>
		<?php foreach ($found_types as $type): ?>
			<?php $type_obj = get_post_type_object( $type ); ?>
            <a id="result-link-<?php echo $type; ?>" href="<?php echo add_query_arg(array('type'=>$type),$search_link)?>" class="view-all-button"><?php echo __('View All','themify').' '.$type_obj->label; ?></a>
		<?php endforeach; ?>
        <a id="result-link-item" href="<?php echo $search_link ?>" class="view-all-button"><?php _e('View All','themify')?></a>
    </div>
    <!-- /view-all-wrap -->
<?php endif;?>
<?php else:?>
    <p><?php _e('No Items Found','themify');?></p>
<?php endif;?>
