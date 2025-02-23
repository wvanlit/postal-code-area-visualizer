import { CountryPostalCodeLookups } from "../geojson/types";
import { parse, respond } from "./interface";
import { loadCountryPostalCodeLookups } from "./load";

// Only load the data once
let pcl: CountryPostalCodeLookups | null = null;

onmessage = (e) => {
  const message = parse(e.data);

  console.log("Worker received message:", message);

  if (message.type === "load") {
    load();
  }
};

async function load() {
  if (pcl !== null) {
    respond({ type: "loaded", data: pcl });
  }

  pcl = await loadCountryPostalCodeLookups();

  respond({ type: "loaded", data: pcl });
}
