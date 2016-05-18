const _ = require('lodash')

export class OutputFunction {
	constructor(name,params) {
		this.name = name
		this.params = params || []
	}

	toString(inClazz = false) {
		const paramSig = this.params.map(param => `${param}?:any`).join(', ')
		const fnSig = `${this.name}(${paramSig})${this.name === 'constructor' ? '' : ':any'}\n`
		return '\n' + ((inClazz) ? '' : `export function `) + fnSig
	}
}

export class OutputInterface {
	constructor(name,keys) {
		this.name = name
		this.keys = keys
	}
	toString() {
		let interfaceBody = ""
		this.keys.forEach(key => {
			interfaceBody += `\n${key}:any;\n`
		})

		return `\nexport interface ${this.name} {\n${interfaceBody}\n}\n`
	}
}

export class OutputClass {


	constructor(name,params) {
		this.name = name
		this.params = params
		this.vars = []
		this.fns = []
		this.fn = new OutputFunction(name,params)
	}

	addFunction(name,params) {
		const newFn = new OutputFunction(name,params)
		this.fns.push(newFn)
		return newFn
	}

	addVar(name) {
		this.vars.push(name)
	}

	toString() {
		let clazzBody = this.vars.map(varName => `\n${varName}:any`).join('\n')
		clazzBody += this.fns.map(fn => fn.toString(true)).join('\n')
		clazzBody = (new OutputFunction('constructor',this.params).toString(true)) +
				'\n' + clazzBody

		return `export class ${this.name} {\n${clazzBody}\n}`
	}
}

export class OutputModule {
	constructor(name) {
		this.name = name
		this.vars = []
		this.clazzes = []
		this.fns = []
		this.interfaces = []
	}
	
	addVar(name) {
		if (!this.vars.includes(name))
			this.vars.push(name) 
	}

	addClass(name,params) {
		const clazz = new OutputClass(name,params)
		this.clazzes.push(clazz)
		return clazz
	}

	addFunction(name,params) {
		const fn = new OutputFunction(name,params)
		this.fns.push(fn)
		return fn
	}

	addInterface(name,keys) {
		let interfaceDef = new OutputInterface(name,keys)
		this.interfaces.push(interfaceDef)
		return interfaceDef
	}

	get hasExports() {
		this.vars.length > 0
	}

	toString() {
		let modBody = this.vars.map(varName => `\nexport var ${varName}:any;\n`).join('\n')

		modBody += this.interfaces.map(interfaceDef => interfaceDef.toString()).join('\n')
		modBody += this.clazzes.map(clazzDef => clazzDef.toString()).join('\n')

		if (this.defaultMember) {
			modBody += `\nexport default ${this.defaultMember}\n`
		}

		return modBody
	}
}


export class Output {
	
	constructor() {
		this.modules = {}
	}
	
	
	
	addModule(name) {
		if (this.modules[name]) {
			throw new Error(`Module output already exists ${name}`)
		}
		
		this.modules[name] = new OutputModule(name)
		return this.modules[name] 
	}


	
	toString() {
		let str = ""

		_.each(this.modules,(outputMod,modName) => {
			console.log('Outputing module > ' + modName)
			let modBody = outputMod.toString()
			str += `\ndeclare module "${outputMod.name}" {\n${modBody}\n}\n\n`
		})


		return str
	}
	
	
} 