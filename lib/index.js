'use strict';

// MODULES //

var argmax = require( 'compute-argmax' ),
	chebyshev = require( 'compute-chebyshev-distance' ),
	cosine = require( 'compute-cosine-distance' ),
	euclidean = require( 'compute-euclidean-distance' ),
	hamming = require( 'compute-hamming' ),
	manhattan = require( 'compute-manhattan-distance' );

var isObject = require( 'validate.io-object' ),
	isArrayArray = require( 'validate.io-array-array' ),
	isInteger = require( 'validate.io-integer' );

var PriorityQueue = require( './queue' );

// FUNCTIONS //

// HELPER FUNCTIONS //

/**
 *	FUNCTION: create2dArray( m, n )
 *  	Creates a two-dimensional array
 * @param {Number} m - number of rows
 * @param {Number} n - number of columns
 * @return {Array} an empty array of arrays
 */
function create2dArray( m, n ) {
	var ret = [];
	for ( var i = 0; i < m; i++ ) {
		ret[i] = new Array(n);
	}
	return ret;
}

/**
 *	FUNCTION: isEqual( input )
 *		Returns a function which checks whether an element is equal to input
 *
 * @param{String} input - the element the generated function should compare to
 * @return {Function} a function which when invoked checks whether its first argument is equal to input
 */
function isEqual( input ) {
	return function(d) {
		return d === input;
	};
}

/**
 * FUNCTION: efficientHAC( dat[, linkage, distance])
 *		algorithm adapted from Introduction to Information Retrieval by
 *		Manning et al., Cambridge University Press. 2008 [p.386].
 * @param {Array} dat - input data, two-dimensional array of numeric values
 * @param {Function} linkage - used linkage function
 * @param {Function} distance - used distance metric
 * @return {Array}  a list holding merge instructions
 */
function efficientHAC( dat, linkage, distance ) {
	var i, n, k, k1, k2;
	var d = dat;
	var N = d.length;
	var P = [];
	var I = [];
	var C = create2dArray( N, N );
	for ( n = 0; n < N; n++ ) {
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

	for ( k = 0; k < N - 1; k++ ) {
		k1 = argmax( P.map( maxSim ) )[0];
		k2 = P[k1].max().index;
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

/**
 * FUNCTION: hclust( dat[, opts])
 *		hierarchical clustering based on priority-queue algorithm. Implements single-linkage and complete-linkage.
 *
 * @param dat
 * @param {Object} [options] - function options
 * @param {String} [options.linkage='complete'] - accessor function for accessing array values
 * @param {String} [options.distance='euclidean'] - boolean indicating whether to return a new array
 * @return {Object} an object exposing two functions, `getTree` and `getClusters(k)`, where `k` is the number of clusters
 */
function hclust( dat, opts ) {

	var linkage, distance, allDistances, linkageFun, distanceFun;

	if ( !isArrayArray( dat ) ) {
		throw new TypeError( 'hclust()::invalid input argument. Data must be passed as an array of arrays. Value: `' + dat + '`.' );
	}

	if ( arguments.length > 1 ) {
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
			allDistances = [ 'chebyshev', 'cosine', 'euclidean', 'hamming', 'manhattan' ];
			if ( !allDistances.some( isEqual( distance ) ) ) {
				throw new TypeError( 'hclust()::invalid option. Distance option must be "chebyshev", "cosine", "euclidean", "hamming" or "manhattan". Option: `' + distance + '`.' );
			}
		}
	}

	switch ( linkage ) {
		case 'centroid':
			linkageFun = function centroidLinkage( ) {

			};
		break;
		case 'single':
			linkageFun = function singleLinkage( i, k1, k2, C ) {
				return Math.max( C[i][k1].sim, C[i][k2].sim );
			};
		break;
		default:
			linkageFun = function completeLinkage( i, k1, k2, C ) {
				return Math.min( C[i][k1].sim, C[i][k2].sim );
			};
		break;
	}

	switch ( distance ) {
		case 'chebyshev':
			distanceFun = chebyshev;
		break;
		case 'cosine':
			distanceFun = cosine;
		break;
		case 'hamming':
			distanceFun = hamming;
		break;
		case 'manhattan':
			distanceFun = manhattan;
		break;
		default:
			distanceFun = euclidean;
		break;
	}

	var A = efficientHAC( dat, linkageFun, distanceFun );

	function getClusters( k ) {

		if ( !isInteger(k) ) {
			throw new TypeError( 'getClusters()::invalid argument. The number of desired clusters must be an integer. Option: `' + k + '`.' );
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
			clusters[ A[j][1] ] = null;
			nClusters--;
			j++;

		}

		return clusters.filter( function(c) { return c !== null; } );

	}

	function getTree() {
		var clusters = [];

		for ( var i = 0; i < dat.length; i++ ) {

			var current = {};
			current.obs = dat[i];
				current.size = 1;

			clusters.push( current );

		}

		var j = 0;

		while ( j < A.length ) {

			var node = {
				left: clusters[ A[j][0] ],
				right: clusters[ A[j][1] ],
				size: clusters[ A[j][0] ].size + clusters[ A[j][1] ].size
			};

			clusters[ A[j][0] ] = node;
			clusters[ A[j][1] ] = null;
			j++;

		}

		return clusters[0];
	}

	return {
		'getClusters' : getClusters,
		'getTree' : getTree
	};
} // end FUNCTION hclust()

// EXPORTS //

module.exports = hclust;
