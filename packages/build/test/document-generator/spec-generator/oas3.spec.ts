import { OAS3SpecGenerator } from '@vulcan-sql/build/doc-generator';
import { getSchemas, getConfig } from './schema';
import * as jsYaml from 'js-yaml';
import { promises as fs } from 'fs';
import * as path from 'path';
import { get } from 'lodash';

const getGenerator = async () => {
  const config = getConfig();
  return new OAS3SpecGenerator(config, '', {});
};

it('Should generate specification without error', async () => {
  // Arrange
  const generator = await getGenerator();
  const schemas = await getSchemas();
  // Act, Arrange
  expect(async () => {
    const spec = generator.getSpec(schemas);
    await fs.writeFile(
      path.resolve(__dirname, 'oas3-spec.yaml'),
      jsYaml.dump(spec),
      'utf-8'
    );
  }).not.toThrow();
});

it('Parameters in path should be converted to correct format', async () => {
  // Arrange
  const generator = await getGenerator();
  const schemas = await getSchemas();
  // Act
  const spec = generator.getSpec(schemas);
  // Arrange
  expect(Object.keys(spec.paths)[0]).toBe('/user/{id}');
  expect(Object.keys(spec.paths)[1]).toBe('/user/{id}/order/{oid}');
  expect(Object.keys(spec.paths)[2]).toBe('/users');
});

it('Should extract the correct parameters', async () => {
  // Arrange
  const generator = await getGenerator();
  const schemas = await getSchemas();
  // Act
  const spec = generator.getSpec(schemas);
  // Arrange
  expect(spec.paths['/user/{id}']?.get.parameters[0]).toEqual(
    expect.objectContaining({
      name: 'id',
      in: 'path',
      schema: expect.objectContaining({
        type: 'string',
        minLength: 3,
        maxLength: 10,
        pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
      }),
      required: true,
    })
  );
  expect(spec.paths['/user/{id}']?.get.parameters[1]).toEqual(
    expect.objectContaining({
      name: 'agent',
      in: 'header',
      schema: expect.objectContaining({
        type: 'number',
        minimum: 10,
        maximum: 15,
      }),
      required: false,
    })
  );
  expect(spec.paths['/user/{id}']?.get.parameters[2]).toEqual(
    expect.objectContaining({
      name: 'force',
      in: 'query',
      schema: expect.objectContaining({
        type: 'boolean',
      }),
      required: false,
    })
  );
  expect(spec.paths['/user/{id}']?.get.parameters[3]).toEqual(
    expect.objectContaining({
      name: 'username',
      in: 'query',
      schema: expect.objectContaining({
        type: 'string',
        enum: ['ivan', 'eason', 'freda'],
      }),
      required: false,
    })
  );
});

it('Should extract the correct response', async () => {
  // Arrange
  const generator = await getGenerator();
  const schemas = await getSchemas();
  // Act
  const spec = generator.getSpec(schemas);
  // Arrange
  expect(
    get(
      spec,
      'paths./user/{id}.get.responses.200.content.application/json.schema.properties.id'
    )
  ).toEqual(
    expect.objectContaining({
      type: 'string',
      description: 'The unique-id of the user',
    })
  );

  expect(
    get(
      spec,
      'paths./user/{id}.get.responses.200.content.application/json.schema.properties.id'
    )
  ).toEqual(
    expect.objectContaining({
      type: 'string',
      description: 'The unique-id of the user',
    })
  );

  expect(
    get(
      spec,
      'paths./user/{id}.get.responses.200.content.application/json.schema.properties.username'
    )
  ).toEqual(
    expect.objectContaining({
      type: 'string',
      description: 'The username of the user',
    })
  );

  expect(
    get(
      spec,
      'paths./user/{id}.get.responses.200.content.application/json.schema.required'
    )
  ).toEqual(['id', 'username']);

  expect(
    get(
      spec,
      'paths./user/{id}.get.responses.200.content.application/json.schema.properties.groups'
    )
  ).toEqual(
    expect.objectContaining({
      type: 'object',
      description: 'The groups that the user has joined',
    })
  );

  expect(
    get(
      spec,
      'paths./user/{id}.get.responses.200.content.application/json.schema.properties.groups.properties.id'
    )
  ).toEqual(
    expect.objectContaining({
      type: 'string',
      description: 'The unique-id of the group',
    })
  );

  expect(
    get(
      spec,
      'paths./user/{id}.get.responses.200.content.application/json.schema.properties.groups.properties.groupName'
    )
  ).toEqual(
    expect.objectContaining({
      type: 'string',
      description: 'The groupName of the group',
    })
  );

  expect(
    get(
      spec,
      'paths./user/{id}.get.responses.200.content.application/json.schema.properties.groups.properties.public'
    )
  ).toEqual(
    expect.objectContaining({
      type: 'boolean',
      description: 'Whether the group was public',
    })
  );

  expect(
    get(
      spec,
      'paths./user/{id}.get.responses.200.content.application/json.schema.properties.groups.required'
    )
  ).toEqual(['id', 'groupName']);
});

it('Should extract correct errors', async () => {
  // Arrange
  const generator = await getGenerator();
  const schemas = await getSchemas();
  // Act
  const spec = generator.getSpec(schemas);
  // Arrange
  expect(
    get(
      spec,
      'paths./user/{id}.get.responses.400.content.application/json.examples.USER_NOT_FOUND'
    )
  ).toEqual(
    expect.objectContaining({
      description: `We can't find any user with the provided id`,
      value: expect.objectContaining({
        code: 'USER_NOT_FOUND',
        message: `We can't find any user with the provided id`,
      }),
    })
  );

  expect(
    get(
      spec,
      'paths./user/{id}.get.responses.400.content.application/json.examples.AGENT_NOT_ALLOW'
    )
  ).toEqual(
    expect.objectContaining({
      description: `The agent is not allow`,
      value: expect.objectContaining({
        code: 'AGENT_NOT_ALLOW',
        message: `The agent is not allow`,
      }),
    })
  );

  // We shouldn't set 400 error when there is no error code defined
  expect(
    get(spec, 'paths./user/{id}/order/{oid}.get.responses.400')
  ).toBeUndefined();
});

it('Should extract correct API description', async () => {
  // Arrange
  const generator = await getGenerator();
  const schemas = await getSchemas();
  // Act
  const spec = generator.getSpec(schemas);
  // Arrange
  expect(get(spec, 'paths./user/{id}.get.description')).toBe(
    'Get user information'
  );
});
