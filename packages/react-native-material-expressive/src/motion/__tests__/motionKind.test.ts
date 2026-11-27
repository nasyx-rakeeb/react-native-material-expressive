import { execFileSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../../../../..');
const CHECKER = path.join(ROOT, 'tools/motion-kind/check.mjs');

function run(...args: string[]): string {
  return execFileSync(process.execPath, [CHECKER, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

describe('motion-kind enforcement', () => {
  it('every animated component declares a spatial or effects kind', () => {
    expect(run()).toMatch(/motion-kind ok: \d+ components/);
  });

  it('the analyzer fails an animation without a declared kind', () => {
    expect(run('--self-test')).toMatch(/motion-kind self-test ok/);
  });
});
