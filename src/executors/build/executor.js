"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const esbuild_1 = require("esbuild");
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
function runExecutor(options, context) {
    var _a, _b;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!context.projectName) {
            throw new Error('No projectName');
        }
        const appRoot = context.workspace.projects[context.projectName].root;
        const packageJson = node_fs_1.default.existsSync(`${appRoot}/package.json`)
            ? JSON.parse(node_fs_1.default.readFileSync(`${appRoot}/package.json`).toString())
            : {};
        Object.keys(options).forEach((key) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const value = options[key];
            // NX or json schema default objects to an empty object, this can cause issues with esbuild
            if (typeof value === 'object' && Object.keys(value).length === 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                delete options[key];
            }
        });
        const result = yield (0, esbuild_1.build)(Object.assign(Object.assign({ bundle: true, sourcemap: true, logLevel: 'info', metafile: true }, options), { external: [
                ...(options.external || []),
                ...Object.keys((packageJson === null || packageJson === void 0 ? void 0 : packageJson.dependencies) || {}),
                ...Object.keys((packageJson === null || packageJson === void 0 ? void 0 : packageJson.devDependencies) || {}),
            ], plugins: (_a = options.plugins) === null || _a === void 0 ? void 0 : _a.map((plugin) => {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const pluginPkg = require(plugin.package);
                if (plugin === null || plugin === void 0 ? void 0 : plugin.function) {
                    console.log("[@websaam/nx-esbuild:executor.ts] Using plugin function:", plugin.function);
                    return plugin.function in pluginPkg
                        ? pluginPkg[plugin.function](plugin.args)
                        : pluginPkg(plugin.args);
                }
                console.log("[@websaam/nx-esbuild:executor.ts] Using default");
                return 'default' in pluginPkg
                    ? pluginPkg.default(plugin.args)
                    : pluginPkg(plugin.args);
            }) }));
        return {
            success: !((_b = result.errors) === null || _b === void 0 ? void 0 : _b.length),
        };
    });
}
exports.default = runExecutor;
//# sourceMappingURL=executor.js.map