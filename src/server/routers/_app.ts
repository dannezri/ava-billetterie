/**
 * Main tRPC router
 * Combines all individual routers into one app router
 */

import { router } from '../trpc';
import { ticketRouter } from './ticket';
import { eventRouter } from './event';

/**
 * This is the primary router for your server
 *
 * All routers added in /server/routers should be manually added here
 */
export const appRouter = router({
  ticket: ticketRouter,
  event: eventRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
