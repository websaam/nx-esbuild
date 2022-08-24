"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const devkit_1 = require("@nrwl/devkit");
const testing_1 = require("@nrwl/devkit/testing");
const vitest_1 = require("vitest");
const generator_1 = tslib_1.__importDefault(require("./generator"));
(0, vitest_1.describe)('node generator', () => {
    let appTree;
    const options = { name: 'test' };
    (0, vitest_1.beforeEach)(() => {
        appTree = (0, testing_1.createTreeWithEmptyWorkspace)();
    });
    (0, vitest_1.it)('should run successfully', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        yield (0, generator_1.default)(appTree, options);
        const config = (0, devkit_1.readProjectConfiguration)(appTree, 'test');
        (0, vitest_1.expect)(config).toBeDefined();
    }));
});
//# sourceMappingURL=generator.spec.js.map