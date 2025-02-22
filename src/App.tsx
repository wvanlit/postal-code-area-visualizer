import { useState, useEffect } from "react";
import Map from "./Map";
import { AppShell, Loader, Stack, Title, Text } from "@mantine/core";
import PostalCodePicker, { PostalCodeRange } from "./PostalCodePicker";
import { createProvider } from "./geojson/loader";
import { GeoJSONProvider } from "./geojson/providers";

function App() {
  const [postalCodeRanges, setPostalCodeRanges] = useState<PostalCodeRange[]>(
    []
  );
  const [provider, setProvider] = useState<GeoJSONProvider | null>(null);

  useEffect(() => {
    createProvider()
      .then(setProvider)
      .then(() => console.log("Provider loaded"));
  }, []);

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Title mt={8} ml={16}>
          PCR Map Viz
        </Title>
      </AppShell.Header>

      <AppShell.Main>
        <Map ranges={postalCodeRanges} />
        {provider ? (
          <PostalCodePicker
            ranges={postalCodeRanges}
            onChange={(pcrs) => setPostalCodeRanges([...pcrs])}
            provider={provider}
          />
        ) : (
          <Stack
            align="center"
            justify="center"
            style={{ height: "30vh", width: "100%" }}
          >
            <Loader />
            <Text>Loading GeoJSON...</Text>
          </Stack>
        )}
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
