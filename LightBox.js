(function(scope, $){
	scope.$ = $;
	scope.Lbx = scope.Lbx || {};
	handleSiteWide();

	if ( $('body').hasClass('home') ) {
		handleHome();
	} else if ( $('body').hasClass('page-about') ) {
		setTimeout(handleAbout, 750);
	}	else if ( $('body').hasClass('attachment-mp4') ) {
		handleCanonical();
	} else if ( $('body').hasClass('page-contact') ) {
		setTimeout(handleContact, 750);
	} else if ( $('body').hasClass('profile') ) {
		handleProfile();
	}

	function handleProfile() {
		$.get('/wp-json/wp/v2/media', function (data) {
			console.log(data);
		});
	}

	function handleCanonical() {
		// Over ride submit button ID for styling
		scope.Lbx.timingStartLoad = (new Date).getTime();
		$('body').addClass('page-id-10');
		if ( $('body').hasClass('logged-in') ) {
			$('#submit').attr('id', 'submit-comment');
		}

		// Video Rating Subscription and Logics
		setTimeout(function(){
			subscribeVideoRatingsClick();
			setVideoRating();
			createContributorLinks();
		},200);

		function createContributorLinks () {
			
			if ( !$('.entry > p').length ) {
				$('.wp-video').after('<p></p>');
			}
			if ( !$('.canonic_vid_contributors_container').length ) {
				$('.entry > p').append('<div class="canonic_vid_contributors_container"></div>');
			}
			$('.canonic_vid_contributors_container').html('');
			var contributors = $('.current').data('vid-contrib');
			$.each(contributors, function (i, contributor) {
				// var thisLink = $('<a class="canonic_vid_contributors" href="/lightbox.co.ke/members/' + contributor.slug + '>' + contributor.name +'</a>');
				var thisLink = $('<a class="canonic_vid_contributors"></a>');
				thisLink.attr('href', '/lightbox.co.ke/members/' + contributor.slug)
								.html(contributor.name);

				// if ( contributors.length > 1 && i < ( contributors.length - 1 ) ) thisLink = thisLink + ', ';
				console.log(thisLink);
				$('.canonic_vid_contributors_container').append(thisLink);
				if ( contributors.length > 1 && i < ( contributors.length - 1 ) ) $('.canonic_vid_contributors_container').append(', ');
			});
		}

		function subscribeVideoRatingsClick () {
			$('.thumbs-rating-container').off('click', onVideoRatingClick);
			$('.thumbs-rating-container').on('click', onVideoRatingClick);
		}

		function onVideoRatingClick (e) {
			if ( $(e.srcElement).hasClass('thumbs-rating-container') ) return;
			var id = $(this).data('content-id'),
					type = $(e.srcElement).hasClass('thumbs-rating-up') ? 1 : 2;

			trackVideoRating(id, type);
			thumbs_rating_vote(id, type);
		}

		function setVideoRating () {
			var id = $('.video-thumnails.current').data('vid-id');
			// console.log('video rating id', id);
			$('.thumbs-rating-container').attr('id', 'thumbs-rating-' + id);

			$('.thumbs-rating-up').removeAttr('onclick');
			$('.thumbs-rating-down').removeAttr('onclick');
			$('.thumbs-rating-voted').removeClass('thumbs-rating-voted');
			$('.thumbs-rating-container').data('content-id', id);

			// If logged in, make vote count visible (delayed) on hover
			if ( $('body').hasClass('logged-in') ) {
				$('.thumbs-rating-up').attr('title', $('.thumbs-rating-up').text() + ' Votes');
				$('.thumbs-rating-down').attr('title', $('.thumbs-rating-down').text() + ' Votes');
			}

			if ( localStorage.getItem('thumbsrating' + id) ) {
				if ( localStorage.getItem("thumbsrating" + id + "-1") ) {
					$('.thumbs-rating-up').addClass('thumbs-rating-voted');
				} else {
					$('.thumbs-rating-down').addClass('thumbs-rating-voted');
				}
			}

			$('.thumbs-rating-already-voted').attr('style', '');
			subscribeVideoRatingsClick();
		}

		// Video Social Buttons
		var videoShares = '<div class="video-share">';
		var buttonFbStr = '<div class="share-button fb-share"><button type="button" title="fb-share" label="Share This Video"></div>';
		var buttonTwStr = '<div class="share-button tw-share"><button type="button" title="tw-share" label="Tweet This Video"></div>';
		$('.wp-video').prepend(videoShares + buttonFbStr + buttonTwStr + '</div>');

		$('.fb-share').on('click', function (e) {
			var shareUrl = 'http://ckellydesign.net' + ( window.location.pathname.replace('.co.ke', '') );
			// window.open('https://www.facebook.com/sharer/sharer.php?u=' + (window.location.href), 'share on facebook');
			window.open('https://www.facebook.com/sharer/sharer.php?u=' + shareUrl, 'share on facebook', 'width=300');
			
			var vidTitle = $('.video-thumnails.current').data('vid-title');
			ga('send', 'event', 'Social', 'share-vid-fb', vidTitle);
		});

		$('.tw-share').on('click', function (e) {
			var shareUrl = encodeURI('http://ckellydesign.net' + ( window.location.pathname.replace('.co.ke', '') ));
			var vidTitle = $('.video-thumnails.current').data('vid-title');
			var vidDesc = $('.video-thumnails.current').data('vid-desc');

			var shareText = vidTitle + ' | Lightbox.co.ke' + ( vidDesc.length ? '\n' + vidDesc : '') + '\n\n';
			shareText = encodeURI(shareText);
			
			window.open('https://twitter.com/intent/tweet?text=' + shareText + '&url=' + shareUrl, 'Share this video on Twitter', 'width=400' );
			ga('send', 'event', 'Social', 'share-vid-tw', vidTitle);
		});


		// Check for Autoplay
		if ( window.location.href.indexOf('?') !== -1 && window.location.href.split('?')[1].indexOf('autoplay') !== -1 ) {
			setTimeout(function(){
				$('.mejs-overlay-button').click();
			}, 250);
		}


		// VIDEO EVENTS - for continuous play and video event tracking

		var $video = null;
		// Define Meta Data Nodes
		scope.Lbx.meta = {
			$title: $('meta[property="og:title"]'),
			$guid: $('meta[property="og:url"]'),
			$image: $('meta[property="og:image"]'),
			initialVideoTitle: $('meta[property="og:title"]').attr('content')
		};

		setTimeout(getNextVideo, 500);
		setTimeout(subscribeVideoEvents, 100);

		function subscribeVideoEvents () {
			// Define Video
			$video = $('video');

			// Rendering Events
			$video.on('play', function (e) { $('body').addClass('playing').removeClass('paused'); });
			$video.on('pause', function (e) { $('body').addClass('paused').removeClass('playing'); });

			// Continuous Play
			$video.on('ended', function() { setTimeout(onContinuousPlay, 100); });
			$video.one('playing', function () { 
				$('video').on('emptied', function (e) { this.play(); }); 
			});

			// Analytics Events
			$('.mejs-overlay-play, .mejs-play').on('click', trackInitialPlay);
			$video.on('progress', trackFirstFrame); 
			$video.on('timeupdate', trackVideoPercentiles);
			$video.on('ended', trackVideoComplete);
			$video.on('pause', trackVideoPause);
			$video.on('seeked', trackSeekEvent);
		}

		// ************ Analytics ************

		// Track Initial Play video click
		function trackInitialPlay (e) {
			scope.Lbx.timingPlayClick = (new Date).getTime();
			var timeToClick = scope.Lbx.timingPlayClick - scope.Lbx.timingStartLoad;
			var vidTitle = scope.Lbx.meta.$title.attr('content');

			ga('send', 'event', 'Video', 'play-click', vidTitle);
			ga('send', 'timing', 'User Timing', 'time-to-click', timeToClick, vidTitle);

			$('.mejs-overlay-play, .mejs-play').off('click', trackInitialPlay);
		};
		
		// Track time between play click and first frame
		function trackFirstFrame (e) {
			if (typeof scope.Lbx.timingPlayClick === 'undefined' ) return;

			scope.Lbx.timingFirstFrame = (new Date).getTime();
			var timeToFirstFrame = scope.Lbx.timingFirstFrame - scope.Lbx.timingPlayClick;
			var vidTitle = scope.Lbx.meta.$title.attr('content');
			
			ga('send', 'timing', 'Video Timing', 'time-to-first-frame', timeToFirstFrame, vidTitle);
			$video.off('progress', trackFirstFrame);
		}

		// Track percentiles of video playback
		scope.Lbx.percentilesTracked = { 'quarter': false, 'half': false, 'threeQuarters': false };
		function trackVideoPercentiles (e) {
			var position = this.currentTime / this.duration;

			if ( !scope.Lbx.percentilesTracked.quarter && position < .5 && position >= .25 ) {
				scope.Lbx.percentilesTracked.quarter = true;
				ga('send', 'event', 'Video', 'percentile-25', scope.Lbx.meta.$title.attr('content'), ($('.video-thumnails.current').index() + 1));
			} else
			if ( !scope.Lbx.percentilesTracked.half && position < .75 && position >= .5 ) {
				scope.Lbx.percentilesTracked.half = true;
				ga('send', 'event', 'Video', 'percentile-50', scope.Lbx.meta.$title.attr('content'), ($('.video-thumnails.current').index() + 1));
			} else
			if ( !scope.Lbx.percentilesTracked.threeQuarters && position >= .75 ) {
				scope.Lbx.percentilesTracked.threeQuarters = true;
				ga('send', 'event', 'Video', 'percentile-75', scope.Lbx.meta.$title.attr('content'), ($('.video-thumnails.current').index() + 1));
			}
		}

		// Track title and play index of completed video
		function trackVideoComplete (e) {
			var vidTitle = scope.Lbx.meta.$title.attr('content');
			var vidIndex = $('.video-thumnails.current').index() + 1;
			ga('send', 'event', 'Video', 'video-end', vidTitle, vidIndex);
		}

		// Track title and play index of continuous play
		function trackContinuousPlay () {
			var vidTitle = scope.Lbx.meta.$title.attr('content');
			var vidIndex = $('.video-thumnails.current').index() + 1;
			ga('send', 'event', 'Video', 'continuous-play', scope.Lbx.meta.initialVideoTitle, vidIndex);
		}

		// Track title and playhead position of pause event
		function trackVideoPause (e) {
			scope.Lbx.timingPauseStart = (new Date).getTime();
			var vidTitle = scope.Lbx.meta.$title.attr('content');
			var vidProgress = Math.round($video[0].currentTime);
			$video.on('play', trackVideoUnpause);
			ga('send', 'event', 'Video', 'pause', vidTitle, vidProgress);
		}

		// Track title and pause duration on when unpausing
		function trackVideoUnpause (e) {
			scope.Lbx.timingPauseEnd = (new Date).getTime();
			var pauseDuration = scope.Lbx.timingPauseEnd - scope.Lbx.timingPauseStart;
			var vidTitle = scope.Lbx.meta.$title.attr('content');
			ga('send', 'timing', 'User Timing', 'pause-duration', pauseDuration, vidTitle);
			$video.off('play', trackVideoUnpause);
		}

		// Track when user seeks back or forth through the video
		function trackSeekEvent (e) {
			var vidTitle = scope.Lbx.meta.$title.attr('content');
			ga('send', 'event', 'Video', 'seek', vidTitle);
		}

		function trackVideoRating (id, type) {
			var vidTitle = scope.Lbx.meta.$title.attr('content'),
					eventName = type == 1 ? 'video-vote-up' : 'video-vote-down';

			if ( !localStorage.getItem('thumbsrating'+id) ) {
				ga('send','event', 'Rating', eventName, vidTitle);
			}
		}


		// ************ Continuous Play ************

		function getNextVideo () {
			// Determine Next Video Thumbnail
			scope.Lbx.nextIndex = ($('.video-thumnails.current').index()) + 1;
			var isNextVid = $('.video-thumnails').length > scope.Lbx.nextIndex;

			// Capture bootstrapped Video Data
			scope.Lbx.$nextVid = isNextVid ? $('.video-thumnails').eq(scope.Lbx.nextIndex) : null; 
			scope.Lbx.nextURL = isNextVid ? scope.Lbx.$nextVid.data('vid-guid') : '';
			scope.Lbx.nextTitle = isNextVid ? scope.Lbx.$nextVid.data('vid-title') : '';
			scope.Lbx.nextSrc = isNextVid ? scope.Lbx.$nextVid.data('vid-src') : '';
		}

		function setMetaTags () {
			$('meta[property="og:title"]').attr('content', scope.Lbx.nextTitle);
			$('meta[property="og:url"]').attr('content', scope.Lbx.nextURL);
			$('meta[property="og:image"]').attr('content', scope.Lbx.nextSrc);
			$('title').html(scope.Lbx.nextTitle + ' | Lightbox');
		}

		function onContinuousPlay (e) {			
			if ( !scope.Lbx.$nextVid  ) return;

			// Update Metatags
			$('meta[property="og:title"]').attr('content', scope.Lbx.nextTitle + ' | Lightbox.co.ke');
			$('meta[property="og:url"]').attr('content', scope.Lbx.nextURL);
			$('meta[property="og:image"]').attr('content', scope.Lbx.nextSrc);
			$('title').html(scope.Lbx.nextTitle + ' | Lightbox');

			// Reset tracking percentiles logic
			scope.Lbx.percentilesTracked = { 'quarter': false, 'half': false, 'threeQuarters': false };

			// Update page Elements
			$('.page-header').html(scope.Lbx.nextTitle);
			$('.video-thumnails.current').removeClass('current');
			scope.Lbx.$nextVid.addClass('current');
			createContributorLinks();

			// Update page URL
			window.history.pushState("", scope.Lbx.nextTitle, scope.Lbx.nextURL);

			// Update Video Src URL
			$('video.wp-video-shortcode, video.wp-video-shortcode > source').attr('src', scope.Lbx.nextSrc);
			$('.wp-video-shortcode > a').attr('href', scope.Lbx.nextSrc);
			trackContinuousPlay();
			
			// Get info for Next Video
			setVideoRating();
			getNextVideo();
		}
	}


	function handleSiteWide() {
		// set color of nav underline
		setTimeout(updateNavColor, 100);
		// setTimeout(onBodyResize, 100);
		// setStickyFooter();
		// $(window).on('resize', setStickyFoot	er);
		// $('body').on('resize', setStickyFooter);
		// console.log('body length', $('body').length);
		function updateNavColor () {
			var style = $('ul#top-nav-list li.backLava, .lavalamp-object').attr('style');		
			style = style + ' border-bottom-color: #ffcc00 !important;';

			$('ul#top-nav-list li.backLava, .lavalamp-object').attr('style', style);
		}
		// var body = $('body')[0];
		// function onBodyResize (e) {
		// 	if ( window.innerHeight > $('body').innerHeight() ) {
		// 		$('.custom-footer').addClass('stickyFooter');
		// 	} else {
		// 		$('.custom-footer').removeClass('stickyFooter');
		// 	}
		// }

		// window.addResizeListener(body, onBodyResize);

		$(window).on('resize', function() {
			updateNavColor();
		});

		// prevent content from jumping around as header becomes sticky / not sticky
		// $(window).scroll(function(){
		// 		if ( $(window).scrollTop() > 0) {
		// 			$('body').css('margin-top', '61px');
		// 		} else {
		// 			$('body').css('margin-top', '0px');
		// 		}
		// });

		$('#menu-social-footer-menu a').on('click', function (e) {
			var title = $(e.target).attr('title').toLowerCase(),
					eventTitle = 'visit-' + title + 'click';
			
			ga('send', 'event', 'Social', eventTitle);
		});
	}


	function handleHome() {
		// move image captions within image links
		$.each($('.content-column'), function(i, $col) {
			$($('.wp-caption a')[i]).append('<div class="caption_wrapper"></div>');
			var $wrap = $('.caption_wrapper')[i],
					$cap = $('.wp-caption-text')[i];

			$($wrap).append($cap);	
		});
	}


	function handleAbout() {
		// Set slider max height based off of width
		setHeightWidth();
		setHeightWidth(); // setting the first time changes things and has to be recalculated

		// add class for fixing height
		$('.advps-slide').addClass('ready');

		function setHeightWidth () {
			var width = $('div.entry').outerWidth();
			var height = width * 0.5625;

			$('.bx-wrapper').css('height', height	+ 'px');
			$('.mejs-container').css('height', height	+ 'px').css('width', width	+ 'px');
		}
	}


	function handleContact () {
		// Set height and width of map iframe
		var width = $('#contact_map').parent('p').innerWidth(),
				height = width * 0.5625;

		$('#contact_map').attr('data-origwidth', width)
										 .attr('data-aspectratio', 0.5625)
										 .css('height', height + 'px')
										 .css('width', width + 'px');
	}


	






})(window, jQuery)




