

function max(a, b){
    return a > b ? a : b;
}

var endTime = function (time, expr) {    
    if(expr.tag == 'note'){
        return time + expr.dur;
    }else if(expr.tag == 'par'){
        return time + max(endTime(0, expr.left), endTime(0, expr.right));
    }else if(expr.tag == 'rest'){
        return time + expr.duration;
    }else if(expr.tag == 'repeat'){
        return time + expr.count * endTime(0, expr.section);
    }
    return time + endTime(0, expr.left) + endTime(0, expr.right);
};

var pitches = {
	A0 : 21,
	B0 : 23,
	
	C1 : 24,
	D1 : 26,
	E1 : 28,
	F1 : 29,
	G1 : 31,
	A1 : 33, 
	B1 : 35,
	
	C1 : 36,
	D1 : 38,
	E2 : 40,
	F2 : 41,
	G2 : 42,
	A2 : 44, 
	B2 : 46,

	C3 : 48,
	D3 : 50,
	E3 : 52,
	F3 : 53,
	G3 : 55,
	A3 : 57, 
	B3 : 59,

	C4 : 60,
	D4 : 62,
	E4 : 64,
	F4 : 65,
	G4 : 67,
	A4 : 69,
	B4 : 71,

	C5 : 72,
	D5 : 74,
	E5 : 76,
	F5 : 77,
	G5 : 79,
	A5 : 81, 
	B5 : 83,

	C6 : 84,
	D6 : 86,
	E6 : 88,
	F6 : 89,
	G6 : 91,
	A6 : 93, 
	B6 : 95,

	C7 : 96,
	D7 : 98,
	E7 : 100,
	F7 : 101,
	G7 : 103,
	A7 : 105,
	B7 : 107,

	C8 : 108}

function midiPitch(pitch){
	if(typeof (pitch) == "Number"){
		return pitch;
	}
	return pitches[pitch.toUpperCase()];
}

var compileFrom = function(musexpr, start, array){
    if(musexpr.tag == 'note'){
        array.push({ tag: 'note', pitch: midiPitch(musexpr.pitch), start: start, dur: musexpr.dur });
    }else if(musexpr.tag == 'par'){
        compileFrom(musexpr.left, start, array);
        compileFrom(musexpr.right, start, array);       
	}else if(musexpr.tag == 'repeat'){		
		var startThis = endTime(0, musexpr.section);
		for(var i = 0; i < musexpr.count; i++){
			compileFrom(musexpr.section, start + i * startThis, array);       
		}
	
	}else if(musexpr.tag == 'rest'){		
		
    	
    }else{
        var endLeft = endTime(0, musexpr.left);
        compileFrom(musexpr.left, start, array);
        compileFrom(musexpr.right, start + endLeft, array);
    }
};
var compile = function (musexpr) {
    var array = [];
    compileFrom(musexpr, 0, array);
    return array;
};

var melody_mus = { tag: 'seq',
      left: 
       { tag: 'par',
         left: { tag: 'rest', duration: 1000 },
         right: {  tag: 'repeat',
  section: { tag: 'note', pitch: 'c4', dur: 250 },
  count: 3 }} ,
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'c4', dur: 500 },
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };/*{ tag: 'repeat',
  section: { tag: 'note', pitch: 'c4', dur: 250 },
  count: 3 };*/
  /*{ tag: 'seq',
      left: 
       { tag: 'par',
         left: { tag: 'rest', duration: 1000 },
         right: { tag: 'note', pitch: 'b4', dur: 250 } },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'c4', dur: 500 },
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };*/
          /*
    { tag: 'seq',
      left: 
       { tag: 'seq',
         left: { tag: 'note', pitch: 'a4', dur: 250 },
         right: { tag: 'note', pitch: 'b4', dur: 250 } },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'c4', dur: 500 },
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };*/
//console.log(midiPitch('c4'))

console.log(melody_mus);
console.log(compile(melody_mus));