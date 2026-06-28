'use client';

import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Modal from '@cloudscape-design/components/modal';
import RadioGroup from '@cloudscape-design/components/radio-group';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Textarea from '@cloudscape-design/components/textarea';
import { useState } from 'react';

import { useCreateHostedZone } from '@/hooks/use-hosted-zone-mutations';
import { isApiError } from '@/lib/api/errors';
import { hostedZoneCreateSchema } from '@/lib/validation/hosted-zone';
import type { ZoneType } from '@/lib/types/hosted-zone';
import { useNotifications } from '@/providers/notifications-provider';

interface CreateZoneModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function CreateZoneModal({ visible, onDismiss }: CreateZoneModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<ZoneType>('PUBLIC');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { notify } = useNotifications();
  const create = useCreateHostedZone();

  const reset = () => {
    setName('');
    setType('PUBLIC');
    setComment('');
    setErrors({});
  };

  const submit = async () => {
    const parsed = hostedZoneCreateSchema.safeParse({ name, type, comment: comment || null });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[issue.path.join('.')] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    try {
      const zone = await create.mutateAsync(parsed.data);
      notify({ type: 'success', header: `Hosted zone created`, content: zone.name });
      reset();
      onDismiss();
    } catch (err) {
      const message = isApiError(err) ? err.message : 'Could not create hosted zone.';
      notify({ type: 'error', header: 'Create failed', content: message });
    }
  };

  return (
    <Modal
      visible={visible}
      onDismiss={() => {
        if (!create.isPending) {
          reset();
          onDismiss();
        }
      }}
      header="Create hosted zone"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss} disabled={create.isPending}>
              Cancel
            </Button>
            <Button variant="primary" loading={create.isPending} onClick={() => void submit()}>
              Create hosted zone
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size="l">
        <FormField
          label="Domain name"
          description="The domain to host (e.g. example.com)."
          errorText={errors.name}
        >
          <Input
            value={name}
            onChange={(e) => setName(e.detail.value)}
            placeholder="example.com"
            autoFocus
            disabled={create.isPending}
          />
        </FormField>
        <FormField label="Type">
          <RadioGroup
            value={type}
            onChange={(e) => setType(e.detail.value as ZoneType)}
            items={[
              { value: 'PUBLIC', label: 'Public hosted zone' },
              { value: 'PRIVATE', label: 'Private hosted zone (for VPCs)' },
            ]}
          />
        </FormField>
        <FormField
          label={
            <span>
              Description <i>- optional</i>
            </span>
          }
          errorText={errors.comment}
        >
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.detail.value)}
            rows={2}
            disabled={create.isPending}
          />
        </FormField>
      </SpaceBetween>
    </Modal>
  );
}
