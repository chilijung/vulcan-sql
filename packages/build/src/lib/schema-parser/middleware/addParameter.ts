import { FieldInType, ValidatorDefinition } from '@vulcan-sql/core';
import { RawAPISchema, SchemaParserMiddleware } from './middleware';

interface Parameter {
  name: string;
  locations: { lineNo: number; columnNo: number }[];
  validators: ValidatorDefinition[];
}

export class AddParameter extends SchemaParserMiddleware {
  public async handle(schemas: RawAPISchema, next: () => Promise<void>) {
    // Add fallback value for request property
    schemas.request = schemas.request || [];

    const metadata = schemas.metadata;
    // Skip validation if no metadata found
    if (!metadata?.['parameter.vulcan.com']) return next();

    const parameters: Parameter[] = metadata['parameter.vulcan.com'];
    parameters.forEach((parameter) => {
      // We only check the first value of nested parameters
      const name = parameter.name.split('.')[0];
      const existedParam = schemas.request!.find(
        (paramInSchema) => paramInSchema.fieldName === name
      );

      if (existedParam) {
        if (!existedParam.validators) existedParam.validators = [];
        existedParam.validators.push(...(parameter.validators || []));
      } else {
        schemas.request!.push({
          fieldName: name,
          fieldIn: FieldInType.QUERY,
          validators: parameter.validators || [],
        });
      }
    });
    await next();
  }
}
