import { ExecutorContext } from '@nrwl/devkit';
import { ServeExecutorSchema } from './schema';
export default function runExecutor(options: ServeExecutorSchema, context: ExecutorContext): Promise<{
    success: boolean;
}>;
