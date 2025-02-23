import { createCountryPostalCodeLookupProvider, createCountryPostalCodeLookups } from "../geojson/loader";
import { CountryPostalCodeLookups } from "../geojson/types";

export async function loadCountryPostalCodeLookups(): Promise<CountryPostalCodeLookups> {
  const urls = {
    NL: "/geojson/netherlands.geojson",
    BE: "/geojson/belgium.geojson",
    DE: "/geojson/germany.geojson",
  };

  const providers = {
    NL: createCountryPostalCodeLookupProvider((props) => props.pc4_code),
    BE: createCountryPostalCodeLookupProvider((props) => props.postcode),
    DE: createCountryPostalCodeLookupProvider((props) => props.plz_code),
  };

  return await createCountryPostalCodeLookups(urls, providers);
}
