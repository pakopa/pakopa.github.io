$( document ).ready( function() {

	var canvas = $( '#content' )[ 0 ]
	var context = canvas.getContext( "2d" );

	var image = new Image;
	image.onload = function() {
		//console.info( 'Image loaded' );
		var w = image.width * $( '#zoom' ).val() / 100;
		var h = image.height * $( '#zoom' ).val() / 100;
		$( '#content' ).attr( 'width', w );
		$( '#content' ).attr( 'height', h );
		context.drawImage( image, 0, 0, w, h );

		$( '#size' ).text( w + ' x ' + h + ' px' );
	};

	image.onerror = function() {
		console.info( 'Image not loaded' );

		$( '#content' ).attr( 'width', 200 );
		$( '#content' ).attr( 'height', 200 );
		context.font = "48px sans-serif";
		context.fillText( 'Error', 10, 120 );
	};

	$( '#refresh' ).on( 'click', load );

	$( '#zoom' ).on( 'change', load );

	function load() {
		if ( $( '#inputFile' ).val() ) {
			$( '#inputFile' ).trigger( 'change' );
		} else if ( $( '#input' ).val() ) {
			$( '#input' ).trigger( 'input' );
		} else {

		}
	}

	$( "#inputFile" ).on( 'change', function( e ) {

		var file = e.target.files[ 0 ];

		//console.info('File Changed', file)
		var reader = new FileReader();

		reader.onload = function( loadEvent ) {
			image.src = loadEvent.target.result;
		};

		reader.readAsDataURL( file )
	} );

	$( '#input' ).on( 'input', function( e ) {
		image.src = $( '#input' ).val();
	} );
} );
