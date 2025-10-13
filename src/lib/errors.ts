export class HttpError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, opts?: { code?: string }) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = opts?.code;
  }
}