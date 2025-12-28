'use client';

import React from 'react';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: (userId: string) => React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isUserLoading } = useUser();

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Signing in...</p>
        </div>
      </div>
    );
  }

  // Once we have a user, render the children, passing the user's UID.
  return <>{children(user.uid)}</>;
}
