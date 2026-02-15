/**
 * tRPC exports
 * Central export point for all tRPC utilities
 */

export { trpc } from './client';
export { TRPCProvider } from './provider';
export { createCaller } from './server';
export type { AppRouter } from '@/server/routers/_app';
