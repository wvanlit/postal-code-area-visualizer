import { useState } from "react";
import { AppShell, Title } from "@mantine/core";
import PostalCodePicker, { PostalCodeRange } from "./regions/PostalCodePicker";
import RegionMap from "./map/RegionMap";

function App() {
  const [postalCodeRanges, setPostalCodeRanges] = useState<PostalCodeRange[]>([
    {
      id: "pcr:3000:3100:NL",
      start: "3000",
      end: "3100",
      countryCode: "NL",
    },
    {
      id: "pcr:1000:2000:BE",
      start: "1000",
      end: "2000",
      countryCode: "BE",
    },
    {
      id: "pcr:10000:20000:DE",
      start: "10000",
      end: "20000",
      countryCode: "DE",
    },
  ]);

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Title mt={8} ml={16}>
          PCR Map Viz
        </Title>
      </AppShell.Header>

      <AppShell.Main>
        <RegionMap
          regions={postalCodeRanges}
          style={{
            height: "50vh",
            width: "100%",
          }}
        />
        <PostalCodePicker ranges={postalCodeRanges} onChange={(pcrs) => setPostalCodeRanges([...pcrs])} />
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
