'use client';

import Box from '@cloudscape-design/components/box';
import { useState } from 'react';

import { ConfirmDeleteModal } from '@/components/ui/confirm-delete-modal';
import { useDeleteHostedZone } from '@/hooks/use-hosted-zone-mutations';
import { isApiError } from '@/lib/api/errors';
import type { HostedZone } from '@/lib/types/hosted-zone';
import { useNotifications } from '@/providers/notifications-provider';

interface DeleteZoneModalProps {
  zone: HostedZone | null;
  onDismiss: () => void;
}

export function DeleteZoneModal({ zone, onDismiss }: DeleteZoneModalProps) {
  const [error, setError] = useState<string | null>(null);
  const { notify } = useNotifications();
  const remove = useDeleteHostedZone();

  if (!zone) return null;

  const confirm = async () => {
    setError(null);
    try {
      await remove.mutateAsync(zone.id);
      notify({ type: 'success', header: 'Hosted zone deleted', content: zone.name });
      onDismiss();
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Could not delete hosted zone.');
    }
  };

  return (
    <ConfirmDeleteModal
      visible
      resourceLabel="hosted zone"
      confirmationText={zone.name}
      onConfirm={confirm}
      onDismiss={() => {
        if (!remove.isPending) {
          setError(null);
          onDismiss();
        }
      }}
      submitting={remove.isPending}
      errorMessage={error}
      body={
        <Box variant="p">
          Deleting <Box variant="code">{zone.name}</Box> permanently removes the hosted zone and
          all of its DNS records. This cannot be undone. To confirm, type the domain name below.
        </Box>
      }
    />
  );
}
