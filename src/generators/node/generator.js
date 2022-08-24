"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const devkit_1 = require("@nrwl/devkit");
const path = tslib_1.__importStar(require("path"));
function normalizeOptions(host, options) {
    const name = (0, devkit_1.names)(options.name).fileName;
    const projectDirectory = options.directory
        ? `${(0, devkit_1.names)(options.directory).fileName}/${name}`
        : `${(0, devkit_1.getWorkspaceLayout)(host).appsDir}/${name}`;
    const projectName = name.replace(new RegExp('/', 'g'), '-');
    const parsedTags = options.tags
        ? options.tags.split(',').map((s) => s.trim())
        : [];
    return Object.assign(Object.assign({}, options), { projectName, projectRoot: projectDirectory, projectDirectory,
        parsedTags });
}
function addFiles(host, options) {
    const templateOptions = Object.assign(Object.assign(Object.assign({}, options), (0, devkit_1.names)(options.name)), { offsetFromRoot: (0, devkit_1.offsetFromRoot)(options.projectRoot), template: '' });
    (0, devkit_1.generateFiles)(host, path.join(__dirname, 'files'), options.projectRoot, templateOptions);
}
function default_1(host, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const normalizedOptions = normalizeOptions(host, options);
        (0, devkit_1.addProjectConfiguration)(host, normalizedOptions.projectName, {
            root: normalizedOptions.projectRoot,
            projectType: 'application',
            sourceRoot: `${normalizedOptions.projectRoot}/src`,
            targets: {
                build: {
                    executor: '@wanews/nx-esbuild:build',
                    options: {
                        platform: 'node',
                        target: 'node14',
                        outfile: `./${normalizedOptions.projectRoot}/dist/bundle.js`,
                        entryPoints: [
                            `./${normalizedOptions.projectRoot}/src/index.ts`,
                        ],
                    },
                },
                package: {
                    executor: '@wanews/nx-esbuild:package',
                    options: {
                        platform: 'node',
                        target: 'node14',
                        outfile: `./${normalizedOptions.projectRoot}/dist/bundle.js`,
                        entryPoints: [
                            `./${normalizedOptions.projectRoot}/src/index.ts`,
                        ],
                    },
                },
                serve: {
                    executor: '@wanews/nx-esbuild:serve',
                    options: {
                        platform: 'node',
                        target: 'node14',
                        outfile: `./${normalizedOptions.projectRoot}/dist/bundle.js`,
                        entryPoints: [
                            `./${normalizedOptions.projectRoot}/src/index.ts`,
                        ],
                    },
                },
                lint: {
                    executor: '@nrwl/linter:eslint',
                    options: {
                        lintFilePatterns: [
                            `${normalizedOptions.projectRoot}/**/*.ts`,
                        ],
                    },
                },
                test: {
                    executor: '@nrwl/workspace:run-commands',
                    options: {
                        command: 'npx vitest --run',
                        cwd: normalizedOptions.projectRoot,
                    },
                },
            },
            tags: normalizedOptions.parsedTags,
        });
        addFiles(host, normalizedOptions);
        if (host.exists('tsconfig.json')) {
            (0, devkit_1.updateJson)(host, 'tsconfig.json', (tsconfig) => {
                if (tsconfig.references) {
                    tsconfig.references.push({
                        path: `./${normalizedOptions.projectRoot}`,
                    });
                    tsconfig.references.sort((a, b) => a.path.localeCompare(b.path));
                }
                return tsconfig;
            });
        }
        // Add project references config to workspace
        if (!host.exists(`tsconfig.settings.json`)) {
            (0, devkit_1.writeJson)(host, `tsconfig.settings.json`, {
                extends: './tsconfig.base.json',
                compilerOptions: {
                    declaration: true,
                    noEmit: false,
                    composite: true,
                    incremental: true,
                },
                exclude: ['node_modules', 'tmp'],
            });
        }
        yield (0, devkit_1.formatFiles)(host);
    });
}
exports.default = default_1;
//# sourceMappingURL=generator.js.map