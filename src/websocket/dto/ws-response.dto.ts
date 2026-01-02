export class WsResponseDto<T> {
  type: string;
  result: boolean;
  error: boolean;
  payload: T;

  constructor(type: string, result: boolean, error: boolean, payload: T) {
    this.type = type;
    this.result = result;
    this.error = error;
    this.payload = payload;
  }
}
