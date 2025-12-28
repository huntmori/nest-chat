import { validate, ValidationError } from 'class-validator';
import { ApiException } from '../exceptions/ApiException';
import { plainToInstance } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';

export class BaseRequest {
  public static async instanceAndValidate<T extends BaseRequest, V>(
    classConstructor: ClassConstructor<T>,
    plain: V,
    action: string,
  ): Promise<T> {
    const dto = plainToInstance(classConstructor, plain);

    const errors = await validate(dto);

    if (errors.length > 0) {
      throw new ApiException(
        action + '.validate',
        errors.map((e: ValidationError) => e.property),
      );
    }

    return dto;
  }
}
