import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { createMap, MapArea, updateMapAreas } from "./leaflet";

type MapProps = {
  areas: MapArea[];
  style: React.CSSProperties;
};

function Map({ style, areas }: MapProps) {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    if (mapContainerRef.current === null) {
      return;
    }

    const map = createMap(mapContainerRef);

    setMap(map);

    return () => {
      map?.remove();
    };
  }, []);

  useEffect(() => {
    if (map === null) {
      return;
    }

    updateMapAreas(map, areas);
  }, [map, areas]);

  return <div ref={mapContainerRef} style={style}></div>;
}

export default Map;
