export const TYPES = {
  // Route Generator
  RequestValidator: Symbol.for('RequestValidator'),
  RequestTransformer: Symbol.for('RequestTransformer'),
  PaginationTransformer: Symbol.for('PaginationTransformer'),
  Route: Symbol.for('Route'),
  RouteGenerator: Symbol.for('RouteGenerator'),
  // Application
  AppConfig: Symbol.for('AppConfig'),
  VulcanApplication: Symbol.for('VulcanApplication'),
  // Extensions
  Extension_RouteMiddleware: Symbol.for('Extension_RouteMiddleware'),
  Extension_Formatter: Symbol.for('Extension_Formatter'),
};
