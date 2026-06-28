'use client';

// "Records created" sparkline on the dashboard. Pulls one bucket per day
// from /api/stats/activity — real data sourced from dns_records.created_at,
// not synthetic placeholders.

import AreaChart from '@cloudscape-design/components/area-chart';
import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Spinner from '@cloudscape-design/components/spinner';

import { useActivity } from '@/hooks/use-stats';

const DAYS = 7;

export function ActivityChart() {
  const { data, isLoading } = useActivity(DAYS);
  const buckets = data?.buckets ?? [];
  const series = buckets.map((b) => ({ x: new Date(b.day), y: b.records_created }));
  const max = series.reduce((m, p) => Math.max(m, p.y), 0);

  return (
    <Container
      header={
        <Header
          variant="h2"
          description={`Records you've created in the last ${DAYS} days.`}
        >
          Activity
        </Header>
      }
    >
      {isLoading ? (
        <Box textAlign="center" padding="m">
          <Spinner />
        </Box>
      ) : (
        <AreaChart
          height={200}
          xScaleType="time"
          xTitle="Day"
          yTitle="Records created"
          yDomain={[0, Math.max(5, max + 1)]}
          series={[
            { title: 'Records created', type: 'area', data: series },
          ]}
          i18nStrings={{
            xTickFormatter: (d) =>
              new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          }}
          ariaLabel="Records created per day"
          empty={
            <Box textAlign="center" color="inherit" padding="m">
              <b>No data yet</b>
              <Box variant="p" color="text-body-secondary">
                Create a few records to populate this chart.
              </Box>
            </Box>
          }
          hideFilter
        />
      )}
    </Container>
  );
}
