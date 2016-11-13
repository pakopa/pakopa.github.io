(function(window, document, undefined) {
    'use sctrict';

    // Preparamos el canvas
    var canvas = document.querySelector('canvas');
	var ctx = canvas.getContext('2d');
    var cx, cy, splits;
	var capture = false;
    var previous = {};

	reset();

    ctx.strokeStyle = 'black';

    canvas.onmousedown = function(evt) {
        capture = true;
        previous = {
            x: evt.layerX,
            y: evt.layerY
        }
        console.info('mousedown:', evt);
        // var x = evt.clientX;
        // var y = evt.clientY;
    }

    canvas.onmousemove = function(evt) {
        if (capture) {
            var current = {
                x: evt.layerX,
                y: evt.layerY
            }

            if (previous.x !== current.x || previous.y !== current.y) {
				multiline(previous.x, previous.y, current.x, current.y, splits);
            }

            previous = current;
        }
        // console.info('move', evt);
    }

    canvas.onmouseup = function(evt) {
        capture = false;
        console.info('mouseup:', evt)
    }

    function multiline(x0, y0, x1, y1, n) {

		ctx.save()

		ctx.strokeStyle = document.querySelector('select[name=color-select]').value || 'black';
		// ctx.strokeStyle = document.querySelector('input[name=stroke]').value || 1;
		
        ctx.translate(cx, cy);

        for (var i = 0; i < n; i++) {
			ctx.beginPath();
            ctx.moveTo(x0 - cx, y0 - cy);
            ctx.lineTo(x1 - cx, y1 - cy);
            ctx.stroke();
			ctx.rotate(2 * Math.PI / splits);
        }

        ctx.restore();

    }

	function reset() {

		var size = document.querySelector('input[name=size]').value || 600;

		var parentNode = canvas.parentNode;
		parentNode.style.width = size;
		parentNode.style.height = size;

		var bounds = parentNode.getBoundingClientRect();

	    canvas.width = bounds.width;
	    canvas.height = bounds.height;

	    cx = canvas.width / 2;
	    cy = canvas.height / 2;
	    splits = parseInt(document.querySelector('input[name=symmetry]').value || 8);

		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	document.querySelector('button[name=reset]').onclick = function() {
		reset();
	}

})(window, document)
