'use strict';

var isArray = require( 'validate.io-array');

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

PriorityQueue.prototype.insert = function( elem ) {
	var pos = this.search( elem );
	this._queue.splice(pos, 0, elem);
};

PriorityQueue.prototype.max = function() {
	return this._queue[ this._queue.length - 1 ];
};

PriorityQueue.prototype.delMax = function() {
	return this._queue.pop();
};

PriorityQueue.prototype.delete = function( elem ) {
	for ( var i = 0; i < this.size(); i++ ) {

		if ( this._queue[i] === elem ) {
			this._queue.splice(i, 1);
			break;
		}

	}
};

PriorityQueue.prototype.isEmpty = function() {
	return this.size() === 0;
};

PriorityQueue.prototype.reset = function() {
	this._queue = [];
};

PriorityQueue.prototype.size = function() {
	return this._queue.length;
};

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
