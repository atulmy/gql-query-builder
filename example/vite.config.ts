import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

// The playground consumes gql-query-builder directly from source (../src),
// so you can hack on the library and see changes here with zero rebuild.
// In a real app you'd instead `pnpm add gql-query-builder` and import it by name.
export default defineConfig({
  resolve: {
    alias: {
      "gql-query-builder": fileURLToPath(
        new URL("../src/index.ts", import.meta.url)
      ),
    },
  },
});
