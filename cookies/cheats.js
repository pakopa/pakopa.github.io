/* For http://orteil.dashnet.org/cookieclicker/ */

function clickityFn( interval ) {
	if ( !window.clickity ) {
		window.clickity = setInterval( Game.clickCookie, interval ? interval : 125 );
	} else {
		clearInterval( window.clickity );
		window.clickity = null;
	}
}

function buyityFn( interval ) {
	if ( !window.buyity ) {
		window.buyity = setInterval( () =>{
			var o = Object.keys( Game.ObjectsById )
				.map( ( k ) => {
					return Game.ObjectsById[ k ];
				} )
				.reduce( ( p, c ) => {
					return ( p.bulkPrice && ( p.bulkPrice / p.cps( p ) ) < ( c.bulkPrice / c.cps( c ) ) ) ? p : c;
				} );

			if ( o.bulkPrice < Game.cookies ) {
				o.buy();
			}
		}, interval ? interval : 500 );
	} else {
		clearInterval( window.buyity );
		window.buyity = null;
	}
}

function achievityFn( interval ) {
	if ( !window.achievity ) {
		window.achievity = setInterval( () => {
			if ( Game.UpgradesInStore.length && Game.UpgradesInStore[ 0 ].basePrice < Game.cookies ) {
				Game.UpgradesInStore[ 0 ].buy();
			}
		}, interval ? interval : 500 );
	} else {
		clearInterval( window.achievity );
		window.achievity = null;
	}
}

function cheapify() {
	var ok = window.confirm( 'This is irreversible, are you sure?' );
	if ( ok ) {
		Game.ObjectsById.forEach( ( o ) => {
			o.bulkPrice = 1;
		} );

		Game.UpgradesById.forEach( ( u ) => {
			u.basePrice = 1;
		} );
	}
}
