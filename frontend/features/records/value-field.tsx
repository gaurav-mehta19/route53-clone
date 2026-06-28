'use client';

// Type-aware Value input shared by the create and edit modals.
// Picks a single-line Input or a multi-line Textarea based on the
// record type, and surfaces the per-type placeholder/hint.

import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Textarea from '@cloudscape-design/components/textarea';

import { TYPE_HELP } from '@/features/records/type-help';
import type { CreatableRecordType } from '@/lib/types/dns-record';

interface ValueFieldProps {
  type: CreatableRecordType;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  errorText?: string;
  label?: string;
}

export function ValueField({
  type,
  value,
  onChange,
  disabled,
  errorText,
  label = 'Value / Route traffic to',
}: ValueFieldProps) {
  const help = TYPE_HELP[type];
  return (
    <FormField label={label} description={help.hint} errorText={errorText}>
      {help.multiline ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.detail.value)}
          placeholder={help.placeholder}
          rows={4}
          disabled={disabled}
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.detail.value)}
          placeholder={help.placeholder}
          disabled={disabled}
        />
      )}
    </FormField>
  );
}
