'use client';

// Edit lets the user change TTL and value. Type + name are immutable in
// Route 53. Only the fields that actually changed are sent to the API so
// that, e.g., bumping the TTL on an SOA record doesn't re-validate its value.

import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Modal from '@cloudscape-design/components/modal';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Textarea from '@cloudscape-design/components/textarea';
import { useEffect, useState } from 'react';

import { ValueField } from '@/features/records/value-field';
import { useUpdateRecord } from '@/hooks/use-dns-record-mutations';
import { isApiError } from '@/lib/api/errors';
import type { CreatableRecordType, DnsRecord } from '@/lib/types/dns-record';
import { CREATABLE_RECORD_TYPES } from '@/lib/types/dns-record';
import { useNotifications } from '@/providers/notifications-provider';

interface EditRecordModalProps {
  record: DnsRecord | null;
  onDismiss: () => void;
}

function isCreatable(type: string): type is CreatableRecordType {
  return (CREATABLE_RECORD_TYPES as readonly string[]).includes(type);
}

export function EditRecordModal({ record, onDismiss }: EditRecordModalProps) {
  const [ttl, setTtl] = useState('');
  const [value, setValue] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const { notify } = useNotifications();
  const update = useUpdateRecord();

  useEffect(() => {
    if (!record) return;
    queueMicrotask(() => {
      setTtl(String(record.ttl));
      setValue(record.value);
      setApiError(null);
    });
  }, [record]);

  if (!record) return null;

  const submit = async () => {
    setApiError(null);
    const payload: { ttl?: number; value?: string } = {};
    const ttlNum = Number(ttl);
    if (!Number.isInteger(ttlNum) || ttlNum < 0 || ttlNum > 604_800) {
      setApiError('TTL must be an integer between 0 and 604800.');
      return;
    }
    if (ttlNum !== record.ttl) payload.ttl = ttlNum;
    if (value !== record.value) payload.value = value;
    if (Object.keys(payload).length === 0) {
      onDismiss();
      return;
    }
    try {
      await update.mutateAsync({ zoneId: record.hosted_zone_id, recordId: record.id, payload });
      notify({ type: 'success', header: 'Record updated', content: `${record.type} ${record.name}` });
      onDismiss();
    } catch (err) {
      setApiError(isApiError(err) ? err.message : 'Could not update record.');
    }
  };

  return (
    <Modal
      visible
      onDismiss={() => {
        if (!update.isPending) onDismiss();
      }}
      header={`Edit ${record.type} record — ${record.name}`}
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
        {apiError ? <Box color="text-status-error">{apiError}</Box> : null}
        <FormField label="TTL (seconds)">
          <Input
            type="number"
            value={ttl}
            onChange={(e) => setTtl(e.detail.value)}
            disabled={update.isPending}
          />
        </FormField>
        {isCreatable(record.type) ? (
          <ValueField
            type={record.type}
            value={value}
            onChange={setValue}
            disabled={update.isPending}
          />
        ) : (
          // SOA values are server-managed; render a read-friendly textarea so
          // the user can tweak the line but knows we don't validate it here.
          <FormField label="Value" description="Auto-managed record. Edit with care.">
            <Textarea
              value={value}
              onChange={(e) => setValue(e.detail.value)}
              rows={3}
              disabled={update.isPending}
            />
          </FormField>
        )}
      </SpaceBetween>
    </Modal>
  );
}