// Overwriting this plugin's function to cleanup the functionality and enable styling and positioning of the outermost container that otherwise lost it's ID and class attributes
function thumbs_rating_vote (ID, type) {
	// For the LocalStorage 
	var itemName = "thumbsrating" + ID;
	var container = '#thumbs-rating-' + ID;
	
	// Check if the LocalStorage value exist. If do nothing.
	if (!localStorage.getItem(itemName)){
	
		// Set HTML5 LocalStorage so the user can not vote again unless he clears it.
    localStorage.setItem(itemName, true);

    // Set the localStorage type as well
		var typeItemName = "thumbsrating" + ID + "-" + type; "thumbsrating" + ID;
		localStorage.setItem(typeItemName, true);
	
		// Data for the Ajax Request
		var data = {
			action: 'thumbs_rating_add_vote',
			postid: ID,
			type: type,
			nonce: thumbs_rating_ajax.nonce
		};
			
		jQuery.post(thumbs_rating_ajax.ajax_url, data, function(response) {			

			var object = jQuery(container);
			
			jQuery(object).attr('id', '');
			jQuery(object).after(response);
			jQuery(object).remove();
						
			// Add the class to the clicked element
			var new_container = '#thumbs-rating-' + ID;
			
			// Check the type
			if( type == 1){ thumbs_rating_class = ".thumbs-rating-up"; }
			else{ thumbs_rating_class = ".thumbs-rating-down"; }

			jQuery(new_container + " " + thumbs_rating_class).addClass('thumbs-rating-voted');
	
		});
	}else{

		// Display message if we detect LocalStorage
		jQuery('#thumbs-rating-' + ID + ' .thumbs-rating-already-voted').fadeIn().css('display', 'block');
	}
}

