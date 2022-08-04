import { AsyncContainerModule } from 'inversify';
import { ExtensionLoader } from '../../lib/extension-loader';
import { ICoreOptions } from '../../models/coreOptions';
import templateEngineModules from '../../lib/template-engine/built-in-extensions';
import validatorModule from '../../lib/validators/built-in-validators';
import { builtInTemplateProvider } from '@vulcan-sql/core/template-engine';
import {
  builtInPersistentStore,
  builtInSerializer,
} from '@vulcan-sql/core/artifact-builder';

export const extensionModule = (options: ICoreOptions) =>
  new AsyncContainerModule(async (bind) => {
    const loader = new ExtensionLoader(options);
    // Internal extension modules

    // Template engine (multiple modules)
    for (const templateEngineModule of templateEngineModules) {
      loader.loadInternalExtensionModule(templateEngineModule);
    }
    // Validator (single module)
    loader.loadInternalExtensionModule(validatorModule);
    // Template provider (single module)
    loader.loadInternalExtensionModule(builtInTemplateProvider);
    // Serializer (single module)
    loader.loadInternalExtensionModule(builtInSerializer);
    // Persistent store (single module)
    loader.loadInternalExtensionModule(builtInPersistentStore);

    // External extension modules
    await loader.loadExternalExtensionModules();

    loader.bindExtensions(bind);
  });
