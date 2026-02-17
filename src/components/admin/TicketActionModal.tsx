'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc/client';

const rejectSchema = z.object({
  rejectionReason: z
    .string()
    .min(10, 'La raison doit contenir au moins 10 caractères'),
});

const infoRequestSchema = z.object({
  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères'),
});

const approveSchema = z.object({
  adminNotes: z.string().optional(),
});

type RejectFormData = z.infer<typeof rejectSchema>;
type InfoRequestFormData = z.infer<typeof infoRequestSchema>;
type ApproveFormData = z.infer<typeof approveSchema>;

interface TicketActionModalProps {
  open: boolean;
  onClose: () => void;
  action: 'approve' | 'reject' | 'request-info';
  ticketId: string;
  eventTitle: string;
  onSuccess: () => void;
}

export function TicketActionModal({
  open,
  onClose,
  action,
  ticketId,
  eventTitle,
  onSuccess,
}: TicketActionModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const approveMutation = trpc.admin.approveTicket.useMutation();
  const rejectMutation = trpc.admin.rejectTicket.useMutation();
  const requestInfoMutation = trpc.admin.requestTicketInfo.useMutation();

  const approveForm = useForm<ApproveFormData>({
    resolver: zodResolver(approveSchema),
  });

  const rejectForm = useForm<RejectFormData>({
    resolver: zodResolver(rejectSchema),
  });

  const infoRequestForm = useForm<InfoRequestFormData>({
    resolver: zodResolver(infoRequestSchema),
  });

  const handleApprove = async (data: ApproveFormData) => {
    setIsSubmitting(true);
    try {
      await approveMutation.mutateAsync({
        ticketId,
        adminNotes: data.adminNotes,
      });

      toast({
        title: 'Billet approuvé',
        description: 'Le vendeur a été notifié par email.',
      });

      approveForm.reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'approuver le billet',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (data: RejectFormData) => {
    setIsSubmitting(true);
    try {
      await rejectMutation.mutateAsync({
        ticketId,
        rejectionReason: data.rejectionReason,
      });

      toast({
        title: 'Billet rejeté',
        description: 'Le vendeur a été notifié par email.',
      });

      rejectForm.reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de rejeter le billet',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestInfo = async (data: InfoRequestFormData) => {
    setIsSubmitting(true);
    try {
      await requestInfoMutation.mutateAsync({
        ticketId,
        message: data.message,
      });

      toast({
        title: 'Demande envoyée',
        description: 'Le vendeur a été notifié par email.',
      });

      infoRequestForm.reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer la demande',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderApproveContent = () => (
    <form onSubmit={approveForm.handleSubmit(handleApprove)}>
      <DialogHeader>
        <DialogTitle className="flex items-center text-green-600">
          <CheckCircle className="w-5 h-5 mr-2" />
          Approuver le billet
        </DialogTitle>
        <DialogDescription>
          Vous êtes sur le point d&apos;approuver le billet pour{' '}
          <strong>{eventTitle}</strong>. Le billet sera visible sur la
          marketplace.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4">
        <Label htmlFor="adminNotes">Notes internes (optionnel)</Label>
        <Textarea
          id="adminNotes"
          placeholder="Notes pour l'équipe..."
          {...approveForm.register('adminNotes')}
          className="mt-2"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Confirmer l&apos;approbation
        </Button>
      </DialogFooter>
    </form>
  );

  const renderRejectContent = () => (
    <form onSubmit={rejectForm.handleSubmit(handleReject)}>
      <DialogHeader>
        <DialogTitle className="flex items-center text-red-600">
          <XCircle className="w-5 h-5 mr-2" />
          Rejeter le billet
        </DialogTitle>
        <DialogDescription>
          Vous êtes sur le point de rejeter le billet pour{' '}
          <strong>{eventTitle}</strong>. Le vendeur recevra un email avec la
          raison du rejet.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4">
        <Label htmlFor="rejectionReason">
          Raison du rejet <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="rejectionReason"
          placeholder="Expliquez pourquoi ce billet est rejeté..."
          {...rejectForm.register('rejectionReason')}
          className="mt-2"
          rows={5}
        />
        {rejectForm.formState.errors.rejectionReason && (
          <p className="text-sm text-red-500 mt-1">
            {rejectForm.formState.errors.rejectionReason.message}
          </p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          Exemples de raisons : PDF illisible, prix supérieur au prix facial,
          document incomplet, signes de falsification...
        </p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="destructive"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Confirmer le rejet
        </Button>
      </DialogFooter>
    </form>
  );

  const renderRequestInfoContent = () => (
    <form onSubmit={infoRequestForm.handleSubmit(handleRequestInfo)}>
      <DialogHeader>
        <DialogTitle className="flex items-center text-blue-600">
          <MessageCircle className="w-5 h-5 mr-2" />
          Demander des informations
        </DialogTitle>
        <DialogDescription>
          Demandez des précisions ou informations complémentaires au vendeur
          pour <strong>{eventTitle}</strong>.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4">
        <Label htmlFor="message">
          Votre message <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="message"
          placeholder="Que souhaitez-vous demander au vendeur ?"
          {...infoRequestForm.register('message')}
          className="mt-2"
          rows={5}
        />
        {infoRequestForm.formState.errors.message && (
          <p className="text-sm text-red-500 mt-1">
            {infoRequestForm.formState.errors.message.message}
          </p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          Le vendeur recevra ce message par email et pourra vous répondre
          directement.
        </p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Envoyer la demande
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        {action === 'approve' && renderApproveContent()}
        {action === 'reject' && renderRejectContent()}
        {action === 'request-info' && renderRequestInfoContent()}
      </DialogContent>
    </Dialog>
  );
}
