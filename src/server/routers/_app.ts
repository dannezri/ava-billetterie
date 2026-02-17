/**
 * Main tRPC router
 * Combines all individual routers into one app router
 */

import { router } from '../trpc';
import { adminRouter } from './admin';
import { eventRouter } from './event';
import { ticketRouter } from './ticket';

/**
 * This is the primary router for your server
 *
 * All routers added in /server/routers should be manually added here
 */
export const appRouter = router({
  ticket: ticketRouter,
  event: eventRouter,
  admin: adminRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
