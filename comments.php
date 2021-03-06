<?php
/*
 * The template for displaying Comments.
 */
global $wdwt_front;
if (post_password_required()) { ?>
    <p class="nocomments"><?php _e('This post is password protected. Enter the password to view any comments.', "sauron"); ?></p>
    
	<?php return; } ?>

<?php if (have_comments()) : ?>
    <!-- <h5 id="comments"> 
			<?php
			// printf( _n('One comment on &ldquo;%2$s&rdquo;', '%1$s comments on &ldquo;%2$s&rdquo;', get_comments_number(), "sauron"),
			// number_format_i18n( get_comments_number() ), '<span>' . get_the_title() . '</span>');
			?>
    </h5>  -->
    <?php if ( get_comment_pages_count() > 1 && get_option( 'page_comments' ) ) : ?>
    <div class="navigation">
        <div class="previous"><?php previous_comments_link(__( '&#8249; Older comments',"sauron" )); ?></div><!-- end of .previous -->
        <div class="next"><?php next_comments_link(__( 'Newer comments &#8250;',"sauron", 0 )); ?></div><!-- end of .next -->
    </div><!-- end of.navigation -->
    <?php endif; ?>
    <ol class="commentlist">
        <?php wp_list_comments( array(
				'short_ping' => true,
				'avatar_size'=> 60,
			) ); ?>
		<div class="clear"></div>
    </ol>
    
    <?php if ( get_comment_pages_count() > 1 && get_option( 'page_comments' ) ) : ?>
    <div class="navigation">
        <div class="previous"><?php previous_comments_link(__( '&#8249; Older comments',"sauron" )); ?></div><!-- end of .previous -->
        <div class="next"><?php next_comments_link(__( 'Newer comments &#8250;',"sauron", 0 )); ?></div><!-- end of .next -->
    </div><!-- end of.navigation -->
    <?php endif; ?>

<?php else : ?>

<?php endif; ?>

<?php
if (!empty($comments_by_type['pings'])) : // let's seperate pings/trackbacks from comments
    $count = count($comments_by_type['pings']);
    ($count !== 1) ? $txt = __('Pings&#47;Trackbacks',"sauron") : $txt = __('Pings&#47;Trackbacks',"sauron");
?>

    <h6 id="pings"><?php printf( __( '%1$d %2$s for "%3$s"', "sauron" ), $count, $txt, get_the_title() )?></h6>

    <ol class="commentlist">
	
        <?php wp_list_comments('type=pings&max_depth=<em>'); ?>
    </ol>
<?php endif; ?>

<?php  
    $user = wp_get_current_user();
    $userID = $user->ID;
    $avatar = get_avatar($userID);

    $commentStr = '<p class="comment-form-comment"><span class="comment_user_avatar">' . $avatar . '</span><textarea id="comment" name="comment" cols="45" rows="8" maxlength="65525" aria-required="true" required="required"></textarea></p>';

    $comment_args = array(
        'comment_field' => $commentStr,
        'label_submit' => 'Comment'
    );
    comment_form($comment_args);  
?>