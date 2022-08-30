import { AuthUserInfo, KoaContext } from '@vulcan-sql/serve/models';
import {
  APISchema,
  TemplateEngine,
  Pagination,
  DataSource,
} from '@vulcan-sql/core';
import { IRequestValidator } from './requestValidator';
import { IRequestTransformer, RequestParameters } from './requestTransformer';
import { IPaginationTransformer } from './paginationTransformer';

export interface TransformedRequest {
  reqParams: RequestParameters;
  pagination?: Pagination;
}

export interface RouteOptions {
  apiSchema: APISchema;
  reqTransformer: IRequestTransformer;
  reqValidator: IRequestValidator;
  paginationTransformer: IPaginationTransformer;
  templateEngine: TemplateEngine;
}

export interface IRoute {
  respond(ctx: KoaContext): Promise<any>;
}

export abstract class BaseRoute implements IRoute {
  public readonly apiSchema: APISchema;
  protected readonly reqTransformer: IRequestTransformer;
  protected readonly reqValidator: IRequestValidator;
  protected readonly templateEngine: TemplateEngine;
  protected readonly paginationTransformer: IPaginationTransformer;

  constructor({
    apiSchema,
    reqTransformer,
    reqValidator,
    paginationTransformer,
    templateEngine,
  }: RouteOptions) {
    this.apiSchema = apiSchema;
    this.reqTransformer = reqTransformer;
    this.reqValidator = reqValidator;
    this.paginationTransformer = paginationTransformer;
    this.templateEngine = templateEngine;
  }

  public abstract respond(ctx: KoaContext): Promise<any>;

  protected abstract prepare(ctx: KoaContext): Promise<TransformedRequest>;

  protected async handle(user: AuthUserInfo, transformed: TransformedRequest) {
    const { reqParams } = transformed;
    // could template name or template path, use for template engine
    const { templateSource } = this.apiSchema;

    const result = await this.templateEngine.execute(templateSource, {
      context: { params: reqParams, user },
    });
    return result;
  }
}
