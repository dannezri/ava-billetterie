'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCheck, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface NotificationsPageActionsProps {
  unreadCount: number;
}

export function NotificationsPageActions({ unreadCount }: NotificationsPageActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleMarkAllRead = async () => {
    setLoading('read');
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'PATCH' });
      if (res.ok) {
        toast({ title: 'Toutes les notifications marquées comme lues' });
        router.refresh();
      }
    } catch {
      toast({ title: 'Erreur lors du marquage', variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteRead = async () => {
    setLoading('delete');
    try {
      const res = await fetch('/api/notifications/delete-read', { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Notifications lues supprimées' });
        router.refresh();
      }
    } catch {
      toast({ title: 'Erreur lors de la suppression', variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {unreadCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          disabled={loading === 'read'}
        >
          <CheckCheck className="h-4 w-4 mr-2" />
          Tout marquer lu
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDeleteRead}
        disabled={loading === 'delete'}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Supprimer les lues
      </Button>
    </div>
  );
}
