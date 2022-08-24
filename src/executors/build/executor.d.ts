import { ExecutorContext } from '@nrwl/devkit';
import { BuildExecutorSchema } from './schema';
export default function runExecutor(options: BuildExecutorSchema, context: ExecutorContext): Promise<{
    success: boolean;
}>;
