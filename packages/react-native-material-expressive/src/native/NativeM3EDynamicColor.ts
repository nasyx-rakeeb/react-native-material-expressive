import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Android dynamic-colour bridge.
 *
 * Returns a JSON string so the payload shape stays out of codegen:
 * - `{ kind: 'tones', apiLevel, tones }` on API 31–33
 * - `{ kind: 'roles', apiLevel, light, dark }` on API 34+
 * - `{ kind: 'unsupported', apiLevel }` below API 31
 */
export interface Spec extends TurboModule {
  getDynamicColorPayload(): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('M3EDynamicColor');
