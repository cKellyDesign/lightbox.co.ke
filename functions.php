<?php


	// Include Theme Styles
	add_action('wp_enqueue_scripts', 'my_theme_enqueue_styles');
	function my_theme_enqueue_styles() {
		wp_enqueue_style( 'parent-style', get_template_directory_uri() . '/style.css' );
	}


	// Include Theme JS Files
	add_action('wp_enqueue_scripts', 'theme_scripts');
	function theme_scripts() {
		wp_enqueue_script( 'theme_scripts', 
												get_stylesheet_directory_uri() . '/LightBox.js', 
												array( 'jquery' ), 
												'1.0',
												true);
	}


	// Allow SVG files to be uploaded
	function cc_mime_types($mimes) {
	  $mimes['svg'] = 'image/svg+xml';
	  return $mimes;
	}
	add_filter('upload_mimes', 'cc_mime_types');


	//Page Slug Body Class
	function add_slug_body_class( $classes ) {
		global $post;
		if ( isset( $post ) ) {
			$classes[] = $post->post_type . '-' . $post->post_name;
		}
		return $classes;
	}
	add_filter( 'body_class', 'add_slug_body_class' );


	// Create Contributor subcategory based on User slug
	add_action('bp_core_activated_user', 'createCategoryForUser');
	function createCategoryForUser (  $user_id ) {
		$user = get_user_by('ID', $user_id);
		if (in_array('contributor', $user->roles)) {
			$userSlug = $user->data->user_nicename;
			$newCatSlug = '_' . $userSlug;
			$parentCat = get_category_by_slug('contributors');
			$newAuthCat = wp_create_category($newCatSlug, $parentCat->cat_ID);
			// return $newAuthCat;
		}
	}


	// Delete Contributor subcategory when user is deleted
	add_action('delete_user','deleteCategoryForUser');
	function deleteCategoryForUser ( $user_id ) {
		$user = get_user_by('ID', $user_id);
		$categoryToDelete = get_category_by_slug('_' . $user->data->user_nicename);
		if ( $categoryToDelete instanceof WP_Term) {
			wp_delete_category($categoryToDelete->cat_ID);
		}
	}

  
	// Render Videos on profile pages based on Contributor category
	add_action('bp_after_profile_content', 'renderUserProfileVideos');
	function renderUserProfileVideos () {
		$uri = $_SERVER['REQUEST_URI'];
		$uriParts = explode("/", $uri);
		$slugIndex = (count($uriParts) - 2);
		$userSlug = $uriParts[$slugIndex];

		$args = array(
			'post_type' => 'attachment',
	    'post_mime_type' =>'video',
	    'post_status' => 'inherit',
	    'orderby' => 'date',
	    'posts_per_page' => -1,
	    'category_name' => _. $userSlug
		);

		$query_vids = new WP_Query( $args );
	  $vids = array();
	  foreach ( $query_vids->posts as $vid) {
	    $vids[]= $vid;
	  }

	  if ( count($vids) ) { ?>
			<section id="user-videos">
			  <hr class="profile_videos">
				<div class="profile_videos_header_container">
					<h3 class="profile_videos_header">Videos</h3>
				</div>
				<div class="profile_videos_thumbs_container">
		  <?php
		  foreach ( $vids as $vid ) {
				$id = $vid->ID;
				$thumb = get_the_post_thumbnail($id); // returns as full img tag
				$href = get_attachment_link($id);
				$title = get_the_title($id);
				$video_meta = wp_get_attachment_metadata($id);

				if ( $thumb ) { ?>
					<div class="video-thumnails">
						<a href="<?php echo $href; ?>">
							<?php echo $thumb; ?>
							<span class="video-title"><?php echo $title; ?> | <?php echo $video_meta['length_formatted']; ?>
								<?php if ( $vid->post_excerpt) { echo '<p class="video-caption">' . $vid->post_excerpt . '</p>'; } ?>
							</span>
						</a>
					</div>
				<?php } // end if thumb
			} // end foreach
			echo '</div></section>';
		} // end if count
	}

	
	// Apply custom profile page title based on author name using Yoast SEO filter
	if ( isAuthorPage($uri) ) {
		add_filter('wpseo_title', 'getAuthorTitleString');
	}

	// Determine if current page is buddypress profile page from uri
	function isAuthorPage () {
		$uri = $_SERVER['REQUEST_URI'];
		if ( strpos($uri, '/members/') === false ) {
			return false;
		}

		$uriParts = explode("/", $uri);
		if ( count($uriParts) !== 5 ) {
			return false;
		}

		return true;
	}

	// Build Title String off of Author Display Name
	function getAuthorTitleString () {
		$uri = $_SERVER['REQUEST_URI'];
		$uriParts = explode("/", $uri);
		$slugIndex = (count($uriParts) - 2);
		$userSlug = $uriParts[$slugIndex];
		$author = get_user_by('slug', $userSlug);

		return $author->data->display_name . ' | LightBox';
	}

	add_action('getPostAuthorJSONstring', 'getPostAuthorCats');
	function getPostAuthorCats ( $vid_id ) {
		$postCats = get_the_category( $vid_id );
  	$contributors = array();
  	$contributorsStr = '[';
  	// print_r($postCats);
  	if ( count($postCats) ) {
    	foreach ($postCats as $key=>$postCat) {
    		$_location = strpos($postCat->slug, '_');
    		if ( $_location !== false && $_location === 0 ) {
    			$userSlug = substr($postCat->slug, 1);
    			$thisUser = get_user_by('slug', $userSlug);
    			// print_r($thisUser);
    			$contributors[]=$thisUser;
    		}
    	}
    }
    
    if ( count($contributors) ) {
    	foreach ($contributors as $key => $thisContributor) {
    		$contributorsStr = $contributorsStr . '{ "name":"' . $thisContributor->data->display_name . '","slug":"' . $thisContributor->data->user_nicename . '"}';
    		if ( count($contributors) > 0 && $key < ( count($contributors) - 1 ) ) { 
    			$contributorsStr = $contributorsStr . ',';
    		}
    	}
    }
    $contributorsStr = $contributorsStr . ']';
    return $contributorsStr;
	}
?>