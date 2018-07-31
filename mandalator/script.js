( function ( window, document, undefined ) {
	'use sctrict';

	// A little helper function
	function $( selector ) {
		return document.querySelector( selector );
	}

	// Controls;
	var gridCrtl = $( '[name=grid]' );

	var undoCtrl = $( '[data-action=undo]' );
	var redoCtrl = $( '[data-action=redo]' );

	var advancedColorCtrl = $( '[name=color-advanced]' );
	var colorCtrl = $( '[name=color]' );
	var strokeCtrl = $( 'input[name=stroke]' );
	var backgroundSelectCtrl = $( '[name=background-color]' );

	var sizeCtrl = $( 'input[name=size]' );
	var symmetryCtrl = $( 'input[name=symmetry]' );
	var resetBtn = $( '[data-action=reset]' );

	var downloadBtn = $( '[data-action=download]' );

	var pageBackground = $( '.page-background' );

	var actions = $( '#actions' );
	var gridCanvas = $( 'canvas#grid-layer' );
	var backgroundCanvas = $( 'canvas#background-layer' );
	var canvas = $( 'canvas#main-layer' );

	// Setup drawing events
	actions.addEventListener( 'touchstart', handleStart, false );
	actions.addEventListener( 'mousedown', handleStart, false );
	actions.addEventListener( 'touchmove', handleTouchMove, false );
	actions.addEventListener( 'mousemove', handleMouseMove, false );
	actions.addEventListener( 'mouseup', updateState, false );
	actions.addEventListener( 'mouseout', handleMouseOut, false );
	actions.addEventListener( 'touchend', updateState, false );

	// Setup control events
	gridCrtl.addEventListener( 'change', function () {
		gridCanvas.style.visibility = this.checked ? 'visible' : 'hidden';
		console.debug( 'Change grid visibility to', gridCanvas.style.visibility );
	}, false );

	undoCtrl.addEventListener( 'click', function () {
		editHistory.undo();
	}, false );

	redoCtrl.addEventListener( 'click', function () {
		editHistory.redo();
	}, false );

	advancedColorCtrl.addEventListener( 'change', setColor, false );
	colorCtrl.addEventListener( 'change', setColor, false );
	backgroundSelectCtrl.addEventListener( 'change', changeBackgroundColor, false );
	backgroundSelectCtrl.addEventListener( 'change', updatePageBackground, false );
	symmetryCtrl.addEventListener( 'change', updateSymmery, false );
	resetBtn.addEventListener( 'click', reset, false );

	downloadBtn.addEventListener( 'click', handleDownload, false );

	// From https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
	window.addEventListener( 'keydown', function ( evt ) {

		console.info( evt );

		// Should do nothing if the default action has been cancelled
		if ( evt.defaultPrevented ) {
			return;
		}

		var handled = false;
		if ( evt.code == 'KeyZ' && evt.ctrlKey == true ) {

			editHistory.undo();
			handled = true;

		} else if ( evt.code == 'KeyY' && evt.ctrlKey == true ) {

			editHistory.redo();
			handled = true;

		} else if ( evt.code == 'KeyS' && evt.ctrlKey == true ) {

			handleDownload( evt );
			handled = true;

		} else if ( evt.key == '+' ) {

			// Just js things "1" + 1 = "11";
			strokeCtrl.value = ( strokeCtrl.value - 0 ) + 1;
			handled = true;

		} else if ( evt.key == '-' ) {

			strokeCtrl.value = strokeCtrl.value > 0 ? strokeCtrl.value - 1 : strokeCtrl.value;
			handled = true;

		} else if ( evt.key == ',' || evt.key == '<' ) {

			symmetryCtrl.value = symmetryCtrl.value > 1 ? symmetryCtrl.value - 1 : symmetryCtrl.value;
			updateSymmery();
			handled = true;

		} else if ( evt.key == '.' || evt.key == '>' ) {

			// Just js things "1" + 1 = "11";
			symmetryCtrl.value = symmetryCtrl.value <= 720 ? ( symmetryCtrl.value - 0 ) + 1 : symmetryCtrl.value;
			updateSymmery();
			handled = true;
		}

		// Suppress "double action" if event handled
		if ( handled ) {
			evt.preventDefault();
		}
	}, true );

	// Prepare the drawing context
	var ctx = canvas.getContext( '2d' );
	var backgroundCtx = backgroundCanvas.getContext( '2d' );

	var cx, cy, splits;
	var previous = null;
	var strokeColor = '#000';
	var fillColor = '#000';
	var backgroundColors = {
		'': 'Current draw color',
		'rgba(0, 0, 0, 0)': 'Transparent',
		'#FFF': 'White',
		'#EEE': 'Not so white',
		'#222': 'Not so black',
		'#000': 'Black'
	};

	var editHistory = window.editHistory = new EditHistory( ctx );

	// Initialize canvases and controls
	init();

	// scope functions

	// initialization
	function init() {

		// Calculate inital size
		var minSize = Math.floor( Math.min( window.innerHeight - canvas.getBoundingClientRect().y, window.innerWidth ) - 16 );
		sizeCtrl.value = minSize;

		// Initialize background select
		Object.keys( backgroundColors ).forEach( function ( key ) {
			var option = document.createElement( 'option' );
			option.value = key;
			option.textContent = backgroundColors[key];
			backgroundSelectCtrl.appendChild( option );
		} );

		// Default background color
		backgroundSelectCtrl.value = '#FFF';

		// Initialize the canvas
		reset();
		ctx.strokeStyle = strokeColor;
	}

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

	// Handle touch draw
	function handleTouchMove( evt ) {

		if ( evt.touches.length == 1 ) {
			evt.preventDefault();
			handleMove( evt.touches[0] );
		}
		else {
			console.debug( 'Ignored touch event', evt );
			return true;
		}
	};

	// Handle mouse draw
	function handleMouseMove( evt ) {

		// Check for mousedown status
		if ( evt.buttons & 1 == 1 ) {
			evt.preventDefault();
			handleMove( evt );
		}
	};

	// Handle path for drawing
	function handleMove( target ) {

		var current = getPosition( target, canvas );

		if ( previous.x !== current.x || previous.y !== current.y ) {
			multiline( previous.x, previous.y, current.x, current.y, splits );
		}

		previous = current;

		console.debug( 'Move', target );
	}

	function handleMouseOut( evt ) {

		// Check for mousedown status
		if ( evt.buttons & 1 == 1 ) {
			updateState( evt );
		}

	}

	// Symetrically draw lines following path
	function multiline( x0, y0, x1, y1, n ) {

		ctx.save();

		ctx.strokeStyle = strokeColor;
		ctx.fillStyle = fillColor;

		var diameter = parseInt( strokeCtrl.value || 1 );
		ctx.lineWidth = diameter;

		ctx.translate( cx, cy );

		for ( var i = 0; i < n; i++ ) {

			ctx.beginPath();

			ctx.moveTo( x0 - cx, y0 - cy );
			ctx.lineTo( x1 - cx, y1 - cy );
			ctx.stroke();

			ctx.arc( x1 - cx, y1 - cy, diameter / 2, 0, 2 * Math.PI );
			ctx.fill();

			ctx.rotate( 2 * Math.PI / n );
		}

		ctx.restore();
	}

	// Resets canvas to inital state
	function reset() {

		// Size and symmetry
		var size = sizeCtrl.value || 600;
		splits = parseInt( symmetryCtrl.value || 8 );

		console.debug( 'Resetting canvas with w, s', size, splits );

		var parentNode = canvas.parentNode;
		parentNode.style.width = size;
		parentNode.style.height = size;

		var bounds = parentNode.getBoundingClientRect();

		canvas.width = backgroundCanvas.width = gridCanvas.width = bounds.width;
		canvas.height = backgroundCanvas.height = gridCanvas.height = bounds.height;

		cx = canvas.width / 2;
		cy = canvas.height / 2;

		// Background
		ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
		backgroundCtx.clearRect( 0, 0, backgroundCanvas.width, backgroundCanvas.height );

		backgroundCtx.fillStyle = backgroundSelectCtrl.value || advancedColorCtrl.value;
		backgroundCtx.fillRect( 0, 0, backgroundCtx.canvas.width, backgroundCtx.canvas.height );

		redrawGrid( splits );
		updatePageBackground();

		// save state
		editHistory.pushState();

		console.debug( 'Canvas reset' );
	}

	// redraws the guiding guide for a symmetry value
	function redrawGrid( splits ) {

		// Grid
		var gridCtx = gridCanvas.getContext( '2d' );
		var blackShadow = 'rgba(0, 0, 0, 0.5)';
		var whiteShadow = 'rgba(255, 255, 255, 0.5)';

		gridCtx.clearRect( 0, 0, canvas.width, canvas.height );

		gridCtx.save();
		gridCtx.translate( cx, cy );

		// For each division
		for ( var i = 0; i < splits; i++ ) {

			gridCtx.beginPath();
			gridCtx.moveTo( 0, -50 );
			gridCtx.lineTo( 0, -Math.floor( 1.5 * canvas.height / 2 ) );

			// Draw both white and black grids
			gridCtx.strokeStyle = blackShadow;
			gridCtx.stroke();

			gridCtx.strokeStyle = whiteShadow;
			gridCtx.stroke();

			// Rotate the context before drawing next line
			gridCtx.rotate( 2 * Math.PI / splits );
		}

		// Concentric circles every 50 px;
		for ( var i = 1; i < Math.floor( canvas.width / 50 ); i++ ) {

			gridCtx.beginPath();
			gridCtx.arc( 0, 0, i * 50, 0, 2 * Math.PI );

			// Draw both white and black grids
			gridCtx.strokeStyle = blackShadow;
			gridCtx.stroke();

			gridCtx.strokeStyle = whiteShadow;
			gridCtx.stroke();
		}

		// Undo context transformations
		gridCtx.restore();
	}

	// sets scope colors
	function setColor( evt ) {

		var color = evt.target.value;
		strokeColor = color;
		fillColor = color;

		advancedColorCtrl.value = color;

		console.debug( 'set colors to', strokeColor, fillColor );
	}

	// sets scope background color
	function changeBackgroundColor( evt ) {

		backgroundCtx.clearRect( 0, 0, backgroundCanvas.width, backgroundCanvas.height );
		backgroundCtx.fillStyle = backgroundSelectCtrl.value || advancedColorCtrl.value;
		backgroundCtx.fillRect( 0, 0, backgroundCanvas.width, backgroundCanvas.height );
	}

	// Creates an image of the current drawing
	function renderResult() {

		var tmp = document.createElement( 'canvas' );
		tmp.width = canvas.width;
		tmp.height = canvas.height;

		var tmpCtx = tmp.getContext( '2d' );
		tmpCtx.clearRect( 0, 0, tmpCtx.canvas.width, tmpCtx.canvas.height );
		tmpCtx.drawImage( backgroundCanvas, 0, 0 );
		tmpCtx.drawImage( canvas, 0, 0 );

		return tmp;
	}

	// open a new tab with the rendered image
	function handleDownload( evt ) {

		console.debug( 'Download' );

		var tmp = renderResult();

		tmp.toBlob( function ( blob ) {

			var url = URL.createObjectURL( blob );
			var image = window.open( url, '_blank' );
			console.debug( 'Opened image in new window', url );

			image.addEventListener( 'beforeunload', function () {
				URL.revokeObjectURL( url );
				console.debug( 'Revoked url', url );
			}, false )
		} );
	}

	// Update edit history and page background
	function updateState() {

		editHistory.pushState();
		updatePageBackground();
	}

	// updates the page background with the current image.
	function updatePageBackground() {

		console.debug( 'Update background' );

		var tmp = renderResult();
		pageBackground.style.backgroundImage = 'url(' + tmp.toDataURL() + ')';
	}

	// updates the drawing symmetry
	function updateSymmery() {

		console.debug( 'Update symmetry' );

		splits = parseInt( symmetryCtrl.value || 8 );
		redrawGrid( splits );
	}

	// Simple edit history management
	function EditHistory( ctx, size ) {

		size = size || 10;
		this.states = [];
		this.idx = -1;

		this.pushState = function () {

			console.debug( 'Saved state', this );

			this.states.splice( ++this.idx, this.states.length, ctx.getImageData( 0, 0, ctx.canvas.width, ctx.canvas.height ) );

			if ( this.states.length > size ) {
				this.states.shift();
				--this.idx;
			}
		}

		this.undo = function () {

			console.debug( 'Undo', this );

			if ( this.idx > 0 ) {
				ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
				ctx.putImageData( this.states[--this.idx], 0, 0 );
				return true;
			} else {
				return false;
			}
		}

		this.redo = function () {

			console.debug( 'Redo', this );

			if ( this.idx < this.states.length - 1 ) {
				ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
				ctx.putImageData( this.states[++this.idx], 0, 0 );
				return true;
			} else {
				return false;
			}
		}
	}

} )( window, document )
