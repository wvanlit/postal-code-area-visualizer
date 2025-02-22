// geojson-parser.ts
import { z } from "zod";

const PointSchema = z.union([
  z.tuple([z.number(), z.number()]),
  z.tuple([z.number(), z.number(), z.number()]),
]);

const GeometrySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(PointSchema)),
  }),
  z.object({
    type: z.literal("MultiPolygon"),
    coordinates: z.array(z.array(z.array(PointSchema))),
  }),
]);

// Define the Feature schema.
const FeatureSchema = z.object({
  type: z.literal("Feature"),
  geometry: GeometrySchema.nullable(), // geometry can be null
  properties: z.record(z.any()).nullable().optional(),
});

// Define the FeatureCollection schema.
export const FeatureCollectionSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(FeatureSchema),
});

// Export TypeScript types inferred from the schemas.
export type Point = z.infer<typeof PointSchema>;
export type Geometry = z.infer<typeof GeometrySchema>;
export type Polygon = z.infer<typeof GeometrySchema>["coordinates"][0];
export type MultiPolygon = z.infer<typeof GeometrySchema>["coordinates"];
export type Feature = z.infer<typeof FeatureSchema>;
export type FeatureCollection = z.infer<typeof FeatureCollectionSchema>;

/**
 * Parses an unknown value into a valid FeatureCollection.
 * Throws an error if the provided data does not match the GeoJSON schema.
 *
 * @param data - The unknown input to parse as a FeatureCollection.
 * @returns A validated FeatureCollection.
 */
export function parseFeatureCollection(data: unknown): FeatureCollection {
  return FeatureCollectionSchema.parse(data);
}

export function parseFeature(data: unknown): Feature {
  return FeatureSchema.parse(data);
}
