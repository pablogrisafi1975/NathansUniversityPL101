var Interpreter = {

	createBasicEnv : function(bindings){
		if(!this.isDefined(bindings)){
			bindings = {};
		}
		bindings['+'] = function(a, b){
				validateTwoNumbers(arguments, '+');
				return a + b;
			};
		bindings['-'] = function(a, b){
				validateTwoNumbers(arguments, '-');
				return a - b;
			};
		bindings['*'] = function(a, b){
				validateTwoNumbers(arguments, '*');
				return a * b;
			};
		bindings['/'] = function(a, b){
				validateTwoNumbers(arguments, '/');
				return a / b;
			};			
		bindings['car'] = function(list){
				validateOneList(arguments, 'car');
				return list[0];
			};		
		bindings['cdr'] = function(list){
				validateOneList(arguments, 'cdr');
				return list.slice(1);
			};		
		bindings['cons'] = function(head, tail){
				validateLength(arguments, 2, 'cons');
				validateList(arguments, 1, 'cons')
				return [head].concat(tail);
			};					
		bindings['='] = function(a, b){
				validateLength(arguments, 2, '=');
				return scheemBoolean(a === b);
			};
		bindings['<'] = function(a, b){
				validateTwoNumbers(arguments, '<');
				return scheemBoolean(a < b);
			};		
		bindings['alert'] = function(a){
				validateLength(arguments, 1, 'alert');
				alert(a);
			};	
		bindings['log'] = function(a){
				validateLength(arguments, 1, 'log');
				if(window && window.log){
				    log(a);
				}else if(window && window.console && window.console.log){
					console.log(a);
				}
			};				
		bindings['length'] = function(list){
			validateOneList(arguments, 'length');
			return list.length;
		}		
		bindings['isEmpty?'] = function(list){
			validateOneList(arguments, 'isEmpty?');
			return scheemBoolean(list.length === 0);
		}	
		bindings['isList?'] = function(list){
			validateLength(arguments, 1, 'isList?');
			return scheemBoolean(Array.isArray(list));
		}			
		bindings['append'] = function(list1, list2){
			validateLength(arguments, 2, 'append');
			validateList(arguments, 0, 'append');
			validateList(arguments, 1, 'append');
			return list1.concat(list2);
		}		
		return {
			outer: {},
			bindings: bindings
		};
		
		function scheemBoolean(b){
			return b ? '#t' : '#f';
		}

		function validateTwoNumbers(args, operation){
			validateLength(args, 2, operation);
			validateNumber(args, 0, operation);
			validateNumber(args, 1, operation);
		}
		
		function validateOneList(args, operation){
			validateLength(args, 1, operation);
			validateList(args, 0, operation);
		}
		
		function validateLength(args, length, operation){
			if(args.length !== length){
				var msg = 'Can not execute ' + operation + 
					' because needs exactly ' + length + 
					' operands and it has ' + args.length + '.';
				if(	args.length > 0){
					var array = Array.prototype.slice.call(args, 0);
					var strToError = toStringForError(array, false);
					if(args.length == 1){
						msg += ' It is ' + strToError.substr(1, strToError.length - 2) + '.';					
					}else{
						msg += ' They are ' + strToError.substr(1, strToError.length - 2) + '.';					
					}
				}
				throw new Error(msg);
			}
		}
		
		function validateNumber(args, index, operation){
			if (typeof args[index] !== 'number' ){
				throw new Error('Can not execute ' + operation + 
				' because value in position ' + (index  + 1) + 
				' is not a number. It is ' + toStringForError(args[index], true) + '.');
			}			
		}
		function validateList(args, index, operation){
			if(!Array.isArray(args[index])){
				throw new Error('Can not execute ' + operation + 
					' because value in position ' + (index  + 1) + 
					' is not a list. It is ' + toStringForError(args[index], true) + '.');
			}
		}			
		
		function toStringForError(a, includeDescription){
			//Can be string, number, list, emptylist, undefined, function
			if(typeof a === 'string'){
				if(includeDescription){
					return 'a string: ' + a;
				}else{
					return "'" + a + "'";
				}	
			}
			else if(typeof a === 'number'){
				if(includeDescription){
					return 'a number: ' + a;
				}else{
					return a;
				}
			}
			if(typeof a === 'undefined'){
				return 'undefined';
			}
			if(typeof a === 'function'){
				if(includeDescription){
					return 'a function';
				}else{
					return 'function';
				}	
			}
			
			if(Array.isArray(a)){
				if(a.length == 0){
					return 'an empty list';
				}else{
					var str = '[';
					for(var i = 0; i < a.length; i++){
						str += toStringForError(a[i], false) + ', '
					}
					str = str.substr(0, str.length - 2) + ']';
					if(includeDescription){
						return 'a list: ' + str;
					}else{
						return str;
					}
				}
			}
		}
		
	},

	evalScheemString : function (code, env){
		var ast = SCHEEM.parse(code);
		return this.evalScheem(ast, env);
	},
	
	evalScheem : function (expr, env) {
		if(!this.isDefined(env)){
			env = this.createBasicEnv();
		}

		// Numbers evaluate to themselves
		if (typeof expr === 'number') {
			return expr;
		}
		if (typeof expr === 'string') {
			 return this.lookup(env, expr);
		}	
		// Look at head of list for operation
		switch (expr[0]) {
			case 'define':
				this.validateExprSize(expr, 3);
				var oldValue = this.lookup(env, expr[1]);
				if(this.isDefined(oldValue)){
					throw new Error(expr[1] + ' already defined' );
				}
				this.add_binding(env, expr[1], this.evalScheem(expr[2], env));
				return 0;
			case 'set!':
				this.validateExprSize(expr, 3);			
				var oldValue = this.lookup(env, expr[1]);
				if(!this.isDefined(oldValue)){
					throw new Error(expr[1] + ' not defined' );
				}		
				this.update(env, expr[1], this.evalScheem(expr[2], env));
				return 0;  
			case 'begin':    
				if(expr.length < 2){
					throw new Error(expr + ' must have at least one extra element');
				}		
				var result = 0;
				for(var i = 1; i < expr.length; i++){
					result =  this.evalScheem(expr[i], env);
				}
				return result;			
			case 'if':
				this.validateExprSize(expr, 4);		
				var result = this.evalScheem(expr[1], env);
				this.validateBoolean(result);
				return result === '#t' ? this.evalScheem(expr[2], env) : this.evalScheem(expr[3], env);
			case 'quote':
				return expr[1];
			case 'lambda-one':
				this.validateExprSize(expr, 3);	
				var that = this;
				return function(arg) {
					var newEnv = {bindings:{}, outer:env};
					var argName = expr[1];
					newEnv.bindings[argName] = arg; 
					return that.evalScheem(expr[2], newEnv);
				};	
			case 'lambda':
				this.validateExprSize(expr, 3);	
				if(!Array.isArray(expr[1])){
					throw new Error(expr[1] + ' should be a list');
				}
				var that = this;
				return function(arg) {
					var newEnv = {bindings:{}, outer:env};
					for(var i = 0; i < expr.length; i++){
						var argName = expr[1][i];
						newEnv.bindings[argName] = arguments[i]; 
					}
					return that.evalScheem(expr[2], newEnv);
				};				
			default: //evaluation!
				var fun =  this.evalScheem(expr[0], env);
				var args = [];
				for(var i = 1; i < expr.length; i++){
				    args.push(this.evalScheem(expr[i], env))
				}
				return fun.apply(null, args);
		}
	},
	
	validateExprSize : function(expr, expectedLength){
		if(expr.length !== expectedLength){
			throw new Error(expr + ' must have ' + (expectedLength - 1) + ' operands');
		}
	},
	
	validateBoolean : function(value){
		if(value !== '#t' && value !== '#f' ){
			throw new Error(value + ' must be #t o #f');
		}
	},
	
	validateExprIsList : function (expr, index, env){
		var list = this.evalScheem(expr[index], env);
		if(!Array.isArray(list)){
			throw new Error(list + ' should be a list');
		}
		return list;
	},
	
	validateExprIsNumeric : function(expr, index, env){
		var number = this.evalScheem(expr[index], env);
		if (typeof number !== 'number' ){
			throw new Error('value: ' + number + ' is not a number' );
		}
		return number;
	},
	
	lookup: function(env, v) {
		if(!env.hasOwnProperty('bindings')){
			return undefined;
		}
		var value = env.bindings[v];
		if(this.isDefined(value)){
			return value;
		}else{
			var outer = env.outer;
			if(this.isDefined(outer)){
				return this.lookup(outer, v);            
			}else{
				return undefined;
			}			
		}
	},
	
	update: function(env, v, val) {
	    if(! env.hasOwnProperty('bindings') && ! env.hasOwnProperty('outer')){
			env.bindings = {};
			env.bindings[v] = val;			
			env.outer = {};
			return;
		}
		if(this.isDefined(env.bindings[v])){
			env.bindings[v] = val;
		}else{
			this.update(env.outer, v, val);
		}
	},
	
	isDefined :function (v){
	   return typeof v !== 'undefined';
	},
	
	add_binding: function(env, v, val) {
	   env.bindings[v] = val;
	}		
}
