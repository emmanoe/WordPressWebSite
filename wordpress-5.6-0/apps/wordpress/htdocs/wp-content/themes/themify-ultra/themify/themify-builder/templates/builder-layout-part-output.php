<?php
if (!defined('ABSPATH'))
    exit; // Exit if accessed directly

$isActive=Themify_Builder::$frontedit_active===true;
Themify_Builder_Stylesheet::enqueue_stylesheet( false, $args['builder_id'] );
Themify_Builder::$frontedit_active = false;
?>
<?php if(!$isActive && isset($args['l_p'])):?>
<div class="tb_layout_part_wrap tf_w">
<?php endif; ?>
    <div class="themify_builder_content themify_builder_content-<?php echo $args['builder_id']; ?> themify_builder not_editable_builder<?php if ($ThemifyBuilder->in_the_loop===true): ?> in_the_loop<?php endif;?>" data-postid="<?php echo $args['builder_id']; ?>">
        <?php
        foreach ($args['builder_output'] as $rows => $row) :
            if (!empty($row)) {
                if (!isset($row['row_order'])) {
                    $row['row_order'] = $rows; // Fix issue with import content has same row_order number
                }
                Themify_Builder_Component_Row::template($rows, $row, $args['builder_id'], true);
            }
        endforeach; // end row loop
        ?>
    </div>
<?php if(!$isActive && isset($args['l_p'])):?>
</div>
<?php endif; ?>
<?php if(!empty($args['pb_pagination'])): ?>
    <!-- themify_lp_pagination -->
	<?php echo $args['pb_pagination']; ?>
    <!-- /themify_lp_pagination -->
<?php endif; ?>
<?php Themify_Builder::$frontedit_active = $isActive;$args=null;?>
