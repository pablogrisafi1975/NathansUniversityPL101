var Interpreter = {
	validator: {

		validateTwoNumbers: function (args, operation){
			this.validateLength(args, 2, operation);
			this.validateNumber(args, 0, operation);
			this.validateNumber(args, 1, operation);
		},
		
		validateOneList: function (args, operation){
			this.validateLength(args, 1, operation);
			this.validateList(args, 0, operation);
		},
		
		validateLength: function (args, length, operation){
			if(args.length !== length){
				var msg = 'Can not execute ' + operation + 
					' because needs exactly ' + length + 
					' operands and it has ' + args.length + '.';
				if(	args.length > 0){
					var array = Array.prototype.slice.call(args, 0);
					var strToError = this.toStringForError(array, false);
					if(args.length == 1){
						msg += ' It is ' + strToError.substr(1, strToError.length - 2) + '.';					
					}else{
						msg += ' They are ' + strToError.substr(1, strToError.length - 2) + '.';					
					}
				}
				throw new Error(msg);
			}
		},
		
		validateMinLength: function (args, length, operation){
			if(args.length < length){
				var msg = 'Can not execute ' + operation + 
					' because needs a minimun of ' + length + 
					' operands and it has ' + args.length + '.';
				if(	args.length > 0){
					var array = Array.prototype.slice.call(args, 0);
					var strToError = this.toStringForError(array, false);
					if(args.length == 1){
						msg += ' It is ' + strToError.substr(1, strToError.length - 2) + '.';					
					}else{
						msg += ' They are ' + strToError.substr(1, strToError.length - 2) + '.';					
					}
				}
				throw new Error(msg);
			}
		},		
		
		validateNumber: function (args, index, operation){
			if (typeof args[index] !== 'number' ){
				throw new Error('Can not execute ' + operation + 
				' because value in position ' + (index  + 1) + 
				' is not a number. It is ' + this.toStringForError(args[index], true) + '.');
			}			
		},
		
		validateBoolean: function (arg, index, operation){
			if (typeof arg !== 'boolean' ){
				throw new Error('Can not execute ' + operation + 
				' because value in position ' + (index  + 1) + 
				' is not a boolean. It is ' + this.toStringForError(arg, true) + '.');
			}			
		},		
		
		validateList: function (args, index, operation){
			if(!Array.isArray(args[index])){
				throw new Error('Can not execute ' + operation + 
					' because value in position ' + (index  + 1) + 
					' is not a list. It is ' + this.toStringForError(args[index], true) + '.');
			}
		},			
		
		toStringForError: function (a, includeDescription){
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
			else if(typeof a === 'boolean'){
				if(includeDescription){
					return 'a boolean: ' + a;
				}else{
					return a;
				}
			}			
			else if(typeof a === 'undefined'){
				return 'undefined';
			}
			
			else if(typeof a === 'function'){
				if(includeDescription){
					return 'a function';
				}else{
					return 'function';
				}	
			}			
			else if(Array.isArray(a)){
				if(a.length == 0){
					return 'an empty list';
				}else{
					var str = '[';
					for(var i = 0; i < a.length; i++){
						str += this.toStringForError(a[i], false) + ', '
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

	createBasicEnv : function(bindings){
		var validator = this.validator;
		if(!this.isDefined(bindings)){
			bindings = {};
		}
		bindings['+'] = function(a, b){
			validator.validateTwoNumbers(arguments, '+');
			return a + b;
		};
		bindings['-'] = function(a, b){
			validator.validateTwoNumbers(arguments, '-');
			return a - b;
		};
		bindings['*'] = function(a, b){
			validator.validateTwoNumbers(arguments, '*');
			return a * b;
		};
		bindings['/'] = function(a, b){
			validator.validateTwoNumbers(arguments, '/');
			return a / b;
		};			
		bindings['car'] = function(list){
			validator.validateOneList(arguments, 'car');
			return list[0];
		};		
		bindings['cdr'] = function(list){
			validator.validateOneList(arguments, 'cdr');
			return list.slice(1);
		};		
		bindings['cons'] = function(head, tail){
			validator.validateLength(arguments, 2, 'cons');
			validator.validateList(arguments, 1, 'cons')
			return [head].concat(tail);
		};					
		bindings['='] = function(a, b){
			validator.validateLength(arguments, 2, '=');
			return a === b;
		};
		bindings['<'] = function(a, b){
			validator.validateTwoNumbers(arguments, '<');
			return a < b;
		};		
		bindings['alert'] = function(a){
			validator.validateLength(arguments, 1, 'alert');
			alert(a);
		};	
		bindings['log'] = function(a){
			validator.validateLength(arguments, 1, 'log');
			if(window && window.log){
			    log(a);
			}else if(window && window.console && window.console.log){
				console.log(a);
			}
		};				
		bindings['length'] = function(list){
			validator.validateOneList(arguments, 'length');
			return list.length;
		}		
		bindings['isEmpty?'] = function(list){
			validator.validateOneList(arguments, 'isEmpty?');
			return list.length === 0;
		}	
		bindings['isList?'] = function(list){
			validator.validateLength(arguments, 1, 'isList?');
			return Array.isArray(list);
		}			
		bindings['append'] = function(list1, list2){
			validator.validateLength(arguments, 2, 'append');
			validator.validateList(arguments, 0, 'append');
			validator.validateList(arguments, 1, 'append');
			return list1.concat(list2);
		}		
		return {
			outer: {},
			bindings: bindings
		};
	},

	evalScheemString : function (code, env){
		var ast = SCHEEM.parse(code);
		return this.evalScheem(ast, env);
	},
	
	evalScheem : function (expr, env) {
		if(!this.isDefined(env)){
			env = this.createBasicEnv();
		}
		var validator = this.validator;

		// Numbers evaluate to themselves
		if (typeof expr === 'number') {
			return expr;
		}
		// Booleans are booleans
		if(typeof expr === 'boolean'){
			return expr;
		}
		if (typeof expr === 'string') {
			 return this.lookup(env, expr);
		}	
		// Look at head of list for operation
		switch (expr[0]) {
			case 'define':
				validator.validateLength(expr.slice(1), 2, 'define');
				var oldValue = this.lookup(env, expr[1]);
				if(this.isDefined(oldValue)){
					throw new Error('Can not execute define ' +
						' because variable named ' + expr[1] + 
						' already has a value. It is ' + validator.toStringForError(oldValue, true) + '.');
				}
				this.add_binding(env, expr[1], this.evalScheem(expr[2], env));
				return 0;
			case 'set!':
				validator.validateLength(expr.slice(1), 2, 'set!');
				var oldValue = this.lookup(env, expr[1]);
				if(!this.isDefined(oldValue)){
					throw new Error('Can not execute set! ' +
						' because variable named ' + expr[1] + 
						' doesn\'t has a value.');
				}		
				this.update(env, expr[1], this.evalScheem(expr[2], env));
				return 0;  
			case 'begin':    
				validator.validateMinLength(expr.slice(1), 1, 'begin');	
				var result = 0;
				for(var i = 1; i < expr.length; i++){
					result =  this.evalScheem(expr[i], env);
				}
				return result;			
			case 'if':
				validator.validateLength(expr.slice(1), 3, 'if');
				var result = this.evalScheem(expr[1], env);
				validator.validateBoolean(result, 2, 'if');
				return result ? this.evalScheem(expr[2], env) : this.evalScheem(expr[3], env);
			case 'quote':
				return expr[1];
			case 'lambda-one':
				validator.validateLength(expr.slice(1), 2, 'lambda-one');
				var that = this;
				return function(arg) {
					var newEnv = {bindings:{}, outer:env};
					var argName = expr[1];
					newEnv.bindings[argName] = arg; 
					return that.evalScheem(expr[2], newEnv);
				};	
			case 'lambda':
				validator.validateLength(expr.slice(1), 2, 'lambda');
				validator.validateList(expr.slice(1), 0, 'lambda');				
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
				if(!this.isDefined(fun)){
				    throw Error('Can not find a function like ' + expr[0] + '.');
				}
				var args = [];
				for(var i = 1; i < expr.length; i++){
				    args.push(this.evalScheem(expr[i], env))
				}
				return fun.apply(null, args);
		}
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
