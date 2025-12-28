export class ApiException extends Error {
  public code: string;
  public messages: string[] = [];

  constructor(code: string, messages: string[]) {
    super();
    this.code = code;
    this.messages = messages;
  }
}
