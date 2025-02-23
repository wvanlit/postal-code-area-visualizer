import L from "leaflet";
import { Feature, FeatureCollection } from "../geojson/types";

export function createMap(ref: React.RefObject<null>): L.Map {
  const map = L.map(ref.current!).setView([51.0046, 8.6808], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  return map;
}

export type MapArea = {
  id: string;
  geometry: FeatureCollection | Feature;
  style: L.PathOptions;
};

export function updateMapAreas(map: L.Map, areas: MapArea[]) {
  removeAreasNotInList(map, areas);

  areas.forEach((area) => {
    L.geoJSON(area.geometry, {
      // @ts-ignore
      id: area.id,
      style: area.style,
    }).addTo(map);
  });

  if (areas.length > 0) {
    fitMapToCurrentAreas(map);
  }
}

function removeAreasNotInList(map: L.Map, areas: MapArea[]) {
  map.eachLayer((layer) => {
    if (!(layer instanceof L.GeoJSON)) {
      return;
    }

    // @ts-ignore
    const id: string | undefined = map.options.id;

    if (id === undefined) {
      return;
    }

    const area = areas.find((area) => area.id === id);

    if (area === undefined) {
      map.removeLayer(layer);
    }
  });
}

function fitMapToCurrentAreas(map: L.Map) {
  const layers: L.Layer[] = [];
  map.eachLayer((layer) => {
    if (layer instanceof L.GeoJSON) {
      layers.push(layer);
    }
  });

  map.fitBounds(L.featureGroup(layers).getBounds().pad(0.5));
}
