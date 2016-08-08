(function(scope, $){

	var filterHandler = function () {
		$('.button-submit').removeAttr('onclick').click(filterVideos);
		$('.button-reset').on('click', function (e) { $('.wdform_row').show(); });
		$('input[type="radio"]').on('click', toggleFilterFields);
		checkBoxes();
	}

	function checkBoxes () {
		// if no query string, check all "Section" boxes
		var queryString = window.location.href.indexOf('?') === -1 ? 
											'sections=social-awareness,education,out-of-the-box&contents=videos' : 
											window.location.href.split('?')[1];
		
		var $checboxes = $('.wdform_page input[type="checkbox"], .wdform_page input[type="radio"]');
		$.each($checboxes, function (i, $check) {
			var value = $($check).attr('value');
			value = value.toLowerCase();
			value = value.replace(/ /g ,'-');

			if ( queryString.indexOf(value) !== -1 ) { 
				$check.checked = true;
			}
		});	

		if ( queryString.indexOf('contents=directors') !== -1 ) {
			$('input[value="Directors"]').click();
		} else if ( queryString.indexOf('contents=producers') !== -1 ) {
			$('input[value="Producers"]').click();
		}
	}

	function filterVideos (e) {
		var query = '?',
				sections = 'sections=',
				categories = 'categories=',
				tags = 'tags=',
				contents = 'contents=';

		var $checboxes = $('.wdform_page input[type="checkbox"], .wdform_page input[type="radio"]');
		$.each($checboxes, function (i, $check) {

			if ( $check.checked ) {
				var val = $($check).attr('value');
				var $parent = $($check).parents('.wdform-element-section');

				if ( $($parent).hasClass('filter-section') ) {
					sections = appendQuery(sections, val);
				} else if ( $($parent).hasClass('filter-categories') ) {
					categories = appendQuery(categories, val);
				} else if ( $($parent).hasClass('filter-tags') ) {
					tags = appendQuery(tags, val);
				} else if ( $($parent).hasClass('filter-content') ) {
					contents = appendQuery(contents, val);
				}

			}
		});

		if ( sections !== 'sections=' ) {
			query = query + sections;
		}

		if ( categories !== 'categories=' ) {
			if ( query !== '?' ) query = query + '&';
			query = query + categories;
		}

		if ( tags !== 'tags=' ) {
			if ( query !== '?' ) query = query + '&';
			query = query + tags;
		}

		if ( contents !== 'contents=' ) {
			if ( query !== '?' ) query = query + '&';
			query = query + contents;
		}

		var url = window.location.href.split('?')[0] + ( query === '?' ? '' : query );
		window.location.href = url;

	}

	function appendQuery (base, value) {
		value = value.toLowerCase();
		value = value.replace(/ /g ,'-');
		if ( base[base.length - 1] === "=" ) {
			base = base + value;
		} else {
			base = base + ',' + value;
		}
		return base;
	}

	// Hide video filter options when filtering for directors / producers
	function toggleFilterFields (e) {
		var contentType = $(e.target).attr('value').toLowerCase().replace(/ /g,'-');
		if (contentType === 'videos') {
			checkBoxes();
			$('.wdform_row').show();
		} else {
			$('.wdform_row').hide();
			$(e.target).parents('.wdform_row').show();
			$('.button-submit').parents('.wdform_row').show();

			$.each($('.wdform_page input[type="checkbox"]'), function (i, $check) {
				$check.checked = false;
			});
		}
	}



	setTimeout(function(){
		scope.filterHandler = new filterHandler();
	},500);
})(window, jQuery)