import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs, resolvers } from "./packages/server/schema/index.js";

try {
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  console.log("Schema is valid!");
  process.exit(0);
} catch (err) {
  console.error("Schema validation failed:");
  console.error(err.message);
  process.exit(1);
}
