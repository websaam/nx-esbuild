"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const esbuild_1 = require("esbuild");
const execa_1 = tslib_1.__importDefault(require("execa"));
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const package_manager_1 = require("nx/src/utils/package-manager");
function runExecutor(options, context) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const customServeCommand = options.serveCommand;
        const customServeCommandCwd = options.serveCommandCwd;
        delete options.serveCommand;
        delete options.serveCommandCwd;
        if (!context.projectName) {
            throw new Error('No projectName');
        }
        // Only require a single entrypoint when no custom serve command is specfied
        if (!options.outfile && !customServeCommand) {
            throw new Error('Need to specify outfile in watch mode');
        }
        if (customServeCommandCwd && !customServeCommand) {
            throw new Error('Need to specify serveCommand when serveCommandCwd is specified');
        }
        const packageManager = (0, package_manager_1.detectPackageManager)();
        const packageManagerCmd = packageManager === 'pnpm'
            ? 'pnpm'
            : packageManager === 'yarn'
                ? 'yarn'
                : 'npx';
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
        yield (0, esbuild_1.build)(Object.assign(Object.assign({ bundle: true, sourcemap: true, watch: true, logLevel: 'info' }, options), { external: [
                ...(options.external || []),
                ...Object.keys((packageJson === null || packageJson === void 0 ? void 0 : packageJson.dependencies) || {}),
                ...Object.keys((packageJson === null || packageJson === void 0 ? void 0 : packageJson.devDependencies) || {}),
            ], plugins: (_a = options.plugins) === null || _a === void 0 ? void 0 : _a.map((plugin) => {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const pluginPkg = require(plugin.package);
                return 'default' in pluginPkg
                    ? pluginPkg.default(plugin.args)
                    : pluginPkg(plugin.args);
            }) }));
        const serveProcess = customServeCommand
            ? execa_1.default.command(customServeCommand, {
                stdio: [process.stdin, process.stdout, 'pipe'],
                cwd: customServeCommandCwd,
            })
            : (0, execa_1.default)(packageManagerCmd, [
                'nodemon',
                '-r',
                'dotenv/config',
                '--enable-source-maps',
                options.outfile,
                `--watch`,
                options.outfile,
            ], {
                stdio: [process.stdin, process.stdout, 'pipe'],
            });
        yield serveProcess;
        if (serveProcess.connected) {
            serveProcess.cancel();
        }
        return {
            success: true,
        };
    });
}
exports.default = runExecutor;
//# sourceMappingURL=executor.js.map