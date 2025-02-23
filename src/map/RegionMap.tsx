import { useEffect, useState } from "react";
import Map from "./visualization/Map";
import Worker from "./worker/worker?worker";
import { receive, send } from "./worker/interface";
import { CountryPostalCodeLookups, Feature } from "./geojson/types";
import { MapArea } from "./visualization/leaflet";
import { PostalCodeRange } from "../regions/PostalCodePicker";
import { mergePolygonsFromGeoJSON } from "./geojson/merger";

type RegionMapProps = {
  regions: PostalCodeRange[]; // TODO: Make this a type from /map to make this folder standalone
  style: React.CSSProperties;
};

const worker = new Worker();

/**
 * Component that displays a map of regions based on postal codes ranges.
 *
 * This component uses a web worker to load the postal code regions in the background to avoid blocking the main thread.
 *
 * [Example of how to use Map component]
 * @returns
 */
function RegionMap({ regions: postalCodeRanges, style }: RegionMapProps) {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [pcl, setPcl] = useState<CountryPostalCodeLookups | null>(null);
  const [areas, setAreas] = useState<MapArea[]>([]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    send(worker, { type: "load" });
    setLoading(true);
    setPcl(null);

    receive(worker, (message) => {
      if (message.type === "loaded") {
        setLoading(false);
        setPcl(message.data);
      }
    });

    return () => {
      worker.terminate();
    };
  }, [worker, enabled]);

  useEffect(() => {
    if (pcl === null) {
      return;
    }

    if (postalCodeRanges.length === 0) {
      setAreas([]);
      return;
    }
    setLoading(true);

    console.log("Merging areas...");

    // TODO: Web worker to merge polygons + cache already merged polygons
    const areas: MapArea[] = postalCodeRanges.map((pcr) => {
      const country = pcl[pcr.countryCode];
      if (country === undefined) {
        throw new Error(`Country not found: ${pcr.countryCode}`);
      }

      const features = Object.entries(country)
        .filter(([pc, feature]) => {
          return pc >= pcr.start && pc < pcr.end;
        })
        .filter(([_, feature]) => !!feature)
        .map(([pc, feature]) => feature!);

      const merged = mergePolygonsFromGeoJSON(features);

      return {
        id: pcr.id,
        geometry: merged,
        style: {
          fillColor: "red",
          fillOpacity: 0.5,
          color: "black",
          weight: 1,
        },
      };
    });

    setLoading(false);
    setAreas(areas);
  }, [pcl, postalCodeRanges, setAreas]);

  return (
    <EnableSwitch style={style} enabled={enabled} setEnabled={setEnabled}>
      {loading && <LoaderText />}
      <Map
        areas={areas}
        style={{
          ...style,
          zIndex: 0,
          opacity: loading ? 0.25 : 1,
        }}
      />
    </EnableSwitch>
  );
}

export default RegionMap;

function LoaderText() {
  return (
    <p
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        zIndex: 1000,
        color: "white",
        textAlign: "center",
        fontSize: 24,
        fontWeight: 700,
        transform: "translate(-50%, -50%)",
        userSelect: "none",
        opacity: 1,
      }}
    >
      Loading Postal Code Regions...
    </p>
  );
}

function EnableSwitch({
  style,
  children,
  enabled,
  setEnabled,
}: {
  style: React.CSSProperties;
  children: React.ReactNode;
  enabled: boolean;
  setEnabled: (value: boolean) => void;
}) {
  if (!enabled) {
    return (
      <div
        style={{
          ...style,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <button onClick={() => setEnabled(true)}>Enable Map</button>
        <p>
          This will load a visualization of the selected region.
          <br />
          This may take a few seconds and is resource-intensive, which is why it's disabled by default.
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {children}
      <button
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 1000,
        }}
        onClick={() => setEnabled(false)}
      >
        Disable Map
      </button>
    </div>
  );
}
