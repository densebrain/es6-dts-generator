import {Enum} from 'enumify'
class Types extends Enum {}

Types.initEnum(['Class','Other','Function'])


function getParamNames(fn) {
	var funStr = fn.toString();
	return funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g);
}

function isFunction(o) {
	return o && typeof o === 'function'
}

function isClass(o) {
	return isFunction(o) && o.name && o.prototype && o === o.prototype.constructor
}

function getMemberName(outputMod,key) {
	return key === 'default' ? outputMod.name.split('/').pop() : key
}

function inferType(o) {
	if (o) {
		if (isClass(o)) {
			return Types.Class
		} else if (isFunction(o)) {
			return Types.Function
		}
	}

	return Types.Other
}

function addFunction(outputClazzOrMod,mod,key,fn) {
	key = getMemberName(outputClazzOrMod,key)
	outputClazzOrMod.addFunction(key,getParamNames(fn))
	return key
}

function addClass(outputMod,mod,key,clazz) {
	key = getMemberName(outputMod,key)
	const clazzDef = outputMod.addClass(key,getParamNames(clazz))
	const memberNames = Object.getOwnPropertyNames(clazz.prototype).filter(fnName => fnName !== 'constructor')
	memberNames.forEach((memberName) => {
		const member = clazz.prototype[memberName]
		if (isFunction(member)) {
			clazzDef.addFunction(memberName,getParamNames(member))
		} else {
			clazzDef.addVar(memberName)
		}
	})

	// keys = Object.keys().filter(key => key !== 'default')
	// const interfaceName = mod.default.name || moduleName.split('/').pop()
	//outputMod.addInterface(interfaceName,keys)

	return key
}

/**
 * Add a variable to the output module
 *
 * @param outputMod
 * @param mod
 * @param key
 * @returns {*}
 */
function addVar(outputMod,mod,key) {
	key = getMemberName(outputMod,key)
	outputMod.addVar(key)
	return key
}


/**
 * Get all sub member names, owned properties
 * for a given value
 *
 * @param val
 * @returns {Array}
 */
function getValMemberNames(val) {
	let keys = Object.keys(val)
	if (!keys || keys.length === 0) {
		keys = (isClass(val)) ?
			Object.getOwnPropertyNames(val.prototype).filter(fnName => fnName !== 'constructor') :
			Object.getOwnPropertyNames(val)
	}

	return keys
}

/**
 * Add a member to the provided output module
 *
 * @param outputMod
 * @param mod
 * @param key
 * @param val
 * @returns {*}
 */
function addMember(outputMod,mod,key,val) {
	val = val || mod[key]
	switch (inferType(val)) {
		case Types.Class:
			if (Options.disableTypes) {
				if (key !== 'default') {
					return outputMod.addVar(getMemberName(outputMod,key))
				} else {
					return outputMod.addInterface(
						getMemberName(outputMod,key),
						getValMemberNames(val)
					).name
				}

			} else {
				return addClass(outputMod, mod, key, val)
			}

		case Types.Function:
			return addFunction(outputMod,mod,key,val)
		default:
			return addVar(outputMod,mod,key)
	}
}

function generate(output,moduleName,parentModuleName) {
	log.info(`Processing ${moduleName}`)
	try {
		let hasDefault = false

		const mod = require(moduleName)
		const outputMod = output.addModule(moduleName)
		let keys = Object.keys(mod)

		if (isFunction(mod) && mod.name) {
			addMember(outputMod,mod,mod.name,mod)
			outputMod.defaultMember = mod.name
		}

		keys.forEach(key => {

			
			const newKey = addMember(outputMod,mod,key)
			if (key === 'default') {
				outputMod.defaultMember = newKey
			}
		})

		// if (hasDefault) {
		// 	outputMod.defaultMember = addMember(outputMod,mod,'default')
		// }
	} catch (err) {
		if (err.code === 'MODULE_NOT_FOUND')
			log.info(`Unable to find ${moduleName}`)
		else
			log.warn(`Unable to process: ${moduleName}`,err)
	}
}

module.exports = generate