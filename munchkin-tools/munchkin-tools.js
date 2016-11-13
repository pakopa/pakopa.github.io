( function ( window, document, angular, undefined ) {

	var app = angular.module( 'app', [] );

	app.controller( 'MainCtrl', MainController )
		.controller( 'DiceCtrl', DiceController )
		.controller( 'PlayersCtrl', PlayersController );

	function MainController() {

	}
	MainController.$inject = [];

	function PlayersController() {

		var self = this;

		var playerList = [];

		self.addPlayer = function ( name ) {

			console.info( 'Creating player', name );

			playerList.push( {
				name: name,
				level: 1,
				alive: true,
				rolls: [],
				levelUp: levelUp,
				levelDown: levelDown
			} );
		}

		// Player functions
		function levelUp() {
			this.level++;
		}

		function levelDown() {
			this.level--;
		}

		Object.defineProperty( self, 'playerList', {
			get: function () {
				return playerList;
			}
		} )

	}
	PlayersController.$inject = [];

	function DiceController( $interval ) {

		var MAX = 7;
		var MIN = 1;

		var self = this;

		var value = 1;

		self.rolling = null;

		self.rollStop = function () {

			if ( self.rolling ) {
				$interval.cancel( self.rolling );
                self.rolling = null;
			} else {

                // Reaction times are never under 100ms
				self.rolling = $interval( function () {
					value = Math.floor( Math.random() * ( MAX - MIN ) ) + MIN;
				}, 50 );
			}
		}

		Object.defineProperty( self, 'value', {
			get: function () {
				return value;
			}
		} );

	}
	DiceController.$inject = [ '$interval' ];

	angular.bootstrap( document, [ 'app' ] );

} )( window, document, angular );
