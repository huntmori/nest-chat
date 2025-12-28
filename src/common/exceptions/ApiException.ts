export class ApiException extends Error {
  public code: string;
  public messages: string[] = [];
}
