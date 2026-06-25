/**
 * @steno/init — Interactive scaffolder for new Steno static-site projects.
 *
 * Recommended usage:
 *
 * ```sh
 * deno run -Ar jsr:@steno/init
 * ```
 *
 * @module
 */

import { runOnboarding } from "./src/onboarding.ts";

export { OnboardingError, runOnboarding } from "./src/onboarding.ts";
export type { ProjectOptions } from "./src/onboarding.ts";

// Run interactively when executed directly.
if (import.meta.main) {
  await runOnboarding();
}
