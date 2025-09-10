import { parseIntQS } from '@/server/http/parsers';

// Pseudo-tests (not wired to a runner):
function assertEqual(a: any, b: any, label: string) {
  if (a !== b) throw new Error(`assertEqual failed: ${label} expected=${b} got=${a}`);
}

(() => {
  assertEqual(parseIntQS('10', 0), 10, 'basic');
  assertEqual(parseIntQS('x', 5), 5, 'fallback');
  assertEqual(parseIntQS('1', 0, 2, 9), 2, 'min clamp');
  assertEqual(parseIntQS('99', 0, 1, 50), 50, 'max clamp');
  assertEqual(parseIntQS(undefined, 7), 7, 'undefined');
})();

export {}; // keep as module

