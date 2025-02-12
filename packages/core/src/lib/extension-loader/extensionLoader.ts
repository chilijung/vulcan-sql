import { ExtensionBase, ICoreOptions } from '@vulcan-sql/core/models';
import { interfaces } from 'inversify';
import { ClassType, defaultImport, InternalError } from '../utils';
import {
  EXTENSION_ENFORCED_ID_METADATA_KEY,
  EXTENSION_IDENTIFIER_METADATA_KEY,
  EXTENSION_NAME_METADATA_KEY,
  EXTENSION_TYPE_METADATA_KEY,
} from '../../models/extensions/decorators';
import 'reflect-metadata';
import { TYPES } from '../../containers/types';
import { chain, isArray, values } from 'lodash';

type Extension = ClassType<ExtensionBase>;

export type ExtensionModuleEntry = Extension[] | Record<string, Extension>;

export class ExtensionLoader {
  private extensionRegistry = new Map<
    symbol,
    { name: string; extension: Extension }[]
  >();
  private config: ICoreOptions;
  private bound = false;

  constructor(config: ICoreOptions) {
    this.config = config;
  }

  /** Load external extensions (should be called by core package) */
  public async loadExternalExtensionModules() {
    if (this.bound)
      throw new InternalError(
        `We must load all extensions before call bindExtension function`
      );

    const extensionModules =
      // {moduleA: 'nameA', moduleB: ['nameB', 'nameC']}
      chain(this.config?.extensions || {})
        // [['moduleA', 'nameA'], ['moduleB',['nameB', 'nameC']]]
        .toPairs()
        // [{alias: 'moduleA', path: 'nameA'}, {alias: 'moduleB', path: 'nameB'}, {alias: 'moduleB', path: 'nameC'}]
        .flatMap(([alias, path]) =>
          (typeof path === 'string' ? [path] : path).map((p) => ({
            alias,
            path: p,
          }))
        )
        .value();

    for (const module of extensionModules) {
      const moduleEntry = (
        await defaultImport<ExtensionModuleEntry>(module.path)
      )[0];
      const extensions = this.flattenExtensions(moduleEntry);
      extensions.forEach((extension) =>
        this.loadExtension(module.alias, extension)
      );
    }
  }

  public loadInternalExtensionModule(moduleEntry: ExtensionModuleEntry) {
    if (this.bound)
      throw new InternalError(
        `We must load all extensions before call bindExtension function`
      );

    const extensions = this.flattenExtensions(moduleEntry);

    for (const extension of extensions) {
      const name = Reflect.getMetadata(EXTENSION_NAME_METADATA_KEY, extension);
      if (name === undefined)
        throw new InternalError(
          `Internal extension must have @VulcanInternalExtension decorator`
        );
      this.loadExtension(name, extension);
    }
  }

  public bindExtensions(bind: interfaces.Bind) {
    for (const type of this.extensionRegistry.keys()) {
      this.extensionRegistry.get(type)!.forEach(({ name, extension }) => {
        const extensionBinding = bind(type).to(extension).inSingletonScope();
        const { extensionId } = this.getExtensionMetadata(extension);
        if (extensionId)
          extensionBinding.when((request) => {
            // If request contains named tag, i.e. @named or getNamed(), we check the extensionId, otherwise we fulfill the request.
            // It makes both @named tag and @multiInject work at same time.
            const namedTag = request.target.getNamedTag();
            if (namedTag) return namedTag.value === extensionId;
            return true;
          });
        bind(TYPES.ExtensionConfig)
          // Note they we can't bind undefined to container or it throw error while unbinding.
          // https://github.com/inversify/InversifyJS/issues/1462#issuecomment-1202099036
          .toConstantValue(name.length > 0 ? this.config[name] || {} : {})
          .whenInjectedInto(extension);
        bind(TYPES.ExtensionName)
          .toConstantValue(name || '')
          .whenInjectedInto(extension);
      });
    }
    this.bound = true;
  }

  private getExtensionMetadata(extension: ClassType<ExtensionBase>) {
    const extensionId = Reflect.getMetadata(
      EXTENSION_IDENTIFIER_METADATA_KEY,
      extension
    );
    const enforcedId = Reflect.getMetadata(
      EXTENSION_ENFORCED_ID_METADATA_KEY,
      extension
    );
    if (enforcedId && !extensionId)
      throw new InternalError(
        `Extension ${extension.name} needed an extension id but was not found, please use the decorator @VulcanExtensionId to set the id.`
      );

    return {
      extensionId,
    };
  }

  private loadExtension(name: string, extension: Extension) {
    const extensionType = Reflect.getMetadata(
      EXTENSION_TYPE_METADATA_KEY,
      extension
    );
    if (!extensionType)
      throw new InternalError(
        `Extension must have @VulcanExtension decorator, have you use extend the correct super class?`
      );
    if (!this.extensionRegistry.has(extensionType))
      this.extensionRegistry.set(extensionType, []);

    this.extensionRegistry.get(extensionType)!.push({ name, extension });
  }

  private flattenExtensions(moduleEntry: ExtensionModuleEntry): Extension[] {
    if (isArray(moduleEntry)) return moduleEntry;
    return values(moduleEntry);
  }
}
