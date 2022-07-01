import { chain } from 'lodash';
import * as nunjucks from 'nunjucks';
import {
  CompileTimeExtension,
  OnAstVisit,
  ProvideMetadata,
} from '../../extension-loader';
import {
  LOOK_UP_PARAMETER,
  PARAMETER_METADATA_NAME,
  REFERENCE_SEARCH_MAX_DEPTH,
} from './constants';

interface Parameter {
  name: string;
  lineNo: number;
  columnNo: number;
}

export class ParametersChecker
  extends CompileTimeExtension
  implements OnAstVisit, ProvideMetadata
{
  public metadataName = PARAMETER_METADATA_NAME;
  private parameters: Parameter[] = [];

  public onVisit(node: nunjucks.nodes.Node): void {
    if (node instanceof nunjucks.nodes.LookupVal) {
      let name = node.val.value;
      let parent: typeof node.target | null = node.target;
      let depth = 0;
      while (parent) {
        depth++;
        if (depth > REFERENCE_SEARCH_MAX_DEPTH) {
          throw new Error('Max depth reached');
        }
        if (parent instanceof nunjucks.nodes.LookupVal) {
          name = parent.val.value + '.' + name;
          parent = parent.target;
        } else if (parent instanceof nunjucks.nodes.FunCall) {
          parent = parent.name;
        } else {
          if (parent.value === LOOK_UP_PARAMETER) {
            this.parameters.push({
              name,
              lineNo: node.lineno,
              columnNo: node.colno,
            });
          }
          parent = null;
        }
      }
    }
  }

  public getMetadata() {
    return chain(this.parameters)
      .groupBy('name')
      .values()
      .map((parameters) => ({
        name: parameters[0].name,
        locations: parameters.map((parameter) => ({
          lineNo: parameter.lineNo,
          columnNo: parameter.columnNo,
        })),
      }))
      .value();
  }
}