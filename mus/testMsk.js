var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files

// Read file contents
var data = fs.readFileSync('msk.peg', 'utf-8');
var parse = PEG.buildParser(data).parse;

console.log('Starting one note tests');
assert.deepEqual(parse("a0x300"), {"tag": "note","pitch": "a0","dur": 300}, 'parse("a0x300")');
assert.deepEqual(parse("b0x500"), {"tag": "note","pitch": "b0","dur": 500}, 'parse("b0xg00")');
assert.deepEqual(parse("c8x800"), {"tag": "note","pitch": "c8","dur": 800}, 'parse("c8x300")');
assert.deepEqual(parse("d5x3"), {"tag": "note","pitch": "d5","dur": 3}, 'parse("d5x3")');
assert.deepEqual(parse("shx5999"), {"tag": "rest","dur": 5999}, 'parse("shx5999")');
console.log('one note tests passed!');


console.log('Starting tests with sequences');
assert.deepEqual(parse("a0x300 b0x500"), {"tag": "seq","left": {"tag": "note","pitch": "a0","dur": 300},"right": {"tag": "note","pitch": "b0","dur": 500}}, 'parse("a0x300 b0x500")');
assert.deepEqual(parse("a0x300 b0x500 c8x800"), {"tag": "seq","left": {"tag": "note","pitch": "a0","dur": 300},"right": {"tag": "seq","left": {"tag": "note","pitch": "b0","dur": 500},"right": {"tag": "note","pitch": "c8","dur": 800}}}, 'parse("a0x300 b0x500 c8x800")');
console.log('Tests with sequences passed!!');

console.log('Starting tests with parallel');
assert.deepEqual(parse("a0x300=b0x500"), {"tag": "par","left": {"tag": "note","pitch": "a0","dur": 300},"right": {"tag": "note","pitch": "b0","dur": 500}}, 'parse("a0x300 b0x500")');
assert.deepEqual(parse("a0x300=b0x500=c8x800"), {"tag": "par","left": {"tag": "note","pitch": "a0","dur": 300},"right": {"tag": "par","left": {"tag": "note","pitch": "b0","dur": 500},"right": {"tag": "note","pitch": "c8","dur": 800}}}, 'parse("a0x300 b0x500 c8x800")');
console.log('Tests with parallell passed!!');

console.log('Starting tests with parallel and sequences');
assert.deepEqual(parse("a0x300=b0x500 c8x800=d5x3"), {"tag": "seq","left": {"tag": "par","left": {"tag": "note","pitch": "a0","dur": 300},"right": {"tag": "note","pitch": "b0","dur": 500}},"right": {"tag": "par","left": {"tag": "note","pitch": "c8","dur": 800},"right": {"tag": "note","pitch": "d5","dur": 3}}}, 'parse("a0x300=b0x500 c8x800=d5x3")');
assert.deepEqual(parse("(a0x300 b0x500)=(c8x800 d5x3)"), {"tag": "par","left": {"tag": "seq","left": {"tag": "note","pitch": "a0","dur": 300},"right": {"tag": "note","pitch": "b0","dur": 500}},"right": {"tag": "seq","left": {"tag": "note","pitch": "c8","dur": 800},"right": {"tag": "note","pitch": "d5","dur": 3}}}, 'parse("a0x300=b0x500 c8x800=d5x3")');
console.log('Tests with parallell and sequences passed!!');

console.log('Starting tests with repeats');
assert.deepEqual(parse("[a0x300]5"), {"tag": "repeat", "section":{"tag": "note","pitch": "a0","dur": 300}, "count":5}, 'parse("[a0x300]5")');
assert.deepEqual(parse("[(a0x300 b0x500)]5"), {"tag": "repeat", "section":{"tag": "seq","left": {"tag": "note","pitch": "a0","dur": 300},"right": {"tag": "note","pitch": "b0","dur": 500}}, "count":5}, 'parse("[a0x300]5")');
assert.deepEqual(parse("[a0x300 b0x500]5"), {"tag": "repeat", "section":{"tag": "seq","left": {"tag": "note","pitch": "a0","dur": 300},"right": {"tag": "note","pitch": "b0","dur": 500}}, "count":5}, 'parse("[a0x300]5")');
assert.deepEqual(parse("[a0x300=b0x500]5"), {"tag": "repeat", "section":{"tag": "par","left": {"tag": "note","pitch": "a0","dur": 300},"right": {"tag": "note","pitch": "b0","dur": 500}}, "count":5}, 'parse("[a0x300]5")');
console.log('Tests with repeats passed!!');

console.log('All tests passed!');

