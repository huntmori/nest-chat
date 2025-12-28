import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseDto } from '../dto/response.dto';
import { ApiException } from '../exceptions/ApiException';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    const errorResponse = new ResponseDto(false, null, message);

    if (exception instanceof ApiException) {
      errorResponse.error.push(exception);
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message =
        typeof exceptionResponse !== 'string'
          ? (exceptionResponse as any).message || exception.message
          : exceptionResponse;
      errorResponse.message = message;
    } else if (exception instanceof Error) {
      message = exception.message;
      errorResponse.message = message;
    }

    response.status(status).json(errorResponse);
  }
}
