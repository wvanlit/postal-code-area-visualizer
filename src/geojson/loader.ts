import { Feature, parseFeatureCollection } from "./lib";
import { GeoJSONProvider } from "./providers";

/**
 * Load a GeoJSON file from the public/geojson folder
 *
 * @param filename The country code of the GeoJSON file to load
 * @returns The GeoJSON object
 */
export async function loadGeoJson(filename: string) {
  const response = await fetch(`/geojson/${filename}.geojson`);
  const data = await response.json();

  return parseFeatureCollection(data);
}

/**
 * Load multiple GeoJSON files from the public/geojson folder
 *
 * @param filenames The country codes of the GeoJSON files to load
 * @returns The GeoJSON objects
 */
export async function loadGeoJsons(filenames: string[]) {
  return Promise.all(filenames.map(loadGeoJson));
}

export type PostalCodeLookup = Record<string, Feature | undefined>;

function createPostalCodeLookup(
  features: Feature[],
  getPostalCode: (props: any) => string | undefined
): PostalCodeLookup {
  const lookup: PostalCodeLookup = {};

  for (const feature of features) {
    const pc = getPostalCode(feature.properties);
    if (pc === undefined) {
      console.warn(`Feature ${JSON.stringify(feature)} has no postal code`);
      continue;
    }

    lookup[pc] = feature;
  }

  return lookup;
}

export async function createProvider() {
  const nl = createPostalCodeLookup(
    (await loadGeoJson("netherlands")).features,
    (props) => props.pc4_code
  );

  console.log("Loaded NL:", nl);

  const be = createPostalCodeLookup(
    (await loadGeoJson("belgium")).features,
    (props) => props.postcode
  );

  console.log("Loaded BE:", be);

  const de = createPostalCodeLookup(
    (await loadGeoJson("germany")).features,
    (props) => props.plz_code
  );

  console.log("Loaded DE:", de);

  const provider = new GeoJSONProvider(nl, be, de);

  return provider;
}
