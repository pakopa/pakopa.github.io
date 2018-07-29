( function ( window, document, undefined ) {
	'use sctrict';

	// A little helper function
	function $( selector ) {
		return document.querySelector( selector );
	}

	// Setup drawing events
	var actions = $( '#actions' );
	actions.addEventListener( 'touchstart', handleStart, false );
	actions.addEventListener( 'mousedown', handleStart, false );
	actions.addEventListener( 'touchmove', function ( evt ) {

		if ( evt.touches.length == 1 ) {
			evt.preventDefault();
			handleMove( evt.touches[0] );
		} else {
			console.debug( 'Ignored touch event', evt );
			return true;
		}
	}, false );
	actions.addEventListener( 'mousemove', function ( evt ) {

		// Check for mousedown status
		if ( evt.buttons & 1 == 1 ) {
			evt.preventDefault();
			handleMove( evt );
		}
	}, false );

	// Setup control events
	$( '[data-action=reset]' ).addEventListener( 'click', reset, false );

	$( '[data-action=download]' ).addEventListener( 'click', handleDownload, false );

	var grid = $( 'canvas.grid' )
	$( '[name=grid]' ).addEventListener( 'change', function () {
		grid.style.visibility = this.checked ? 'visible' : 'hidden';
		console.debug( 'change grid visibility to', grid.style.visibility );
	}, false );

	$( '[name=color-advanced]' ).addEventListener( 'change', setColor, false );
	$( '[name=color]' ).addEventListener( 'change', setColor, false );
	$( '[name=background-color]' ).addEventListener( 'change', changeBackgroundColor, false );

	// Prepare the drawing context
	var canvas = $( 'canvas#main' );
	var ctx = canvas.getContext( '2d' );

	var backgroundCanvas = $( 'canvas#background' );
	var backgroundCtx = backgroundCanvas.getContext( '2d' );

	var cx, cy, splits;
	var previous = null;
	var strokeColor = '#000';
	var fillColor = '#000';
	var backgroundColors = {
		'': 'Current',
		'rgba(0, 0, 0, 0)': 'Transparent',
		'#FFF': 'White',
		'#EEE': 'Not so white',
		'#222': 'Not so black',
		'#000': 'Black'
	};

	// Calculate inital size
	var minSize = Math.floor( Math.min( window.innerHeight - canvas.getBoundingClientRect().y, window.innerWidth ) - 16 );
	$( 'input[name=size]' ).value = minSize;

	// Initialize background select
	var backgroundSelect = $( '[name=background-color]' );
	Object.keys( backgroundColors ).forEach( function ( key ) {
		var option = document.createElement( 'option' );
		option.value = key;
		option.textContent = backgroundColors[key];
		backgroundSelect.appendChild( option );
	} );

	// Default background color
	backgroundSelect.value = '#FFF';

	// Initialize the canvas
	reset();
	ctx.strokeStyle = strokeColor;

	// Helper function to get mouse position on canvas.
	function getPosition( evt, canvas ) {

		var rect = canvas.getBoundingClientRect();

		var scaleX = canvas.width / rect.width;
		var scaleY = canvas.height / rect.height;

		return {
			x: ( evt.clientX - rect.left ) * scaleX,
			y: ( evt.clientY - rect.top ) * scaleY
		};
	}

	// Establish first point
	function handleStart( evt ) {

		previous = getPosition( evt, canvas );
	}

	// Handle path for drawing
	function handleMove( target ) {

		var current = getPosition( target, canvas );

		if ( previous.x !== current.x || previous.y !== current.y ) {
			multiline( previous.x, previous.y, current.x, current.y, splits );
		}

		previous = current;

		console.debug( 'move', target );
	}

	// Symetrically draw lines following path
	function multiline( x0, y0, x1, y1, n ) {

		ctx.save();

		ctx.strokeStyle = strokeColor;
		ctx.fillStyle = fillColor;

		var diameter = parseInt( $( 'input[name=stroke]' ).value || 1 );
		ctx.lineWidth = diameter;

		ctx.translate( cx, cy );

		for ( var i = 0; i < n; i++ ) {

			ctx.beginPath();

			ctx.moveTo( x0 - cx, y0 - cy );
			ctx.lineTo( x1 - cx, y1 - cy );
			ctx.stroke();

			ctx.arc( x1 - cx, y1 - cy, diameter / 2, 0, 2 * Math.PI );
			ctx.fill();

			ctx.rotate( 2 * Math.PI / splits );
		}

		ctx.restore();
	}

	// Resets canvas to inital state
	function reset() {

		// Size and symmetry
		var size = $( 'input[name=size]' ).value || 600;
		splits = parseInt( $( 'input[name=symmetry]' ).value || 8 );

		console.debug( 'Resetting canvas with w, s', size, splits );

		var parentNode = canvas.parentNode;
		parentNode.style.width = size;
		parentNode.style.height = size;

		var bounds = parentNode.getBoundingClientRect();

		canvas.width = backgroundCanvas.width = grid.width = bounds.width;
		canvas.height = backgroundCanvas.height = grid.height = bounds.height;

		cx = canvas.width / 2;
		cy = canvas.height / 2;

		// Background
		ctx.clearRect( 0, 0, canvas.width, canvas.height );
		backgroundCtx.clearRect( 0, 0, backgroundCanvas.width, backgroundCanvas.height );

		backgroundCtx.fillStyle = $( '[name=background-color]' ).value || $( '[name=color-advanced]' ).value
		backgroundCtx.fillRect( 0, 0, backgroundCanvas.width, backgroundCanvas.height );

		// Grid
		var gridCtx = grid.getContext( '2d' );
		gridCtx.save();
		gridCtx.fillStyle = 'rgba(0, 0, 0, 0)';
		gridCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
		gridCtx.clearRect( 0, 0, canvas.width, canvas.height );

		gridCtx.save();
		gridCtx.translate( cx, cy );

		for ( var i = 0; i < splits; i++ ) {

			gridCtx.beginPath();

			gridCtx.moveTo( 0, -50 );
			gridCtx.lineTo( 0, -Math.floor( 1.5 * canvas.height / 2 ) );
			gridCtx.stroke();

			//gridCtx.arc(x1 - cx, y1 - cy, diameter / 2, 0, 2 * Math.PI);
			//gridCtx.fill();

			gridCtx.rotate( 2 * Math.PI / splits );
		}

		for ( var i = 1; i < Math.floor( canvas.width / 50 ); i++ ) {
			gridCtx.beginPath();
			gridCtx.arc( 0, 0, i * 50, 0, 2 * Math.PI );
			gridCtx.stroke();
		}

		gridCtx.restore();

		console.debug( 'Canvas reset' );

	}

	function setColor( evt ) {
		var color = evt.target.value;
		strokeColor = color;
		fillColor = color;

		$( '[name=color-advanced]' ).value = color;

		console.debug( 'set colors to', strokeColor, fillColor );
	}

	function changeBackgroundColor(evt) {
		
		backgroundCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
		backgroundCtx.fillStyle = $( '[name=background-color]' ).value || $( '[name=color-advanced]' ).value;
		backgroundCtx.fillRect( 0, 0, backgroundCanvas.width, backgroundCanvas.height );
	}

	function handleDownload( evt ) {

		console.debug( 'download' );

		canvas.toBlob( function ( blob ) {

			var url = URL.createObjectURL( blob );
			var image = window.open( url, '_blank' );
			console.debug( 'opened image in new window', url );

			image.addEventListener( 'beforeunload', function () {
				URL.revokeObjectURL( url );
				console.debug( 'Revoked url', url );
			}, false )
		} )
	}

} )( window, document )
