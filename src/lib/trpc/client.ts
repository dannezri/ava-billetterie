/**
 * tRPC Client Configuration
 * This is used in client components to make tRPC calls
 */

import { type AppRouter } from '@/server/routers/_app';
import { createTRPCReact } from '@trpc/react-query';

export const trpc = createTRPCReact<AppRouter>();
