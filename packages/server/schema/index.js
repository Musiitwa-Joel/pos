import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { loadFiles } from "@graphql-tools/load-files";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const _loadAndNormalize = async (pattern) => {
  const raw = await loadFiles(pattern);
  return raw.map((r) => (r && r.default ? r.default : r));
};

// 1. Dynamic Loading (Catches most modules like user, logs, academics)
const allTypeDefs = await _loadAndNormalize(path.join(__dirname, "./**/typeDefs.js"));
const allResolvers = await _loadAndNormalize(path.join(__dirname, "./**/resolvers.js"));

// 2. Explicit Imports for modules with custom file naming (e.g. hr_typeDefs.js)
let hrTypeDefs = null;
let hrResolvers = null;
try {
  const hrType = await import("./hr/hr_typeDefs.js");
  hrTypeDefs = hrType.default || hrType;
} catch (e) { }

try {
  const hrRes = await import("./hr/hr_resolvers.js");
  hrResolvers = hrRes.default || hrRes;
} catch (e) { }

// 3. Explicit Imports for Settings
let settingsTypeDefs = null;
let settingsResolvers = null;
try {
  const sType = await import("./settings/typeDefs.js");
  settingsTypeDefs = sType.default || sType;
} catch (e) { }

try {
  const sRes = await import("./settings/resolvers.js");
  settingsResolvers = sRes.default || sRes;
} catch (e) { }

const typeDefs = mergeTypeDefs(
  [
    "scalar Upload",
    ...(allTypeDefs || []),
    hrTypeDefs,
    settingsTypeDefs,
  ].filter(Boolean)
);

const resolvers = mergeResolvers(
  [
    ...(allResolvers || []),
    hrResolvers,
    settingsResolvers,
  ].filter(Boolean)
);

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export { typeDefs, resolvers };
