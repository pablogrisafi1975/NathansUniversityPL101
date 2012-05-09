var Interpreter = {

	createBasicEnv : function(bindings){
		if(!this.isDefined(bindings)){
			bindings = {};
		}
		bindings['+'] = function(a, b){
				validateTwoNumbers(arguments);
				return a + b;
			};
		bindings['-'] = function(a, b){
				validateTwoNumbers(arguments);
				return a - b;
			};
		bindings['*'] = function(a, b){
				validateTwoNumbers(arguments);
				return a * b;
			};
		bindings['/'] = function(a, b){
				validateTwoNumbers(arguments);
				return a / b;
			};			
		bindings['car'] = function(list){
				validateOneList(arguments);
				return list[0];
			};		
		bindings['cdr'] = function(list){
				validateOneList(arguments);
				return list.slice(1);
			};		
		bindings['cons'] = function(head, tail){
				validateLength(arguments, 2);
				validateList(arguments, 1);
				return [head].concat(tail);
			};					
		bindings['='] = function(a, b){
				validateLength(arguments, 2);
				return scheemBoolean(a === b);
			};
		bindings['<'] = function(a, b){
				validateTwoNumbers(arguments);
				return scheemBoolean(a < b);
			};		
		bindings['alert'] = function(a){
				validateLength(arguments, 1);
				alert(a);
			};	
		bindings['log'] = function(a){
				validateLength(arguments, 1);
				if(window && window.log){
				    log(a);
				}else if(window && window.console && window.console.log){
					console.log(a);
				}
			};				
		bindings['length'] = function(list){
			validateOneList(arguments);
			return list.length;
		}		
		bindings['isEmpty?'] = function(list){
			validateOneList(arguments);
			return scheemBoolean(list.length === 0);
		}	
		bindings['isList?'] = function(list){
			validateLength(arguments, 1);
			return scheemBoolean(Array.isArray(list));
		}			
		bindings['append'] = function(list1, list2){
			validateLength(arguments, 2);
			validateList(arguments, 0);
			validateList(arguments, 1);
			return list1.concat(list2);
		}		
		return {
			outer: {},
			bindings: bindings
		};
		
		function scheemBoolean(b){
			return b ? '#t' : '#f';
		}

		function validateTwoNumbers(args){
			validateLength(args, 2);
			validateNumber(args, 0);
			validateNumber(args, 1);
		}
		
		function validateOneList(args){
			validateLength(args, 1);
			validateList(args, 0);
		}
		
		function validateLength(args, length){
			if(args.length != length){
				throw new Error(args + ' must have ' + length + ' operands');
			}
		}
		
		function validateNumber(args, index){
			if (typeof args[index] !== 'number' ){
				throw new Error('value: ' + args[index] + ' is not a number' );
			}			
		}
		function validateList(args, index){
			if(!Array.isArray(args[index])){
				throw new Error(args[index] + ' should be a list');
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
