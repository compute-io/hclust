'use strict';

// MODULES //

var argmax = require( 'compute-argmax' );

var isObject = require( 'validate.io-object' ),
	isArrayArray = require( 'validate.io-array-array' ),
	isInteger = require( 'validate.io-integer' );

var PriorityQueue = require( './queue' );

// FUNCTIONS //

// HELPER FUNCTIONS //

function create2dArray( m, n ) {
	var ret = [];
	for ( var i = 0; i < m; i++ ) {
		ret[i] = new Array(n);
	}
	return ret;
}

/**
* FUNCTION: foo()
*	{{ foo description }}.
*/
function efficientHAC( dat, linkage, distance ) {
	var i;
	var d = dat;
	var N = d.length;
	var P = [];
	var I = [];
	var C = create2dArray( N, N );
	for ( var n = 0; n < N; n++ ) {
		for ( i = 0; i < N; i++ ) {
			C[n][i] = {
				'sim': 1 / (1 + distance( d[n], d[i] ) ),
				'index': i
			};
		}
		I[n] = 1;
		P[n] = new PriorityQueue( C[n] );
		P[n].delete( C[n][n] );
	}

	var A = [];

	function maxSim(q, i){
		return I[i] === 1 ? q.max().sim : 0;
	}

	for ( var k = 0; k < N - 1; k++ ) {
		var k1 = argmax( P.map( maxSim ) )[0];
		var k2 = P[k1].max().index;
		A.push( [k1, k2] );
		I[k2] = 0;
		P[k1].reset();
		for ( i = 0; i < I.length; i++ ) {
			if ( I[i] === 1 && i !== k1 ) {
				P[i].delete( C[i][k1] );
				P[i].delete( C[i][k2] );
				C[i][k1].sim = linkage(i, k1, k2, C);
				P[i].insert(C[i][k1]);
				C[k1][i].sim = linkage(i, k1, k2, C);
				P[k1].insert(C[k1][i]);
			}
		}
	}
	return A;
} // end FUNCTION efficientHAC()


function hclust( dat, opts ) {

	var linkage = 'single',
		distance = 'euclidean';

	if ( !isArrayArray( dat ) ) {
		throw new TypeError( 'hclust()::invalid input argument. Data must be passed as an array of arrays. Value: `' + dat + '`.' );
	}

	if ( arguments > 1 ) {
		if ( !isObject( opts ) ) {
			throw new TypeError( 'hclust()::invalid input argument. Options argument must be an object. Value: `' + opts + '`.' );
		}
		if ( opts.hasOwnProperty( 'linkage' ) ) {
			linkage = opts.linkage;
			if ( linkage !== 'single' && linkage !== 'complete' ) {
				throw new TypeError( 'hclust()::invalid option. Linkage option must be either "single" or "complete". Option: `' + linkage + '`.' );
			}
		}
		if ( opts.hasOwnProperty( 'distance' ) ) {
			distance = opts.distance;
			if ( distance !== 'euclidean' ) {
				throw new TypeError( 'hclust()::invalid option. Distance option must be "euclidean". Option: `' + distance + '`.' );
			}
		}
	}

	var linkageFun, distanceFun;
	switch ( linkage ) {
		case 'single':
			linkageFun = function singleLinkage( i, k1, k2, C ) {
				return Math.max( C[i][k1].sim, C[i][k2].sim );
			};
		break;
		case 'complete':
			linkageFun = function completeLinkage( i, k1, k2, C ) {
				return Math.min( C[i][k1].sim, C[i][k2].sim );
			};
		break;
	}

	switch ( distance ) {
		case 'euclidean':
			distanceFun = function euclidean(vec1, vec2) {
				var sum = 0;
				for ( var i = 0; i < vec1.length; i++ ) {
					sum += Math.pow(vec2[i] - vec1[i], 2);
				}
				return Math.sqrt(sum);
			};
		break;
	}

	var A = efficientHAC( dat, linkage, distance );

	function getClusters( k ) {

		if ( opts.hasOwnProperty( 'k' ) ) {
			k = opts.k;
			if ( !isInteger(k) ) {
				throw new TypeError( 'getClusters()::invalid argument. The number of desired clusters must be an integer. Option: `' + k + '`.' );
			}
		}
		var clusters = [];
		for ( var i = 0; i < dat.length; i++ ) {
			var current = [i];
			clusters.push( current);
		}
		var nClusters = clusters.length;
		var j = 0;
		while ( nClusters > k ) {
			var merged = clusters[ A[j][0] ].concat( clusters[ A[j][1] ] );
			clusters[ A[j][0] ] = merged;
			nClusters--;
			j++;
		}
		return clusters.splice(0, k);
	}

	function getTree( ) {

	}

	return {
		'getClusters' : getClusters,
		'getTree' : getTree
	};
}

// EXPORTS //

module.exports = hclust;
