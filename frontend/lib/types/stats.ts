export interface UserStats {
  total_zones: number;
  public_zones: number;
  private_zones: number;
  total_records: number;
}

export interface DailyBucket {
  day: string; // ISO date (YYYY-MM-DD)
  records_created: number;
}

export interface Activity {
  buckets: DailyBucket[];
}
