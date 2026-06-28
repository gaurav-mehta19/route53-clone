'use client';

import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import CopyToClipboard from '@cloudscape-design/components/copy-to-clipboard';
import Link from '@cloudscape-design/components/link';
import { useRouter } from 'next/navigation';

import type { HostedZone } from '@/lib/types/hosted-zone';

export function ZoneNameCell({ zone }: { zone: HostedZone }) {
  const router = useRouter();
  return (
    <Link
      href={`/hosted-zones/${zone.id}`}
      onFollow={(e) => {
        e.preventDefault();
        router.push(`/hosted-zones/${zone.id}`);
      }}
    >
      {zone.name}
    </Link>
  );
}

export function ZoneTypeCell({ type }: { type: HostedZone['type'] }) {
  return <Badge color={type === 'PUBLIC' ? 'blue' : 'grey'}>{type}</Badge>;
}

export function ZoneIdCell({ id }: { id: string }) {
  return (
    <Box>
      <Box variant="code" display="inline">
        {id}
      </Box>{' '}
      <CopyToClipboard
        copyButtonAriaLabel="Copy hosted zone ID"
        copyErrorText="ID failed to copy"
        copySuccessText="ID copied"
        textToCopy={id}
        variant="icon"
      />
    </Box>
  );
}

export function CommentCell({ comment }: { comment: string | null }) {
  if (!comment) return <Box color="text-body-secondary">—</Box>;
  return <span>{comment}</span>;
}
