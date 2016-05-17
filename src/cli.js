

require('source-map-support').install()
require('shelljs/global')
require('./tools')
global.log = console

const fs = require('fs')
const path = require('path')
const basePath = process.cwd()

const args = require('yargs')
	.usage('$0 -r -s <source-module-path> -o <output-dir> -m <module-name>')
	.option('source', {
		alias: 's',
		type: 'string',
		demand: true,
		describe: 'source module path, probably ' +
			'nested in a node_modules path, ' +
			'remember, every dep has to be resolvable'
	})
	.option('module',{
		alias: 'm',
		type: 'string',
		describe: 'Name to use for the output module, will default to the ' +
		'last part of the source path you provide'
	})
	.option('recurse',{
		alias:'r',
		type: 'boolean',
		default: false,
		describe: 'recurse sub-modules'
	})
	.option('out',{
		alias:'o',
		type: 'string',
		default: `${process.cwd()}/out`,
		describe: 'output path where we should put the dts,' +
			'will default to <pwd>/out'
	})
	.help('help')
	.argv

// Process the arguments
const es6Path = path.resolve(args.source)
const baseModuleName = args.module || es6Path.split('/').pop()
const recurse = args.r

// Correct the node path
addToNodePath(path.resolve(es6Path,'..'))
addToNodePath(path.resolve(es6Path,'../..'))

// Resolve FS paths
const outPath = args.out || `${basePath}/out`
const dtsPath = `${outPath}/${baseModuleName}`
mkdir('-p',dtsPath)

// Create the output and import the generator
// Note the NODE_PATH has changed now, so its ok
// to load - the reason we wait to load is that
// the NODE_PATH needs to be updated before
// the context is established for these
// modules
const Output = require('./Output').Output
const output = new Output()

// Generate the main module first
const generate = require('./generate')
generate(output,baseModuleName,null)

// If recurse enabled then walk the children
if (recurse)
	recurseDir(es6Path,(newModulePath) => {
		let newModuleName = newModulePath.replace(es6Path,'')
		if (newModuleName.charAt(0) !== '/')
			newModuleName = '/' + newModuleName

		newModuleName = baseModuleName + newModuleName
		generate(output,newModuleName)
	})

// Write the output
fs.writeFileSync(`${dtsPath}/index.d.ts`,output.toString())
log.info(`Wrote DTS ${dtsPath}/index.d.ts`)