import "../broker/subscriber.ts";

import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, { origin: "*" });

app.get("/health", () => {
  return "Ok";
});

app.listen({ host: "0.0.0.0", port: 3334 }).then(() => {
  console.log("[INVOICES] http is running");
});
