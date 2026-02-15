/**
 * tRPC Server-side caller
 * This is used in Server Components and Server Actions to make tRPC calls
 */

import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/context';
import { cache } from 'react';

/**
 * Create a server-side caller for tRPC
 * This should be used in Server Components and Server Actions
 * 
 * @example
 * ```tsx
 * import { createCaller } from '@/lib/trpc/server';
 * 
 * export default async function Page() {
 *   const caller = await createCaller();
 *   const events = await caller.event.getAll({ limit: 10 });
 *   
 *   return <div>{events.events.map(event => ...)}</div>
 * }
 * ```
 */
export const createCaller = cache(async () => {
  const context = await createContext({
    req: {} as any,
    res: {} as any,
  });

  return appRouter.createCaller(context);
});
