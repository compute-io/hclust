'use strict';

var isArray = require( 'validate.io-array');

/**
 * FUNCTION: PriorityQueue( values )
 *  	Represents a PriorityQueue. Elements queued will always be sorted in increasing order.
 *
 * @param {Array} values - input array of values
 * @constructor
 */
function PriorityQueue( values ) {

	var _initial;
	if ( !isArray ( values ) ) {
	 	 throw new TypeError( 'PriorityQueue()::invalid argument. values must be an Array. Option: `' + values + '`.' );
	}
	_initial = values;

	this._queue = [];
	if ( _initial ) {
		for ( var i = 0; i < _initial.length; i++ ) {
			this.insert( _initial[ i ] );
		}
	}

}

/**
 * Insert a new element to the queue. Elements are assumed to be objects with `sim` and `index` properties.
 */
PriorityQueue.prototype.insert = function( elem ) {
	var pos = this.search( elem );
	this._queue.splice(pos, 0, elem);
};

/**
 * Returns the maximum element currently in the queue.
 */
PriorityQueue.prototype.max = function() {
	return this._queue[ this._queue.length - 1 ];
};

/**
 * Returns the maximum element currently in the queue and remove it.
 */
PriorityQueue.prototype.delMax = function() {
	return this._queue.pop();
};

/**
 * Delete the element passed to parameter `elem` from the queue, if present.
 */
PriorityQueue.prototype.delete = function( elem ) {
	for ( var i = 0; i < this.size(); i++ ) {

		if ( this._queue[i] === elem ) {
			this._queue.splice(i, 1);
			break;
		}

	}
};

/**
 * Reset the queue to zero elements
 */
PriorityQueue.prototype.reset = function() {
	this._queue = [];
};

/**
 * Return the number of elements currently in the queue
 */
PriorityQueue.prototype.size = function() {
	return this._queue.length;
};

/**
 *  Binary search algorithm returning the index at which the element if inserted
 *  would be larger than all elements to the left and smaller than those to the right. 
 */
PriorityQueue.prototype.search = function( target ) {

	var low = 0;
	var high = this._queue.length;

	while ( low !== high ) {
		// calculate mid point
		var mid = high + low >>> 1;

		if ( (this._queue[mid].sim -  target.sim) <= 0 ) {
			low = mid + 1;
		} else {
			high = mid;
		}
	}

	return low;

};

module.exports = PriorityQueue;
