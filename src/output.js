const _ = require('lodash')

export class OutputModule {
	constructor(name) {
		this.name = name
		this.vars = []
		this.interfaces = {}
	}
	
	addVar(name) {
		if (!this.vars.includes(name))
			this.vars.push(name) 
	}

	addInterface(name,keys,isDefault = false) {
		this.interfaces[name] = {
			name,keys,isDefault
		}
		return this.interfaces[name]
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

		_.each(this.modules,outputMod => {
			let modBody = ""

			outputMod.vars.forEach(varName => {
				modBody += `\nexport var ${varName}:any;\n`
			})

			const interfaceNames = Object.keys(outputMod.interfaces)
			interfaceNames.forEach(name => {
				const interfaceDef = outputMod.interfaces[name]
				let interfaceBody = ""
				interfaceDef.keys.forEach(key => {
					interfaceBody += `\n${key}:any;\n`
				})

				modBody += `\nexport interface ${name} {\n${interfaceBody}\n}\n`

				if (interfaceDef.isDefault) {
					modBody += `\nexport default ${name}`
				}
			})

			str += `\ndeclare module "${outputMod.name}" {\n${modBody}\n}\n\n`
		})


		return str
	}
	
	
} 