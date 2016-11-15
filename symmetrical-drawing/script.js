(function(window, document, undefined) {
    'use sctrict';

    // Preparamos el canvas
    var canvas = document.querySelector('canvas#main');
    var rulers = document.querySelector('canvas.rulers')
    var ctx = canvas.getContext('2d');
    var cx, cy, splits;
    var capture = false;
    var previous = {};

    reset();

    ctx.strokeStyle = 'black';

    rulers.onmousedown = function(evt) {
        previous = {
            x: evt.layerX,
            y: evt.layerY
        }
    }

    rulers.onmousemove = function(evt) {

        if (evt.buttons & 1 == 1) {
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

    function multiline(x0, y0, x1, y1, n) {

        ctx.save()

        ctx.strokeStyle = document.querySelector('select[name=color-select]').value || 'black';
        ctx.fillStyle = document.querySelector('select[name=color-select]').value || 'black';

        var diameter = document.querySelector('input[name=stroke]').value || 1;
        ctx.lineWidth = diameter;

        ctx.translate(cx, cy);

        for (var i = 0; i < n; i++) {

            ctx.beginPath();

            ctx.moveTo(x0 - cx, y0 - cy);
            ctx.lineTo(x1 - cx, y1 - cy);
            ctx.stroke();

            ctx.arc(x1 - cx, y1 - cy, diameter / 2, 0, 2 * Math.PI);
            ctx.fill();

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

        canvas.width = rulers.width = bounds.width;
        canvas.height = rulers.height = bounds.height;

        cx = canvas.width / 2;
        cy = canvas.height / 2;
        splits = parseInt(document.querySelector('input[name=symmetry]').value || 8);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var rulersCtx = rulers.getContext('2d');
        rulersCtx.save();
        rulersCtx.fillStyle = 'rgba(0, 0, 0, 0)';
        rulersCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        rulersCtx.clearRect(0, 0, canvas.width, canvas.height);

        rulersCtx.save();
        rulersCtx.translate(cx, cy);

        for (var i = 0; i < splits; i++) {

            rulersCtx.beginPath();

            rulersCtx.moveTo(0, - 50);
            rulersCtx.lineTo(0, - Math.floor(1.5 * canvas.height / 2) );
            rulersCtx.stroke();

            //rulersCtx.arc(x1 - cx, y1 - cy, diameter / 2, 0, 2 * Math.PI);
            //rulersCtx.fill();

            rulersCtx.rotate(2 * Math.PI / splits);
        }

        for (var i = 1; i < Math.floor(canvas.width / 50); i++) {
			rulersCtx.beginPath();
            rulersCtx.arc(0, 0, i * 50, 0, 2 * Math.PI);
			rulersCtx.stroke();
        }

        rulersCtx.restore();

    }

    document.querySelector('button[name=reset]').onclick = function() {
        reset();
    }

	document.querySelector('input[name=rulers]').onchange = function() {

		rulers.style.visibility = this.checked ? 'visible' : 'hidden';
	}

})(window, document)
