import { Feature } from "./lib";
import { PostalCodeLookup } from "./loader";
import { mergePolygonsFromGeoJSON } from "./merger";

export class GeoJSONProvider {
  constructor(
    public readonly netherlands: PostalCodeLookup,
    public readonly belgium: PostalCodeLookup,
    public readonly germany: PostalCodeLookup
  ) {}

  log() {
    console.log("Netherlands", this.netherlands);
    console.log("Belgium", this.belgium);
    console.log("Germany", this.germany);
  }

  getFeature(
    country: string,
    postalCodeStart: string,
    postalCodeEnd: string
  ): Feature | null {
    const lookup = this.getLookup(country);
    const pcs = Object.keys(lookup).filter((pc) => {
      // End is exclusive
      return pc >= postalCodeStart && pc < postalCodeEnd;
    });

    if (pcs.length === 0) {
      return null;
    }

    if (pcs.length === 1) {
      return lookup[pcs[0]]!;
    }

    return mergePolygonsFromGeoJSON(pcs.map((pc) => lookup[pc]!));
  }

  getLookup(country: string) {
    switch (country) {
      case "NL":
        return this.netherlands;
      case "BE":
        return this.belgium;
      case "DE":
        return this.germany;
      default:
        throw new Error(`Unsupported country: ${country}`);
    }
  }
}
