'use client';

import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Modal from '@cloudscape-design/components/modal';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { useState } from 'react';

import { ValueField } from '@/features/records/value-field';
import { useCreateRecord } from '@/hooks/use-dns-record-mutations';
import { isApiError } from '@/lib/api/errors';
import {
  CREATABLE_RECORD_TYPES,
  type CreatableRecordType,
} from '@/lib/types/dns-record';
import { dnsRecordCreateSchema } from '@/lib/validation/dns-record';
import type { HostedZone } from '@/lib/types/hosted-zone';
import { useNotifications } from '@/providers/notifications-provider';

interface CreateRecordModalProps {
  zone: HostedZone | null;
  onDismiss: () => void;
}

const TYPE_OPTIONS = CREATABLE_RECORD_TYPES.map((t) => ({ value: t, label: t }));

export function CreateRecordModal({ zone, onDismiss }: CreateRecordModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<CreatableRecordType>('A');
  const [ttl, setTtl] = useState('300');
  const [value, setValue] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const { notify } = useNotifications();
  const create = useCreateRecord();

  if (!zone) return null;

  const reset = () => {
    setName('');
    setType('A');
    setTtl('300');
    setValue('');
    setErrors({});
    setApiError(null);
  };

  const submit = async () => {
    setApiError(null);
    const parsed = dnsRecordCreateSchema.safeParse({ name, type, ttl, value });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[issue.path.join('.')] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    try {
      const rec = await create.mutateAsync({ zoneId: zone.id, payload: parsed.data });
      notify({ type: 'success', header: 'Record created', content: `${rec.type} ${rec.name}` });
      reset();
      onDismiss();
    } catch (err) {
      setApiError(isApiError(err) ? err.message : 'Could not create record.');
    }
  };

  return (
    <Modal
      visible
      onDismiss={() => {
        if (!create.isPending) {
          reset();
          onDismiss();
        }
      }}
      size="medium"
      header={`Create record in ${zone.name}`}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss} disabled={create.isPending}>
              Cancel
            </Button>
            <Button variant="primary" loading={create.isPending} onClick={() => void submit()}>
              Create record
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size="m">
        {apiError ? <Box color="text-status-error">{apiError}</Box> : null}
        <FormField
          label="Record name"
          description={`Enter a subdomain (e.g. www) or the zone apex (@). Resolves under ${zone.name}.`}
          errorText={errors.name}
        >
          <Input
            value={name}
            onChange={(e) => setName(e.detail.value)}
            placeholder="www"
            autoFocus
            disabled={create.isPending}
          />
        </FormField>
        <FormField label="Record type">
          <Select
            selectedOption={TYPE_OPTIONS.find((o) => o.value === type) ?? TYPE_OPTIONS[0]!}
            options={TYPE_OPTIONS}
            onChange={(e) =>
              setType(e.detail.selectedOption.value as CreatableRecordType)
            }
            disabled={create.isPending}
          />
        </FormField>
        <FormField label="TTL (seconds)" errorText={errors.ttl}>
          <Input
            type="number"
            value={ttl}
            onChange={(e) => setTtl(e.detail.value)}
            disabled={create.isPending}
          />
        </FormField>
        <ValueField
          type={type}
          value={value}
          onChange={setValue}
          disabled={create.isPending}
          errorText={errors.value}
        />
        <FormField label="Routing policy">
          <Select
            selectedOption={{ value: 'SIMPLE', label: 'Simple routing' }}
            options={[{ value: 'SIMPLE', label: 'Simple routing' }]}
            disabled
          />
        </FormField>
      </SpaceBetween>
    </Modal>
  );
}
