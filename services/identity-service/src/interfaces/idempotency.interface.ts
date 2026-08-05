export interface IdempotencyRecord {
  key: string;
  status: string; // "processing" or stringified HTTP status code (e.g. "201")
  response?: string | null; // JSON string of the cached response body
  createdAt: Date;
  expiresAt: Date;
}
