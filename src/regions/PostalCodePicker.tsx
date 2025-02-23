import { Button, Grid, Group, Select, Stack, Text, TextInput } from "@mantine/core";
import { useState } from "react";

export type Country = "NL" | "BE" | "DE";

export type PostalCodeRange = {
  id: string;
  start: string;
  end: string;
  countryCode: Country;
};

type PostalCodePickerProps = {
  ranges: PostalCodeRange[];
  onChange: (postalCodeRanges: PostalCodeRange[]) => void;
};

type CountrySelectorProps = {
  onChange: (country: Country) => void;
};

function CountrySelector(props: CountrySelectorProps) {
  return (
    <Select
      data={[
        { label: "🇳🇱", value: "NL" },
        { label: "🇧🇪", value: "BE" },
        { label: "🇩🇪", value: "DE" },
      ]}
      onChange={(value) => props.onChange(value as Country)}
      placeholder="Country"
      w={100}
    />
  );
}

type PostalCodeInputProps = {
  value: string;
  onChange: (pc: string) => void;
};

function PostalCodeInput(props: PostalCodeInputProps) {
  return (
    <TextInput
      value={props.value}
      onChange={(event) => props.onChange(event.currentTarget.value)}
      placeholder="Enter a postal code"
    />
  );
}

type PostalCodeRangeFormProps = {
  onSubmit: (range: PostalCodeRange) => void;
};

function PostalCodeRangeForm(props: PostalCodeRangeFormProps) {
  const [currentRange, setCurrentRange] = useState<PostalCodeRange>({
    id: "",
    start: "",
    end: "",
    countryCode: "NL",
  });

  return (
    <Group>
      <CountrySelector onChange={(country) => setCurrentRange({ ...currentRange, countryCode: country })} />
      <PostalCodeInput value={currentRange.start} onChange={(start) => setCurrentRange({ ...currentRange, start })} />
      <PostalCodeInput value={currentRange.end} onChange={(end) => setCurrentRange({ ...currentRange, end })} />
      <Button
        onClick={() => {
          props.onSubmit(currentRange);
          setCurrentRange({
            id: "",
            start: "",
            end: "",
            countryCode: currentRange.countryCode,
          });
        }}
      >
        Add PCR
      </Button>
    </Group>
  );
}

function PostalCodePicker({ onChange, ranges }: PostalCodePickerProps) {
  function onSubmit(range: PostalCodeRange) {
    range.id = `PCR:${range?.countryCode}:${range?.start}-${range?.end}`;

    onChange([...ranges, range]);
  }

  return (
    <Stack align="stretch" m={16} gap={2}>
      <Text my={8} size="xl">
        Add a PCR
      </Text>
      <PostalCodeRangeForm onSubmit={onSubmit} />
      <Text my={8} size="xl">
        Currently Selected Ranges{" "}
      </Text>
      <Grid>
        {ranges.map((range, index) => (
          <div key={index}>
            <Group align="center">
              <Text size="lg">
                {range.start} - {range.end} ({range.countryCode})
              </Text>
              <Button
                variant="subtle"
                radius={100}
                size="xs"
                onClick={() => onChange(ranges.filter((_, i) => i !== index))}
              >
                X
              </Button>
            </Group>
          </div>
        ))}
      </Grid>
    </Stack>
  );
}

export default PostalCodePicker;
