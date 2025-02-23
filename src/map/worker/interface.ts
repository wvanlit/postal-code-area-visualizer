import z from "zod";
import { CountryPostalCodeLookups } from "../geojson/types";

const RequestSchema = z.object({
  type: z.literal("load"),
});

type Request = z.infer<typeof RequestSchema>;

const ResponseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("loaded"),
    data: z.custom<CountryPostalCodeLookups>(),
  }),
]);

type Response = z.infer<typeof ResponseSchema>;

export function send(worker: Worker, message: Request) {
  worker.postMessage(message);
}

export function parse(data: unknown): Request {
  return RequestSchema.parse(data);
}

export function respond(message: Response) {
  postMessage(message);
}

export function receive(worker: Worker, callback: (message: Response) => void) {
  worker.onmessage = (e) => {
    // We don't need to validate the message here, as it's already validated in the worker.
    // This saves us some performance, as we don't need to validate the message twice.
    const message = e.data as Response;

    callback(message);
  };
}
