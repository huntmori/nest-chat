import { validate, ValidationError } from 'class-validator';
import { ApiException } from '../exceptions/ApiException';
import { plainToInstance } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';

export class BaseRequest {
  public static async instanceAndValidate<T, V>(
    classConstructor: ClassConstructor<T>,
    plain: V,
    action: string,
  ): Promise<T> {
    const dto = plainToInstance(classConstructor, plain);

    const errors = await validate(this);
    console.log('request validate');
    if (errors.length > 0) {
      const exception = new ApiException();
      exception.code = action + '.validate';
      errors.forEach((e: ValidationError) => {
        exception.messages.push(e.toString());
      });

      throw exception;
    }

    return dto;
  }
}
