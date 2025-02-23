import { z } from "zod";

const PointSchema = z.union([
  z.tuple([z.number(), z.number()]),
  z.tuple([z.number(), z.number(), z.number()]),
  // TODO: Change 3D points to 2D for now, as we don't use the altitude.
  // .transform(([lat, lng, _]) => [lat, lng]),
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

const FeatureSchema = z.object({
  type: z.literal("Feature"),
  geometry: GeometrySchema.nullable(), // geometry can be null
  properties: z.record(z.any()).nullable().optional(),
});

const FeatureCollectionSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(FeatureSchema),
});

export type Point = z.infer<typeof PointSchema>;
export type Geometry = z.infer<typeof GeometrySchema>;
export type Polygon = z.infer<typeof GeometrySchema>["coordinates"][0];
export type MultiPolygon = z.infer<typeof GeometrySchema>["coordinates"];
export type Feature = z.infer<typeof FeatureSchema>;
export type FeatureCollection = z.infer<typeof FeatureCollectionSchema>;

export function parseFeatureCollection(data: unknown): FeatureCollection {
  return FeatureCollectionSchema.parse(data);
}

export function parseFeature(data: unknown): Feature {
  return FeatureSchema.parse(data);
}

const PostalCodeSchema = z.string().regex(/^(\d{4}|\d{5})$/);
const CountryCodeSchema = z.string().length(2);

export function parsePostalCode(data: string): PostalCode {
  return PostalCodeSchema.parse(data);
}

export function parseCountryCode(data: string): CountryCode {
  return CountryCodeSchema.parse(data);
}

export type PostalCode = z.infer<typeof PostalCodeSchema>;
export type CountryCode = z.infer<typeof CountryCodeSchema>;

export type CountryPostalCodeLookup = Record<PostalCode, Feature | undefined>;
export type CountryPostalCodeLookups = Record<CountryCode, CountryPostalCodeLookup>;
export type CountryPostalCodeLookupProvider = (features: Feature[]) => CountryPostalCodeLookup;
