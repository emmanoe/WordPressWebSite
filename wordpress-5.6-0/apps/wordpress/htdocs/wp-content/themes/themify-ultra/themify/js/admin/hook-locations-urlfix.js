jQuery(function($){

	'use strict';
	$('a').each(function(el){
		$(this).attr('href', Themify.UpdateQueryString( 'tp', '1', $(this).attr('href') ) );
	});

});