import * as sinon from 'ts-sinon';
import { checkUsableFormat } from '@vulcan-sql/serve/middleware';
import { KoaContext } from '@vulcan-sql/serve/models';

describe('Test to call check usable format function', () => {
  afterEach(() => {
    sinon.default.restore();
  });

  it.each([['json'], ['csv'], ['hyper']])(
    'Test to get default format %p when context path no ending format and "Accept" header not matched.',
    (format) => {
      // Arrange
      const expected = format;
      const context = {
        ...sinon.stubInterface<KoaContext>(),
        path: '/orders',
        accepts: jest.fn().mockReturnValue(false),
      };

      // Act
      const result = checkUsableFormat({
        context,
        supportedFormats: [],
        defaultFormat: format,
      });

      // Assert
      expect(result).toEqual(expected);
    }
  );

  it.each([
    ['json', [], 'json'],
    ['csv', [], 'csv'],
    ['hyper', [], 'hyper'],
  ])(
    'Test to get "Accept" format %p when context path no ending format but "Accept" header matched.',
    (format, supportedFormats, acceptFormat) => {
      // Arrange
      const expected = acceptFormat;
      const context = {
        ...sinon.stubInterface<KoaContext>(),
        path: '/orders',
        accepts: jest.fn().mockReturnValue(acceptFormat),
      };

      // Act
      const result = checkUsableFormat({
        context,
        supportedFormats,
        defaultFormat: 'json',
      });

      // Assert
      expect(result).toEqual(expected);
    }
  );

  it.each([
    ['json', [], false],
    ['json', [], '*/*'],
    ['json', ['csv', 'hyper'], false],
    ['json', ['csv', 'hyper'], '*/*'],
    ['csv', ['hyper', 'json'], false],
    ['csv', ['hyper', 'json'], '*/*'],
    ['hyper', ['csv', 'json'], false],
    ['hyper', ['csv', 'json'], '*/*'],
  ])(
    'Test to throw error when context path ending format %p not matched and "Accept" header %p also not matched.',
    (format, supportedFormats, acceptFormat) => {
      // Arrange
      const expected = new Error(
        `Url ending format and "Accept" header both not matched in "formats" options`
      );
      const context = {
        ...sinon.stubInterface<KoaContext>(),
        path: `/orders.${format}`,
        accepts: jest.fn().mockReturnValue(acceptFormat),
      };

      // Act
      const checkFunc = () =>
        checkUsableFormat({
          context,
          supportedFormats,
          defaultFormat: 'json',
        });

      // Assert
      expect(checkFunc).toThrowError(expected);
    }
  );

  it.each([
    ['json', ['csv', 'hyper'], 'csv'],
    ['csv', ['hyper', 'json'], 'hyper'],
    ['hyper', ['csv', 'xml'], 'xml'],
  ])(
    'Test to get "Accept" format when context path ending format %p not matched but "Accept" header matched.',
    (format, supportedFormats, acceptFormat) => {
      // Arrange
      const expected = acceptFormat;
      const context = {
        ...sinon.stubInterface<KoaContext>(),
        path: `/orders.${format}`,
        accepts: jest.fn().mockReturnValue(acceptFormat),
      };

      // Act
      const result = checkUsableFormat({
        context,
        supportedFormats,
        defaultFormat: 'json',
      });

      // Assert
      expect(result).toEqual(expected);
    }
  );

  it.each([
    ['json', ['json', 'hyper'], false],
    ['json', ['json', 'hyper'], '*/*'],
    ['csv', ['json', 'csv'], false],
    ['csv', ['json', 'csv'], '*/*'],
    ['hyper', ['csv', 'hyper'], false],
    ['hyper', ['csv', 'hyper'], '*/*'],
  ])(
    'Test to get url ending format when context path ending format matched but "Accept" header not matched.',
    (format, supportedFormats, acceptFormat) => {
      // Arrange
      const expected = format;
      const context = {
        ...sinon.stubInterface<KoaContext>(),
        path: `/orders.${format}`,
        accepts: jest.fn().mockReturnValue(acceptFormat),
      };

      // Act
      const result = checkUsableFormat({
        context,
        supportedFormats,
        defaultFormat: 'json',
      });

      // Assert
      expect(result).toEqual(expected);
    }
  );
  it.each([
    ['json', ['json', 'hyper'], 'hyper'],
    ['csv', ['json', 'csv'], 'json'],
    ['hyper', ['csv', 'hyper'], 'csv'],
  ])(
    'Test to get url ending format when context path ending format matched and "Accept" header also matched.',
    (format, supportedFormats, acceptFormat) => {
      // Arrange
      const expected = format;
      const context = {
        ...sinon.stubInterface<KoaContext>(),
        path: `/orders.${format}`,
        accepts: jest.fn().mockReturnValue(acceptFormat),
      };

      // Act
      const result = checkUsableFormat({
        context,
        supportedFormats,
        defaultFormat: 'json',
      });

      // Assert
      expect(result).toEqual(expected);
    }
  );
});
