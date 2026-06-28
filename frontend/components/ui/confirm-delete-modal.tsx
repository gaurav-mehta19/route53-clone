'use client';

// AWS-style typed-confirmation delete modal. The user has to retype the
// resource identifier before the destructive button enables.

import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Modal from '@cloudscape-design/components/modal';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface ConfirmDeleteModalProps {
  visible: boolean;
  resourceLabel: string;
  /** What the user must type to confirm — usually the resource's name or id. */
  confirmationText: string;
  onConfirm: () => void | Promise<void>;
  onDismiss: () => void;
  submitting?: boolean;
  errorMessage?: string | null;
  body?: ReactNode;
}

export function ConfirmDeleteModal({
  visible,
  resourceLabel,
  confirmationText,
  onConfirm,
  onDismiss,
  submitting = false,
  errorMessage,
  body,
}: ConfirmDeleteModalProps) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    // Defer the reset so we don't trigger a cascading render inside the effect body.
    if (visible) queueMicrotask(() => setTyped(''));
  }, [visible]);

  const canDelete = typed.trim() === confirmationText && !submitting;

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header={`Delete ${resourceLabel}`}
      closeAriaLabel="Close"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={submitting}
              disabled={!canDelete}
              onClick={() => void onConfirm()}
            >
              Delete
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size="m">
        {errorMessage ? (
          <Alert type="error" header="Could not delete">
            {errorMessage}
          </Alert>
        ) : null}
        {body ?? (
          <Box variant="p">
            This action cannot be undone. To confirm, type{' '}
            <Box variant="code">{confirmationText}</Box> below.
          </Box>
        )}
        <FormField label="Confirm">
          <Input
            value={typed}
            onChange={(e) => setTyped(e.detail.value)}
            placeholder={confirmationText}
            disabled={submitting}
          />
        </FormField>
      </SpaceBetween>
    </Modal>
  );
}
