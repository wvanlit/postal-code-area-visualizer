import union from "@turf/union";
import { polygon, featureCollection } from "@turf/helpers";
import { Feature, parseFeature } from "./lib";

/**
 * Merge all polygon features into a single polygon feature.
 * Wraps the Turf.js union function.
 */
export function mergePolygonsFromGeoJSON(features: Feature[]): Feature {
  if (features.length === 0) {
    throw new Error("No polygon features found in the provided GeoJSON data.");
  }

  if (features.length === 1) {
    return features[0];
  }

  const turfPolygons = features.flatMap((feature) => {
    if (feature.geometry === null) {
      throw new Error("A feature has no geometry.");
    }

    if (feature.geometry.type === "Polygon") {
      return polygon(feature.geometry.coordinates);
    }

    if (feature.geometry.type === "MultiPolygon") {
      const multi = feature.geometry.coordinates.map((coords) =>
        polygon(coords)
      );

      return multi;
    }

    throw new Error(`Unsupported geometry type: ${feature.geometry}`);
  });

  const collection = featureCollection(turfPolygons);

  const merged = union(collection);

  return parseFeature(merged);
}
