function evalScheemString(code, env){
	var ast = SCHEEM.parse(code);
	return evalScheem(ast, env);
}
var evalScheem = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    if (typeof expr === 'string') {
        return env[expr];
    }	
    // Look at head of list for operation
    switch (expr[0]) {
        case '+':
        case '-':
        case '*':
        case '/':
			validateExprSize(expr, 3);			
			var a = validateExprIsNumeric(expr, 1, env);
			var b = validateExprIsNumeric(expr, 2, env);
			switch(expr[0]){
				case '+':
					return a + b;
				case '-':
					return a - b;
				case '*':
					return a * b;
				case '/':
					return a / b;  			
			}
        case 'define':
			validateExprSize(expr, 3);
			if(typeof env[expr[1]] !== 'undefined'){
				throw new Error(expr[1] + ' already defined' );
			}
            env[expr[1]] = evalScheem(expr[2], env);
            return 0;
        case 'set!':
			validateExprSize(expr, 3);			
			if(typeof env[expr[1]] === 'undefined'){
				throw new Error(expr[1] + ' not defined' );
			}		
            env[expr[1]] = evalScheem(expr[2], env);
            return 0;  
        case 'begin':    
			if(expr.length < 2){
				throw new Error(expr + ' must have at least one extra element');
			}		
            var result = 0;
            for(var i = 1; i < expr.length; i++){
                result =  evalScheem(expr[i], env);
            }
            return result;			
        case 'cons':
			validateExprSize(expr, 3);		
			var list = validateExprIsList(expr, 2, env);
            return [evalScheem(expr[1], env)].concat(list);			
        case 'car':
			validateExprSize(expr, 2);		
			var list = validateExprIsList(expr, 1, env);
            return list[0];  
        case 'cdr':
			validateExprSize(expr, 2);		
			var list = validateExprIsList(expr, 1, env);		
            return list.slice(1);      
        case '=':
			validateExprSize(expr, 3);		
            var areEqual = (evalScheem(expr[1], env) === evalScheem(expr[2], env));
            return areEqual ? '#t' :'#f';
        case 'if':
			validateExprSize(expr, 4);		
			var result = evalScheem(expr[1], env);
			validateBoolean(result);
            return result === '#t' ? evalScheem(expr[2], env) : evalScheem(expr[3], env);
        case '<':
			validateExprSize(expr, 3);	
			var a = validateExprIsNumeric(expr, 1, env);
			var b = validateExprIsNumeric(expr, 2, env);			
            return  a < b ? '#t' : '#f';   			
        case 'quote':
            return expr[1];
    }
	function validateExprSize(expr, expectedLength){
		if(expr.length !== expectedLength){
			throw new Error(expr + ' must have ' + (expectedLength - 1) + ' operands');
		}
	}
	function validateBoolean(value){
		if(value !== '#t' && value !== '#f' ){
			throw new Error(value + ' must be #t o #f');
		}
	}	
	function validateExprIsList(expr, index, env){
		var list = evalScheem(expr[index], env);
		if(!Array.isArray(list)){
			throw new Error(list + ' should be a list');
		}
		return list;
	}	
	function validateExprIsNumeric(expr, index, env){
		var number = evalScheem(expr[index], env);
		if (typeof number !== 'number' ){
			throw new Error('value: ' + number + ' is not a number' );
		}
		return number;
	}		
};