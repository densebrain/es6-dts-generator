# es6-tsd-generator
_only use when there is no other easy choice_

This tool will generate a non-typed dts with
all sub-modules.  we use `material-ui` and needed
full sub-module support - nothing was quick,
so this came out of it.

In usage - if a module has a `default` export
an interface describing the export is created
and exported.  If a module has a default
and other exports, the default export is current
ignored.

### Install
```bash
npm i -g es6-dts-generator
```

### Usage
```bash

es6-dts-generator [-r] -s <source-module-path> -o <output-dir> -m <module-name>

Options:
  --source, -s   source module path, probably nested in a node_modules path,
                 remember, every dep has to be resolvable    [string] [required]
  --module, -m   Name to use for the output module, will default to the last
                 part of the source path you provide                    [string]
  --recurse, -r  recurse sub-modules                  [boolean] [default: false]
  --out, -o      output path where we should put the dts,will default to
                 <pwd>/out
           [string] [default: "/Users/jglanz/Development/es6-dts-generator/out"]
  --help         Show help                                             [boolean]


```

### Output
In the ou directory provided, you should get
`<module_name>/index.d.ts` with all the modules
and sub-modules(if recurse enabled)

### Todo
Integrate it with tern or esprima to
make some attempt at type inference

### NO UPDATES AHEAD
this was a one-off because we desperately needed
a DTS with sub-modules...but who knows