import { registerCliTests } from "./src/cli_test.ts";
import { registerConfigTests } from "./src/config_test.ts";
import { registerFileUtilsTests } from "./src/fileUtils_test.ts";
import { registerFrontmatterTests } from "./src/frontmatter_test.ts";
import { registerScribeTests } from "./src/scribe_test.ts";
import { registerThemeTests } from "./src/theme/theme_test.ts";
import { registerBuildTests } from "./src/build_test.ts";

registerCliTests();
registerConfigTests();
registerFileUtilsTests();
registerFrontmatterTests();
registerScribeTests();
registerThemeTests();
registerBuildTests();
