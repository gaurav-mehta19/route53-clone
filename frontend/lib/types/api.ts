// Shared API types — mirror backend pydantic schemas.

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details: Array<{ field?: string; message?: string; type?: string }>;
  };
}

export interface Page<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
}
