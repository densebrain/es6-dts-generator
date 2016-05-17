function inferType(o) {
	if (o.name) {
		return o.name
	} else if (o.constructor) {
		return o.constructor.name
	}

	return typeof o
}

function generate(output,moduleName,parentModuleName) {
	log.info(`Processing ${moduleName}`)
	try {
		let hasDefault = false
		
		const mod = require(moduleName)

		let keys = Object.keys(mod)
		//log.info('Keys:', Object.keys(mod))

		const outputMod = output.addModule(moduleName)
		keys.forEach(key => {
			if (key === 'default') {
				hasDefault = true
				return
			}
			
			//log.info(`${key} has type:`, inferType(mod[key]))
			outputMod.addVar(key)
		})
		
		if (hasDefault && outputMod.vars.length === 0) {
			keys = Object.keys(mod.default).filter(key => key !== 'default')
			const interfaceName = mod.default.name || moduleName.split('/').pop()
			outputMod.addInterface(interfaceName,keys,true)
		}
	} catch (err) {
		if (err.code === 'MODULE_NOT_FOUND')
			log.info(`Unable to find ${moduleName}`)
		else
			log.warn(`Unable to process: ${moduleName}`,err)
	}
}

module.exports = generate