// JS for listening to element resizing
(function (scope, $){
	var attachEvent = document.attachEvent;
  var isIE = navigator.userAgent.match(/Trident/);
  
  var requestFrame = (function(){
    var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
        function(fn){ return window.setTimeout(fn, 20); };
    return function(fn){ return raf(fn); };
  })();
  
  var cancelFrame = (function(){
    var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
           window.clearTimeout;
    return function(id){ return cancel(id); };
  })();
  
  function resizeListener(e){
    var win = e.target || e.srcElement;
    if (win.__resizeRAF__) cancelFrame(win.__resizeRAF__);
    win.__resizeRAF__ = requestFrame(function(){
      var trigger = win.__resizeTrigger__;
      trigger.__resizeListeners__.forEach(function(fn){
        fn.call(trigger, e);
      });
    });
  }
  
  function objectLoad(e){
    this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
    this.contentDocument.defaultView.addEventListener('resize', resizeListener);
  }
  
  scope.addResizeListener = function(element, fn){
    if (!element.__resizeListeners__) {
      element.__resizeListeners__ = [];
      if (attachEvent) {
        element.__resizeTrigger__ = element;
        element.attachEvent('onresize', resizeListener);
      }
      else {
        if (getComputedStyle(element).position == 'static') element.style.position = 'relative';
        var obj = element.__resizeTrigger__ = document.createElement('object'); 
        obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
        obj.__resizeElement__ = element;
        obj.onload = objectLoad;
        obj.type = 'text/html';
        if (isIE) element.appendChild(obj);
        obj.data = 'about:blank';
        if (!isIE) element.appendChild(obj);
      }
    }
    element.__resizeListeners__.push(fn);
  };
  
  scope.removeResizeListener = function(element, fn){
    element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
    if (!element.__resizeListeners__.length) {
      if (attachEvent) element.detachEvent('onresize', resizeListener);
      else {
        element.__resizeTrigger__.contentDocument.defaultView.removeEventListener('resize', resizeListener);
        element.__resizeTrigger__ = !element.removeChild(element.__resizeTrigger__);
      }
    }
  };	

  var body = document.getElementsByTagName('body')[0];
	function onBodyResize (e) {
		if ( window.innerHeight > $('body').innerHeight() ) {
			$('.custom-footer').addClass('stickyFooter');
		} else {
			$('.custom-footer').removeClass('stickyFooter');
		}
	}

	window.addResizeListener(body, onBodyResize);
	$(window).on('resize', onBodyResize);

})(window, jQuery)
