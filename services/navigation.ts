// ============================================
// NoCharge Safe Debounced Navigation Helper
// ============================================

let lastNavTime = 0;

/**
 * Prevents rapid multiple taps / spam clicks from opening stacked screens.
 * Only permits one navigation transition every `cooldownMs` (default 750ms).
 */
export function safeNavigate(action: () => void, cooldownMs = 750): void {
  const now = Date.now();
  if (now - lastNavTime < cooldownMs) {
    return;
  }
  lastNavTime = now;
  try {
    action();
  } catch (err) {
    console.warn('Navigation error:', err);
  }
}
