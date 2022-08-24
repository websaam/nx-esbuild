import { ExecutorContext } from '@nrwl/devkit';
import { PackageExecutorSchema } from './schema';
export default function runExecutor(options: PackageExecutorSchema, context: ExecutorContext): Promise<{
    success: boolean;
}>;
