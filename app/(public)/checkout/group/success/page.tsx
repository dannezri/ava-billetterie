import { Suspense } from 'react';
import GroupSuccessPage from './group-success-client';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <GroupSuccessPage />
    </Suspense>
  );
}
