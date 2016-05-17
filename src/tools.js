global.addToNodePath = function(newPath) {
	require.main.paths.unshift(newPath)
	require('app-module-path').addPath(newPath)
	process.env.NODE_PATH += ":" + newPath
}

const
	path = require('path'),
	fs = require('fs')


global.isDir = function(filename) {
	return fs.lstatSync(filename).isDirectory()
}

global.recurseDir = function(filename,fn) {
	const files = fs.readdirSync(filename)
	files.forEach(newFilename => {
		newFilename = path.resolve(filename,newFilename)
		if (isDir(newFilename)) {
			fn(newFilename)
			recurseDir(newFilename,fn)
		}
	})
}