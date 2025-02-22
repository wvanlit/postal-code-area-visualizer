import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { PostalCodeRange } from "./PostalCodePicker";

function Map({
  ranges,
  onRangeClick,
}: {
  ranges: PostalCodeRange[];
  onRangeClick: (range: PostalCodeRange) => void;
}) {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    if (mapContainerRef.current === null) {
      return;
    }

    const map = L.map(mapContainerRef.current).setView([51.0046, 8.6808], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    setMap(map);

    return () => {
      map?.remove();
    };
  }, []);

  useEffect(() => {
    if (map === null) {
      return;
    }

    let rangesToAdd = ranges.filter((range) => range.feature !== undefined);

    map.eachLayer((layer) => {
      if (!(layer instanceof L.GeoJSON)) {
        return;
      }

      // @ts-ignore - Accessing custom properties on the layer
      const layerId: string = layer.options.meta;

      const rangeIndex = rangesToAdd.findIndex((range) => range.id === layerId);
      if (rangeIndex !== -1) {
        rangesToAdd = rangesToAdd.filter((_, index) => index !== rangeIndex);
        return;
      }

      map.removeLayer(layer);
    });

    const colors = ["red", "green", "blue", "yellow", "purple", "orange"];

    for (const range of rangesToAdd) {
      L.geoJSON(range.feature.geometry, {
        // @ts-ignore - Adding custom properties to the layer
        meta: range.id,
        style: {
          color: colors[Math.floor(Math.random() * colors.length)],
          fillOpacity: 0.5,
          weight: 2,
          opacity: 1,
        },
      })
        .bindPopup(`${range.start} - ${range.end} (${range.countryCode})`)
        .on("click", () => onRangeClick(range))
        .addTo(map);
    }

    if (rangesToAdd.length === 0) {
      return;
    }

    // Fit the map to the bounds of the GeoJSON layers
    const layers: L.Layer[] = [];
    map.eachLayer((layer) => {
      if (layer instanceof L.GeoJSON) {
        layers.push(layer);
      }
    });

    map.fitBounds(L.featureGroup(layers).getBounds().pad(0.5));
  }, [ranges]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        height: "50vh",
        width: "100%",
      }}
    >
      Some text that should be hidden
    </div>
  );
}

export default Map;
