jQuery( function( $ ) {

	$.ajax( {
		url : ajaxurl,
		data : {
			action : 'themify_news_widget'
		},
		success : function ( resp ) {
			$( '#themify_news .rss-widget' ).append( resp );
		}
	} );

} );