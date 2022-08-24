"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const execa_1 = tslib_1.__importDefault(require("execa"));
const fs_1 = require("fs");
const promises_1 = tslib_1.__importDefault(require("fs/promises"));
const package_manager_1 = require("nx/src/utils/package-manager");
const path_1 = tslib_1.__importDefault(require("path"));
const executor_1 = tslib_1.__importDefault(require("../build/executor"));
function runExecutor(options, context) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!context.projectName) {
            throw new Error('No projectName');
        }
        const packageManager = (0, package_manager_1.detectPackageManager)();
        const appRoot = context.workspace.projects[context.projectName].root;
        const workspaceRoot = context.root;
        if (packageManager !== 'pnpm' && packageManager !== 'yarn') {
            throw new Error('Currently only pnpm and yarn are supported');
        }
        const beforeZipHook = options.beforeZip;
        const afterZipHook = options.afterZip;
        const singleZip = options.singleZip;
        // Need to remove off build options
        delete options.beforeZip;
        delete options.singleZip;
        delete options.afterZip;
        const outdir = options.outdir || (options.outfile && path_1.default.dirname(options.outfile));
        if (!outdir) {
            throw new Error('Cannot calculate outdir');
        }
        const entryPoints = options.entryPoints;
        if (!Array.isArray(entryPoints)) {
            throw new Error('Expecting entryPoints to be an array');
        }
        const result = yield (0, executor_1.default)(options, context);
        if (!result.success) {
            return result;
        }
        const outbase = options.outbase || lowestCommonAncestor(...entryPoints);
        for (const entryPoint of entryPoints) {
            console.log(`> Packaging ${entryPoint}`);
            const entryPointDir = path_1.default.dirname(entryPoint);
            const dir = entryPointDir.replace(outbase || entryPointDir, '');
            const name = path_1.default.parse(entryPoint).name;
            const entrypointOutDir = path_1.default.join(outdir, dir);
            if ((0, fs_1.existsSync)(path_1.default.join(entryPointDir, 'package.json'))) {
                yield promises_1.default.copyFile(path_1.default.join(entryPointDir, 'package.json'), path_1.default.join(entrypointOutDir, 'package.json'));
            }
            else if ((0, fs_1.existsSync)(path_1.default.join(appRoot, 'package.json'))) {
                yield promises_1.default.copyFile(path_1.default.join(appRoot, 'package.json'), path_1.default.join(entrypointOutDir, 'package.json'));
            }
            yield installNodeModulesIntoPackageDir(packageManager, entrypointOutDir, entryPointDir, appRoot, workspaceRoot);
            if (!singleZip) {
                if (beforeZipHook) {
                    yield execa_1.default.command(beforeZipHook, {
                        cwd: entrypointOutDir,
                        stdio: [process.stdin, process.stdout, 'pipe'],
                    });
                }
                // This prob needs to check platform to make it cross platform
                // But need to instruct it to keep symlinks
                const relativeZipLocation = `../${dir || name}.zip`;
                console.log(`> Writing ${path_1.default.relative(process.cwd(), path_1.default.resolve(entrypointOutDir, relativeZipLocation))}`);
                yield (0, execa_1.default)('zip', ['-rqy', relativeZipLocation, `.`], {
                    cwd: entrypointOutDir,
                    stdio: [process.stdin, process.stdout, 'pipe'],
                });
                if (afterZipHook) {
                    yield execa_1.default.command(afterZipHook, {
                        cwd: outdir,
                        stdio: [process.stdin, process.stdout, 'pipe'],
                    });
                }
            }
        }
        if (singleZip) {
            if (beforeZipHook) {
                yield execa_1.default.command(beforeZipHook, {
                    cwd: outdir,
                    stdio: [process.stdin, process.stdout, 'pipe'],
                });
            }
            // This prob needs to check platform to make it cross platform
            // But need to instruct it to keep symlinks
            const relativeZipLocation = `../${outdir
                .split('/')
                .slice(-1)
                .pop()}.zip`;
            console.log(`> Writing ${path_1.default.relative(process.cwd(), path_1.default.resolve(outdir, relativeZipLocation))}`);
            yield (0, execa_1.default)('zip', ['-rqy', relativeZipLocation, `.`], {
                cwd: outdir,
                stdio: [process.stdin, process.stdout, 'pipe'],
            });
            if (afterZipHook) {
                yield execa_1.default.command(afterZipHook, {
                    cwd: outdir,
                    stdio: [process.stdin, process.stdout, 'pipe'],
                });
            }
        }
        return {
            success: true,
        };
    });
}
exports.default = runExecutor;
function installNodeModulesIntoPackageDir(packageManager, entrypointOutDir, entryPointDir, appRoot, workspaceRoot) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (packageManager === 'pnpm') {
            // This creates a lockfile based on the lambda/project package.json
            // https://github.com/pnpm/pnpm/issues/2198#issuecomment-669623478
            yield (0, execa_1.default)('pnpm', ['make-dedicated-lockfile'], {
                cwd: entrypointOutDir,
                stdio: [process.stdin, process.stdout, 'pipe'],
            });
            // Need to add this, otherwise pnpm will find the workspace one and not put the .pnpm folder in the dist folder.
            // This has to be done after we have generated the dedicated lockfile from the main lockfile
            // https://github.com/pnpm/pnpm/discussions/3427#discussioncomment-716016
            yield promises_1.default.writeFile(path_1.default.join(entrypointOutDir, 'pnpm-workspace.yaml'), '');
            // Now install, it will install into the dist folder and virtual store will be in that folder too
            yield (0, execa_1.default)('pnpm', ['install'], {
                cwd: entrypointOutDir,
                stdio: [process.stdin, process.stdout, 'pipe'],
            });
        }
        else if (packageManager === 'yarn') {
            // similar to pnpm make-dedicated-lockfile, just use the project lockfile
            if ((0, fs_1.existsSync)(path_1.default.join(entryPointDir, 'yarn.lock'))) {
                yield promises_1.default.copyFile(path_1.default.join(entryPointDir, 'yarn.lock'), path_1.default.join(entrypointOutDir, 'yarn.lock'));
            }
            else if ((0, fs_1.existsSync)(path_1.default.join(appRoot, 'yarn.lock'))) {
                yield promises_1.default.copyFile(path_1.default.join(appRoot, 'yarn.lock'), path_1.default.join(entrypointOutDir, 'yarn.lock'));
            }
            else if ((0, fs_1.existsSync)(path_1.default.join(workspaceRoot, 'yarn.lock'))) {
                yield promises_1.default.copyFile(path_1.default.join(workspaceRoot, 'yarn.lock'), path_1.default.join(entrypointOutDir, 'yarn.lock'));
            }
            yield (0, execa_1.default)('yarn', ['install', '--prod'], {
                cwd: entrypointOutDir,
                stdio: [process.stdin, process.stdout, 'pipe'],
            });
        }
    });
}
function lowestCommonAncestor(...filepaths) {
    if (filepaths.length <= 1)
        return '';
    const [first, ...rest] = filepaths;
    let ancestor = first.split(path_1.default.sep);
    for (const filepath of rest) {
        filepath; //?
        const directories = filepath.split(path_1.default.sep, ancestor.length);
        let index = 0;
        for (const directory of directories) {
            if (directory === ancestor[index]) {
                index += 1;
            }
            else {
                ancestor = ancestor.slice(0, index);
                break;
            }
        }
        ancestor = ancestor.slice(0, index);
    }
    return ancestor.length <= 1 && ancestor[0] === ''
        ? path_1.default.sep + ancestor[0]
        : ancestor.join(path_1.default.sep);
}
//# sourceMappingURL=executor.js.map