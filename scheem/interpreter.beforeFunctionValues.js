var Interpreter = {

	evalScheemString : function (code, env){
		var ast = SCHEEM.parse(code);
		return this.evalScheem(ast, env);
	},
	
	evalScheem : function (expr, env) {

		// Numbers evaluate to themselves
		if (typeof expr === 'number') {
			return expr;
		}
		if (typeof expr === 'string') {
			 return this.lookup(env, expr);
		}	
		// Look at head of list for operation
		switch (expr[0]) {
			case '+':
			case '-':
			case '*':
			case '/':
				this.validateExprSize(expr, 3);			
				var a = this.validateExprIsNumeric(expr, 1, env);
				var b = this.validateExprIsNumeric(expr, 2, env);
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
			case 'cons':
				this.validateExprSize(expr, 3);		
				var list = this.validateExprIsList(expr, 2, env);
				return [this.evalScheem(expr[1], env)].concat(list);			
			case 'car':
				this.validateExprSize(expr, 2);		
				var list = this.validateExprIsList(expr, 1, env);
				return list[0];  
			case 'cdr':
				this.validateExprSize(expr, 2);		
				var list = this.validateExprIsList(expr, 1, env);		
				return list.slice(1);      
			case '=':
				this.validateExprSize(expr, 3);		
				var areEqual = (this.evalScheem(expr[1], env) === this.evalScheem(expr[2], env));
				return areEqual ? '#t' :'#f';
			case 'if':
				this.validateExprSize(expr, 4);		
				var result = this.evalScheem(expr[1], env);
				this.validateBoolean(result);
				return result === '#t' ? this.evalScheem(expr[2], env) : this.evalScheem(expr[3], env);
			case '<':
				this.validateExprSize(expr, 3);	
				var a = this.validateExprIsNumeric(expr, 1, env);
				var b = this.validateExprIsNumeric(expr, 2, env);			
				return  a < b ? '#t' : '#f';   			
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
