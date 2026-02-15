/**
 * tRPC Client Configuration
 * This is used in client components to make tRPC calls
 */

import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from '@/server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();
