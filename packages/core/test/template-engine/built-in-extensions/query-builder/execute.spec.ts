import { createTestCompiler } from '../../testCompiler';

it('Extension should call the .value() function of builder', async () => {
  // Arrange
  const { compiler, loader, executor, builder } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `
{% req user %}
select * from users;
{% endreq %}

select * from group where userId = '{{ user.count(3).value()[0].id }}';
`
  );
  builder.value.onFirstCall().resolves([{ id: 'user-id' }]);
  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', {});
  // Assert
  expect(executor.createBuilder.secondCall.args[0]).toBe(
    `select * from group where userId = 'user-id';`
  );
});

it('Extension should throw an error if the main builder failed to execute', async () => {
  // Arrange
  const { compiler, loader, builder } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `
{% req user main %}
select * from users;
{% endreq %}
`
  );
  builder.value.onFirstCall().rejects(new Error('something went wrong'));
  // Action, Assert
  loader.setSource('test', compiledData);
  await expect(compiler.execute('test', {})).rejects.toThrow(
    'something went wrong'
  );
});

it('Extension should throw an error if one of sub builders failed to execute', async () => {
  // Arrange
  const { compiler, loader, builder } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `
{% req user %}
select * from users;
{% endreq %}
select * from group where userId = '{{ user.value()[0].id }}';
`
  );
  builder.value.onFirstCall().rejects(new Error('something went wrong'));
  // Action, Assert
  loader.setSource('test', compiledData);
  await expect(compiler.execute('test', {})).rejects.toThrow(
    'something went wrong'
  );
});
