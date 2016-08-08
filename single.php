<?php 
/** 
 * The Template for displaying all single posts
 */

global $wdwt_front,
  $post;
	get_header(); 
	$sauron_meta = get_post_meta($post->ID, WDWT_META,TRUE);
  $show_featured_image = $wdwt_front->get_param('show_featured_image', $sauron_meta, true);
?>
<div class="right_container">
  <div  class="container">
  	<?php if ( is_active_sidebar( 'sidebar-1' ) ) { ?>
		<aside id="sidebar1" >
			<div class="sidebar-container">			
				<?php  dynamic_sidebar( 'sidebar-1' ); 	?>
				<div class="clear"></div>
			</div>
		</aside>
	<?php } ?>
	<div id="content">
    
		<?php if(have_posts()) : ?><?php while(have_posts()) : the_post(); ?>
		
		<div class="single-post">
			<h2 class="page-header"><?php the_title(); ?></h2>
		<?php 	$tumb_id = get_post_thumbnail_id( $post->ID );  
				$thumb_url=wp_get_attachment_image_src($tumb_id,'full');
				
				if( $thumb_url ) {
					$thumb_url = $thumb_url[0];
				}  
				else {
					$thumb_url = sauron_frontend_functions::catch_that_image();
					$thumb_url = $thumb_url['src'];
				}
				$background_image = $thumb_url;
				list($image_thumb_width, $image_thumb_height) = getimagesize($background_image);
				$has_thumb = true;
				if (strpos($background_image,'default.png') !== false) {
					$has_thumb = false;
				}
			     ?>
				<?php if(has_post_thumbnail() && $show_featured_image){ ?>
					<div class="post-thumbnail-div">
						 <div class="img_container fixed searched size250x180">
							<?php echo sauron_frontend_functions::fixed_thumbnail(250, 180, false); ?>
						 </div>
					</div>
				<?php } ?>	
			  <div class="entry">	
			    <?php the_content(); ?>
			    <?=function_exists('thumbs_rating_getlink') ? thumbs_rating_getlink() : ''?>
			    <?php
			    	// Looks up and retrieves videos with similar categories
			    	$thisId = get_the_ID();
			    	$cats = wp_get_post_categories($thisId);
			    	$catStr = implode(',',$cats);

			    	$args = array(
			    		'post_type' => 'attachment',
				      'post_mime_type' =>'video',
				      'post_status' => 'inherit',
			    		'category__in' => $cats,
			    		'posts_per_page' => 3,
			    		'post__not_in' => array($thisId)
			    	);

			    	$query_vids = new WP_Query( $args );

			    	if ( count($query_vids->posts) ) {

						  $title = get_the_title($thisId);
						  $thumb = get_the_post_thumbnail($thisId); // returns as full img tag
							$href = get_attachment_link($thisId);
							$title = get_the_title($thisId);
							$video_meta = wp_get_attachment_metadata($thisId);
							$vid_src = wp_get_attachment_url($thisId);
							$featuredImageUrl = wp_get_attachment_url( get_post_thumbnail_id($thisId) );
							$postDesc = get_the_excerpt($thisId);
							$vidContributors = getPostAuthorCats($thisId);

							// Checks if post description is empty and providing the fallback canonic url instead
							if ( strpos($postDesc, 'http') !== false ) {
								$postDesc = false;
							}

							// First render thumbnail of current video
						  ?>
						  	<div class="related-videos" data-vid-id="<?php echo $thisId; ?>">
						  		<div 	class="video-thumnails current" 
						  					data-vid-id="<?php echo $thisId; ?>" 
						  					data-vid-title="<?php echo $title; ?>" 
						  					data-vid-guid="<?php echo $href; ?>" 
						  					data-vid-src="<?php echo $vid_src; ?>"
						  					data-vid-img="<?php echo $featuredImageUrl; ?>"
						  					data-vid-desc="<?php echo $postDesc; ?>"
						  					data-vid-contrib='<?php echo $vidContributors; ?>'>
										<a href="<?php echo $href; ?>">
											<?php echo $thumb; ?>
											<span class="video-title"><?php echo $title; ?> | <?php echo $video_meta['length_formatted']; ?>
												<?php if ($postDesc) { echo '<p class="video-caption">' . $postDesc . '</p>'; } ?>
											</span>
										</a>
										<span class="now-playing">Now Playing</span>
									</div>
						  <?php 

						  $vids = array();
						  foreach ( $query_vids->posts as $key=>$vid) {
						      $vids[]= $vid;
						  }

						  // Loop through all related videos and render thumbnails
						  foreach ( $vids as $vid ) {

								$id = $vid->ID;
								$thumb = get_the_post_thumbnail($id); // returns as full img tag
								$href = get_attachment_link($id);
								$title = get_the_title($id);
								$video_meta = wp_get_attachment_metadata($id);
								$vid_src = wp_get_attachment_url($id);
								$featuredImageUrl = wp_get_attachment_url( get_post_thumbnail_id($id) );
								$vid_contributors = getPostAuthorCats($id);

								if ( $thumb ) { ?>
									<div 	class="video-thumnails" 
												data-vid-id="<?php echo $id; ?>" 
												data-vid-title="<?php echo $title; ?>" 
												data-vid-guid="<?php echo $href; ?>" 
												data-vid-src="<?php echo $vid_src; ?>"
												data-vid-img="<?php echo $featuredImageUrl; ?>"
						  					data-vid-desc="<?php echo $vid->post_excerpt; ?>"
						  					data-vid-contrib='<?php echo $vid_contributors; ?>'>
						  			
										<a href="<?php echo $href; ?>">
											<?php echo $thumb; ?>
											<span class="video-title"><?php echo $title; ?> | <?php echo $video_meta['length_formatted']; ?>
												<?php if ( $vid->post_excerpt) { echo '<p class="video-caption">' . $vid->post_excerpt . '</p>'; } ?>
											</span>
										</a>
										<span class="now-playing">Now Playing</span>
									</div>
								<?php 
								}
							}
							echo "</div>";
						}
			    ?>
			  </div>
      <?php 
      if($wdwt_front->get_param('date_enable', $sauron_meta, false)){ ?>
			<div class="entry-meta">
				  <?php sauron_frontend_functions::posted_on_single(); 
						sauron_frontend_functions::entry_meta();
				  ?>
			</div>
			 <?php }?>
			<?php
			wp_link_pages(); 
			sauron_frontend_functions::post_nav(); ?>
			<div class="clear"></div>
			<?php
				  
				   wp_reset_query();
					  if( ( comments_open() && is_user_logged_in() ) || get_comments_number() )
					  {  ?>
							<div class="comments-template">
								<hr class="comments_header_hr">
								<div class="comments_header_container">
									<h3 class="comments_header">Director / Producer Comments</h3>
								</div>
								<?php comments_template();	?>
							</div>
					<?php
						}		
					?>
			</div>

		<?php endwhile; ?>

		<?php endif;   ?>
	</div>

	<?php if ( is_active_sidebar( 'sidebar-2' ) ) { ?>
		<aside id="sidebar2">
			<div class="sidebar-container">
			  <?php  dynamic_sidebar( 'sidebar-2' ); 	?>
			  <div class="clear"></div>
			</div>
		</aside>
		<?php } ?>
		<div class="clear"></div>
	</div>
	
</div>
<?php get_footer(); ?>