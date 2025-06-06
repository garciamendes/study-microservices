import "@opentelemetry/auto-instrumentations-node/register";

import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { z } from "zod";
import { randomUUID } from "node:crypto";
import { db } from "../db/client.ts";
import { schema } from "../db/schema/index.ts";
import { dispatchOrderCreated } from "../broker/messages/order-created.ts";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, { origin: "*" });

app.get("/health", () => {
  return "Ok";
});

app.post(
  "/orders",
  {
    schema: {
      body: z.object({
        amount: z.number(),
      }),
    },
  },
  async (request, reply) => {
    const { amount } = request.body;
    console.log(`Creating an order with amount: ${amount}`);
    const data = {
      id: randomUUID(),
      amount,
      customerId: "35ac14e6-3428-4b28-90a9-b0ce78ec30d3",
    };

    await db.insert(schema.orders).values(data);

    dispatchOrderCreated({
      amount: data.amount,
      customer: {
        id: data.customerId,
      },
      orderId: data.id,
    });
    return reply.status(201).send();
  }
);

app.listen({ host: "0.0.0.0", port: 3333 }).then(() => {
  console.log("[ORDERS] http is running");
});
