<?php 
 	// the_content(); 

 	$section = $_GET['sections'];
 	$categories = $_GET['categories'];
 	$tags = $_GET['tags'];
 	$content = $_GET['contents'];

 	$cats = $section . ',' . $categories . ',' . $tags;

 	echo $cats;
 	$args = array(
      'post_type' => 'attachment',
      'post_mime_type' =>'video',
      'post_status' => 'inherit',
      'orderby' => 'date',
      'posts_per_page' => -1
  );

  if ( $cats !== ',,') {
  	$args['category_name'] = $cats;
  }

  $query_vids = new WP_Query( $args );
  $vids = array();
  foreach ( $query_vids->posts as $vid) {
      $vids[]= $vid;
  }

	foreach ( $vids as $vid ) {
		$id = $vid->ID;
		$thumb = get_the_post_thumbnail($id); // returns as full img tag
		$href = get_attachment_link($id);
		$title = get_the_title($id);
		$video_meta = wp_get_attachment_metadata($id);

		// print_r($vid);

		if ( $thumb ) { ?>
			<div class="video-thumnails">
				<a href="<?php echo $href; ?>">
					<?php echo $thumb; ?>
					<span class="video-title"><?php echo $title; ?> | <?php echo $video_meta['length_formatted']; ?>
						<?php if ( $vid->post_excerpt) { echo '<p class="video-caption">' . $vid->post_excerpt . '</p>'; } ?>
					</span>
				</a>
			</div>
		<?php }
	}

 ?>