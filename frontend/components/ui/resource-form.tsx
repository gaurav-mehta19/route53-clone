'use client';

// Wrapper for create/edit forms. Standardizes submit/cancel placement,
// error display, and the loading state across hosted-zones and records.

import Alert from '@cloudscape-design/components/alert';
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import Form from '@cloudscape-design/components/form';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import type { FormEvent, ReactNode } from 'react';

interface ResourceFormProps {
  title: string;
  description?: ReactNode;
  submitText?: string;
  cancelText?: string;
  submitting?: boolean;
  errorMessage?: string | null;
  onSubmit: () => void | Promise<void>;
  onCancel?: () => void;
  children: ReactNode;
}

export function ResourceForm({
  title,
  description,
  submitText = 'Create',
  cancelText = 'Cancel',
  submitting = false,
  errorMessage,
  onSubmit,
  onCancel,
  children,
}: ResourceFormProps) {
  const handle = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void onSubmit();
  };

  return (
    <form onSubmit={handle}>
      <Form
        header={<Header variant="h1" description={description}>{title}</Header>}
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            {onCancel ? (
              <Button variant="link" onClick={onCancel} disabled={submitting}>
                {cancelText}
              </Button>
            ) : null}
            <Button variant="primary" formAction="submit" loading={submitting}>
              {submitText}
            </Button>
          </SpaceBetween>
        }
      >
        <SpaceBetween size="l">
          {errorMessage ? (
            <Alert type="error" header="Something went wrong">
              {errorMessage}
            </Alert>
          ) : null}
          <Container>{children}</Container>
        </SpaceBetween>
      </Form>
    </form>
  );
}
