import { CodecResult } from '../../modules/conversion-core/codecs/CodecResult';

export function getCodecValue<Value>(result: CodecResult<Value>): Value {
  if (result.value === undefined) {
    throw new Error(JSON.stringify(result.diagnostics));
  }

  return result.value;
}
