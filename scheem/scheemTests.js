

var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files

// Read file contents
var data = fs.readFileSync('scheem.peg', 'utf-8');
// Show the PEG grammar file
//console.log(data);
// Create my parser
var parse = PEG.buildParser(data).parse;
// Do a test
assert.deepEqual( parse("(a b c)"), ["a", "b", "c"] );
//assert.equal(parse(""), undefined);
console.log('Starting basic tests');
assert.deepEqual(parse("atom"), "atom", 'parse("atom")');
assert.deepEqual(parse("+"), "+", 'parse("+")');
assert.deepEqual(parse("(+ x 3)"), ["+", "x", "3"], 'parse("(+ x 3)")');
assert.deepEqual(parse("(+ 1 (f x 3 y))"), ["+", "1", ["f", "x", "3", "y"]], 'parse("(+ 1 (f x 3 y))")');
console.log('Basic tests passed!');

//Whitespace - Allow any number of spaces between atoms, 
//and allow spaces around parentheses. 
console.log('Starting tests with spaces between atoms');
assert.deepEqual(parse("(+   x    3)"), ["+", "x", "3"], 'parse("(+    x     3)")');
assert.deepEqual(parse("(    +   x    3)"), ["+", "x", "3"], 'parse("(   +    x    3)")');
assert.deepEqual(parse("(    +   x    3    )"), ["+", "x", "3"], 'parse("(   +    x    3   )")');
assert.deepEqual(parse("(  +   1   (   f    x    3     y  )   )"), ["+", "1", ["f", "x", "3", "y"]], 'parse("  (  +   1   (  f   x   3   y  )  )")');
console.log('Tests with spaces between atoms passed!!');

//Then allow newlines and tabs as well. Make Scheem less ugly.
console.log('Starting tests with enters and tabs');
assert.deepEqual(parse("(+  \n x \t   3)"), ["+", "x", "3"], 'parse("(+ \n   x  \t   3)")');
assert.deepEqual(parse("(  \r\n  + \t  x \r\n   3)"), ["+", "x", "3"], 'parse("(  \r\n +    x    3)")');
assert.deepEqual(parse("(  \r\n  +\t   x\t    3\t    )"), ["+", "x", "3"], 'parse("(   +    x    3   )")');
assert.deepEqual(parse("( \r\n + \r\n  1   (\r\n   f\t    x\r\n    3\r\n     y\t  )  \t )"), ["+", "1", ["f", "x", "3", "y"]], 'parse("  (  +   1   (  f   x   3   y  )  )")');
console.log('Tests with with enters and tabs passed!!');

//Quotes - Scheme has a special syntax 'x that is short for (quote x). So '(1 2 3) is short for (quote (1 2 3))
console.log('Starting tests with qoutes');
assert.deepEqual(parse("'x"), ["qoute", "x"], 'parse("\'x")');
assert.deepEqual(parse("'   x"), ["qoute", "x"], 'parse("\'  x")');
assert.deepEqual(parse("'(1 2 3)"), ["qoute", ["1", "2", "3"]], 'parse("\'(1 2 3))');
console.log('Tests with with quotes passed!!');

//Comments - Anything on a line that appears after ;; is a comment and should be ignored by the parser.
console.log('Starting tests comments');
assert.deepEqual(parse(";;comment\natom"), "atom", 'parse(";;comment\natom")');
assert.deepEqual(parse(";;comment\natom;;comment\n"), "atom", 'parse(";;comment\natom;;comment\n")');
assert.deepEqual(parse(";;comment\natom;;comment"), "atom", 'parse(";;comment\natom;;comment")');
assert.deepEqual(parse(";;comment\n(a b);;comment"), ["a", "b"], 'parse(";;comment\n(a b);;comment")');
assert.deepEqual(parse(";;comment\n(a ;;comment\nb;;comment\n)"), ["a", "b"], ';;comment\n(a ;;comment)b;;comment\n)');
assert.deepEqual(parse(";;comment\n;;comment\n(a b c d)"), ["a", "b", "c", "d"], 'commments at beggining');
assert.deepEqual(parse("(a b c d);;comment\n"), ["a", "b", "c", "d"], 'commments at end');
assert.deepEqual(parse("(a b c d);;comment"), ["a", "b", "c", "d"], 'commments at end no newline');
assert.deepEqual(parse("(a;;comment\n   \n  ;;comment\n b c d);;comment"), ["a", "b", "c", "d"], 'commments after first element');
assert.deepEqual(parse("(a b;;comment\n   \n  ;;comment\n  c d);;comment"), ["a", "b", "c", "d"], 'commments after second element');
assert.deepEqual(parse("(a b c d ;;comment\n)"), ["a", "b", "c", "d"], 'commments before closing');
assert.deepEqual(parse("(a b c d;;comment\n)"), ["a", "b", "c", "d"], 'commments before closing no space');
assert.deepEqual(parse(";;comment\n;;comment\n(;;comment\n;;comment\n  ;;comment\n;;comment\na ;;comment\n   b\n;;comment\n\nc \n;;comment d)\n;;comment\n   ;;comment\n\n\n\nd \n;;comment\n)\n;;comment\n;;comment\n"), ["a", "b", "c", "d"]);
console.log('Tests with comments passed!!');
console.log('All tests passed!');

