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
	$( '[name=reset]' ).addEventListener( 'click', reset, false );

	$( '[name=download]' ).addEventListener( 'click', function () {
		window.open( canvas.toDataURL(), '_blank' );
		console.debug( 'download', evt );
	}, false );

	$( '[name=rulers]' ).addEventListener( 'change', function () {
		rulers.style.visibility = this.checked ? 'visible' : 'hidden';
		console.debug( 'change rulers visibility to', rulers.style.visibility );
	}, false );

	$( '[name=color-advanced]' ).addEventListener( 'change', setColor, false );
	$( '[name=color]' ).addEventListener( 'change', setColor, false );


	// Prepare de drawing context
	var canvas = $( 'canvas#main' );
	var rulers = $( 'canvas.rulers' )
	var ctx = canvas.getContext( '2d' );
	var cx, cy, splits;
	var previous = null;
	var strokeColor = '#000';
	var fillColor = '#000';

	// Initialize the canvas
	canvas.allowTouch
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

		ctx.save()


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


		var size = $( 'input[name=size]' ).value || 600;
		splits = parseInt( $( 'input[name=symmetry]' ).value || 8 );

		console.debug( 'Resetting canvas with w, s', size, splits );

		var parentNode = canvas.parentNode;
		parentNode.style.width = size;
		parentNode.style.height = size;

		var bounds = parentNode.getBoundingClientRect();

		canvas.width = rulers.width = bounds.width;
		canvas.height = rulers.height = bounds.height;

		cx = canvas.width / 2;
		cy = canvas.height / 2;

		ctx.clearRect( 0, 0, canvas.width, canvas.height );

		var rulersCtx = rulers.getContext( '2d' );
		rulersCtx.save();
		rulersCtx.fillStyle = 'rgba(0, 0, 0, 0)';
		rulersCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
		rulersCtx.clearRect( 0, 0, canvas.width, canvas.height );

		rulersCtx.save();
		rulersCtx.translate( cx, cy );

		for ( var i = 0; i < splits; i++ ) {

			rulersCtx.beginPath();

			rulersCtx.moveTo( 0, -50 );
			rulersCtx.lineTo( 0, -Math.floor( 1.5 * canvas.height / 2 ) );
			rulersCtx.stroke();

			//rulersCtx.arc(x1 - cx, y1 - cy, diameter / 2, 0, 2 * Math.PI);
			//rulersCtx.fill();

			rulersCtx.rotate( 2 * Math.PI / splits );
		}

		for ( var i = 1; i < Math.floor( canvas.width / 50 ); i++ ) {
			rulersCtx.beginPath();
			rulersCtx.arc( 0, 0, i * 50, 0, 2 * Math.PI );
			rulersCtx.stroke();
		}

		rulersCtx.restore();

		console.debug( 'Canvas reset' );

	}

	function setColor( evt ) {
		var color = evt.target.value;
		strokeColor = color;
		fillColor = color;

		$( '[name=color-advanced]' ).value = color;

		console.debug( 'set colors to', strokeColor, fillColor );
	}

} )( window, document )
