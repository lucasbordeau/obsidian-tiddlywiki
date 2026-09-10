import { CodecResult } from '../../../modules/conversion-core/codecs/results/CodecResult';

export function valueOf<Value>(result: CodecResult<Value>): Value {
  if (result.value === undefined) {
    throw new Error(JSON.stringify(result.diagnostics));
  }

  return result.value;
}
