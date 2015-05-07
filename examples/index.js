'use strict';

var hclust = require( './../lib' );
var util = require( 'util' );

var dat = [
	[1, 2, 1],
	[80 ,100, 98],
	[1, 1.9, 1],
	[80, 101, 99],
	[1, 3, 2],
	[2, 2, 1]
];

var clustering = hclust( dat );

console.log( clustering.getClusters( 2 ) );
// [ [ 0, 2, 5, 4 ], [ 1, 3 ] ]

console.log( clustering.getClusters( 3 ) );
// [ [ 0, 2, 5 ], [ 1, 3 ], [ 2 ] ]

console.log( util.inspect( clustering.getTree(), null, 5 ) );
/*
{ left:
   { left:
      { left:
         { left: { value: [ 1, 2, 1 ], size: 1 },
           right: { value: [ 1, 1.9, 1 ], size: 1 },
           size: 2 },
        right: { value: [ 2, 2, 1 ], size: 1 },
        size: 3 },
     right: { value: [ 1, 3, 2 ], size: 1 },
     size: 4 },
  right:
   { left: { value: [ 80, 100, 98 ], size: 1 },
     right: { value: [ 80, 101, 99 ], size: 1 },
     size: 2 },
  size: 6
}
*/
