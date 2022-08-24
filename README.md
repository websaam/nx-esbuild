# This repo forked from @wanews/nx-esbuild 

- https://github.com/sevenwestmedia-labs/nx-plugins
- https://github.com/sevenwestmedia-labs/nx-plugins/tree/main/libs/nx-esbuild

# Changes made:

- Extracted the `nx-esbuild` from the `nx-plugin` monorepo
- Modified the `plugins` schema to accept an extra argument `function : string`
- Added the ability to specify the constant name to execute eg:

```js

// BEFORE: in the esbuild config file 

const { nodeBuiltIns } = require("esbuild-node-builtins");

require('esbuild').build({
    ...
    plugins: [nodeBuiltIns()],
    ...
});

// NOW: in the project.json file
"buildPackage":{
    "executor": "@websaam/nx-esbuild:package",
    "options":{
        "plugins":[
          {
            "package": "esbuild-node-builtins",
            "function": "nodeBuiltIns"
          }
        ]
    }
}

```

# nx-esbuild

NX Plugin to build your node apps using ESBuild and can serve it by watching the bundle with nodemon

## Generators

### node

Creates a new node application.

- dependencies in package.json will automatically get marked as externals

## Executors

### build

Bundles your node application

#### Options

The available options are listed in libs/nx-esbuild/src/executors/build/schema.json

See https://esbuild.github.io/api/#simple-options for more info on the available options

### package

Primarily designed when bundling lambdas, it will ensure node_modules is installed into dist for each entrypoint, then zips the output folder (ready to be uploaded to AWS)

NOTE: Currently only supports pnpm

#### Externals & node_modules

If you create a package.json next to the entrypoint, it will be used instead of the project package.json. This is useful when you have a specific lambda have less dependencies installed than the project has. Externals will only ever use the root package.json (so it should always be a superset of the lambda entrypoint package.json)

#### beforeZip hook

If there is additional preparation you need to do before zipping, you can use the beforeZip hook. It will be run with a CWD of the output folder.

#### Options

The available options are listed in libs/nx-esbuild/src/executors/build/schema.json

See https://esbuild.github.io/api/#simple-options for more info on the available options

### serve

Bundles your node application in watch mode, then starts nodemon to watch the bundle

#### Options

The available options are listed in llibs/nx-esbuild/src/executors/serve/schema.json

See https://esbuild.github.io/api/#simple-options for more info on the available options

## An option is missing

I have just added the options I needed to start with, to add another just

- Add the option to the schema.json file
- Add the option to the schema.d.ts file
- Consume the option in executor.ts and pass the appropriate cli arg
