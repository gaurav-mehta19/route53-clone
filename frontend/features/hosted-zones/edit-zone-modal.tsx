'use client';

import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import FormField from '@cloudscape-design/components/form-field';
import Modal from '@cloudscape-design/components/modal';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Textarea from '@cloudscape-design/components/textarea';
import { useEffect, useState } from 'react';

import { useUpdateHostedZone } from '@/hooks/use-hosted-zone-mutations';
import { isApiError } from '@/lib/api/errors';
import type { HostedZone } from '@/lib/types/hosted-zone';
import { useNotifications } from '@/providers/notifications-provider';

interface EditZoneModalProps {
  zone: HostedZone | null;
  onDismiss: () => void;
}

export function EditZoneModal({ zone, onDismiss }: EditZoneModalProps) {
  const [comment, setComment] = useState(zone?.comment ?? '');
  const { notify } = useNotifications();
  const update = useUpdateHostedZone();

  useEffect(() => {
    if (zone) queueMicrotask(() => setComment(zone.comment ?? ''));
  }, [zone]);

  if (!zone) return null;

  const submit = async () => {
    try {
      await update.mutateAsync({ zoneId: zone.id, payload: { comment: comment || null } });
      notify({ type: 'success', header: 'Hosted zone updated', content: zone.name });
      onDismiss();
    } catch (err) {
      const message = isApiError(err) ? err.message : 'Could not update hosted zone.';
      notify({ type: 'error', header: 'Update failed', content: message });
    }
  };

  return (
    <Modal
      visible
      onDismiss={() => {
        if (!update.isPending) onDismiss();
      }}
      header={`Edit hosted zone — ${zone.name}`}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss} disabled={update.isPending}>
              Cancel
            </Button>
            <Button variant="primary" loading={update.isPending} onClick={() => void submit()}>
              Save changes
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size="m">
        <FormField label="Description">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.detail.value)}
            rows={3}
            disabled={update.isPending}
          />
        </FormField>
      </SpaceBetween>
    </Modal>
  );
}
