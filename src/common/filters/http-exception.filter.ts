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

      const apiException = new ApiException('server.error', []);

      if (typeof exceptionResponse === 'string') {
        apiException.messages.push(exceptionResponse);
      } else if (typeof exceptionResponse === 'object') {
        if ('message' in exceptionResponse) {
          apiException.messages.push(<string>exceptionResponse['message']);
        }
      }

      errorResponse.error.push(apiException);
    } else if (exception instanceof Error) {
      message = exception.message;
      errorResponse.message = message;

      const apiException = new ApiException('server.error', [message]);
      errorResponse.error.push(apiException);
    }

    response.status(status).json(errorResponse);
  }
}
