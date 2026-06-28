'use client';

// Typed-confirmation modal for deleting N resources at once. Loops a
// per-item delete callback and tracks succeeded / failed counts so the
// user sees what actually happened.

import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Modal from '@cloudscape-design/components/modal';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { useEffect, useState } from 'react';

const CONFIRM = 'delete';

interface BulkDeleteModalProps<T> {
  visible: boolean;
  items: T[];
  /** "hosted zone" / "record" — pluralized in copy with a count prefix. */
  resourceLabel: string;
  /** Stable label per item for the row preview. */
  describe: (item: T) => string;
  /** Per-item delete. Modal awaits each in sequence and surfaces failures. */
  onDeleteOne: (item: T) => Promise<void>;
  onDismiss: () => void;
}

export function BulkDeleteModal<T>({
  visible,
  items,
  resourceLabel,
  describe,
  onDeleteOne,
  onDismiss,
}: BulkDeleteModalProps<T>) {
  const [typed, setTyped] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (visible) queueMicrotask(() => {
      setTyped('');
      setErrors([]);
    });
  }, [visible]);

  const canDelete = typed.trim() === CONFIRM && items.length > 0 && !submitting;

  const confirm = async () => {
    setSubmitting(true);
    const failures: string[] = [];
    for (const item of items) {
      try {
        await onDeleteOne(item);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'unknown error';
        failures.push(`${describe(item)}: ${message}`);
      }
    }
    setSubmitting(false);
    if (failures.length === 0) {
      onDismiss();
    } else {
      setErrors(failures);
    }
  };

  const count = items.length;
  const noun = count === 1 ? resourceLabel : `${resourceLabel}s`;

  return (
    <Modal
      visible={visible}
      onDismiss={() => {
        if (!submitting) onDismiss();
      }}
      header={`Delete ${count} ${noun}`}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" loading={submitting} disabled={!canDelete} onClick={() => void confirm()}>
              Delete
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size="m">
        {errors.length > 0 ? (
          <Alert type="error" header={`Failed to delete ${errors.length} of ${count}`}>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </Alert>
        ) : null}
        <Box variant="p">
          You are about to delete {count} {noun}. This cannot be undone. Type{' '}
          <Box variant="code">{CONFIRM}</Box> below to confirm.
        </Box>
        <Box>
          <ul style={{ margin: 0, paddingLeft: 18, maxHeight: 160, overflowY: 'auto' }}>
            {items.slice(0, 25).map((item, i) => (
              <li key={i}><Box variant="code">{describe(item)}</Box></li>
            ))}
            {items.length > 25 ? <li>… and {items.length - 25} more</li> : null}
          </ul>
        </Box>
        <FormField label="Confirm">
          <Input
            value={typed}
            onChange={(e) => setTyped(e.detail.value)}
            placeholder={CONFIRM}
            disabled={submitting}
          />
        </FormField>
      </SpaceBetween>
    </Modal>
  );
}
