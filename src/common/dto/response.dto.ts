export class ResponseDto<T> {
  success: boolean;
  data: T;
  error: string | string[];
  message?: string;
  timestamp: string;

  constructor(success: boolean, data: T, message?: string) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }
}
