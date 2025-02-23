import {
  CountryCode,
  CountryPostalCodeLookup,
  CountryPostalCodeLookupProvider,
  CountryPostalCodeLookups,
  Feature,
  FeatureCollection,
  parseFeatureCollection,
} from "./types";

async function fetchGeoJsonFeatureCollectionFromUrl(url: string): Promise<FeatureCollection> {
  const response = await fetch(url);
  const data = await response.json();

  return parseFeatureCollection(data);
}

async function loadCountryPostalCodeLookupFromUrl(
  url: string,
  provider: CountryPostalCodeLookupProvider
): Promise<CountryPostalCodeLookup> {
  const fc = await fetchGeoJsonFeatureCollectionFromUrl(url);

  return provider(fc.features);
}

export function createCountryPostalCodeLookupProvider(
  postalCodeFinder: (props: Record<string, any>) => string | undefined
): CountryPostalCodeLookupProvider {
  return function (features: Feature[]) {
    const lookup: CountryPostalCodeLookup = {};

    for (const feature of features) {
      if (!feature.properties) {
        console.warn(`Feature ${JSON.stringify(feature)} has no properties`);
        continue;
      }

      const pc = postalCodeFinder(feature.properties);

      if (pc === undefined) {
        console.warn(`Properties of ${JSON.stringify(feature)} contains no postal code`);
        continue;
      }

      lookup[pc] = feature;
    }

    return lookup;
  };
}

export async function createCountryPostalCodeLookups(
  urls: Record<CountryCode, string>,
  providers: Record<CountryCode, CountryPostalCodeLookupProvider>
): Promise<CountryPostalCodeLookups> {
  const lookups: Record<CountryCode, CountryPostalCodeLookup> = {};

  // TODO: Cache using IndexedDB?
  for (const [countryCode, url] of Object.entries(urls)) {
    lookups[countryCode as CountryCode] = await loadCountryPostalCodeLookupFromUrl(
      url,
      providers[countryCode as CountryCode]
    );

    console.log(`Loaded ${countryCode} postal code lookup`);
  }

  return lookups;
}
