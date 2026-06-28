'use client';

import Box from '@cloudscape-design/components/box';
import { useState } from 'react';

import { ConfirmDeleteModal } from '@/components/ui/confirm-delete-modal';
import { useDeleteRecord } from '@/hooks/use-dns-record-mutations';
import { isApiError } from '@/lib/api/errors';
import type { DnsRecord } from '@/lib/types/dns-record';
import { useNotifications } from '@/providers/notifications-provider';

interface DeleteRecordModalProps {
  record: DnsRecord | null;
  onDismiss: () => void;
}

export function DeleteRecordModal({ record, onDismiss }: DeleteRecordModalProps) {
  const [error, setError] = useState<string | null>(null);
  const { notify } = useNotifications();
  const remove = useDeleteRecord();

  if (!record) return null;

  const confirm = async () => {
    setError(null);
    try {
      await remove.mutateAsync({ zoneId: record.hosted_zone_id, recordId: record.id });
      notify({
        type: 'success',
        header: 'Record deleted',
        content: `${record.type} ${record.name}`,
      });
      onDismiss();
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Could not delete record.');
    }
  };

  return (
    <ConfirmDeleteModal
      visible
      resourceLabel={`${record.type} record`}
      confirmationText={record.name}
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
          Permanently delete the <b>{record.type}</b> record for{' '}
          <Box variant="code">{record.name}</Box>. This cannot be undone. To confirm, type the
          record name below.
        </Box>
      }
    />
  );
}
