"use client";

import { useCallback, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";

export type ModelSettings = {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
};

type Props = {
  defaultValue: ModelSettings;
  onChange: (settings: ModelSettings) => void;
};

export function WorkflowModelSettings({ defaultValue, onChange }: Props) {
  const [temperature, setTemperature] = useState(
    defaultValue?.temperature ?? 1
  );
  const [maxTokens, setMaxTokens] = useState(defaultValue?.maxTokens ?? 1024);
  const [topP, setTopP] = useState(defaultValue?.topP ?? 1);
  const [frequencyPenalty, setFrequencyPenalty] = useState(
    defaultValue?.frequencyPenalty ?? 0
  );
  const [presencePenalty, setPresencePenalty] = useState(
    defaultValue?.presencePenalty ?? 0
  );

  const triggerChange = useCallback(
    (val: any) => {
      onChange({
        temperature,
        maxTokens,
        topP,
        frequencyPenalty,
        presencePenalty,
        ...val,
      });
    },
    [temperature, maxTokens, topP, frequencyPenalty, presencePenalty, onChange]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Temperature ({temperature})</Label>
            <Slider
              defaultValue={[temperature]}
              min={0}
              max={2}
              step={0.1}
              onValueChange={(val: number[]) => {
                setTemperature(val[0]);
                triggerChange({ temperature: val[0] });
              }}
            />
            <CardDescription>
              Temperature controls the randomness of the model. Lower values
              make the model more deterministic.
            </CardDescription>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Max Tokens</Label>
            <Input
              type="number"
              value={maxTokens}
              onChange={(e) => {
                setMaxTokens(+e.target.value);
                triggerChange({ maxTokens: Math.min(+e.target.value, 8192) });
              }}
            />
            <CardDescription>
              Max Tokens controls the maximum number of tokens that the model
              will generate.
            </CardDescription>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Top P ({topP})</Label>
            <Slider
              defaultValue={[topP]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={(val: number[]) => {
                setTopP(val[0]);
                triggerChange({ topP: val[0] });
              }}
            />
            <CardDescription>
              An alternative to sampling with temperature, called nucleus
              sampling, where the model considers the results of the tokens with
              top_p probability mass. So 0.1 means only the tokens comprising
              the top 10% probability mass are considered.
            </CardDescription>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Frequency Penalty</Label>
            <Slider
              defaultValue={[frequencyPenalty]}
              min={0}
              max={2}
              step={0.1}
              onValueChange={(val: number[]) => {
                setFrequencyPenalty(val[0]);
                triggerChange({ frequencyPenalty: val[0] });
              }}
            />
            <CardDescription>
              Frequency Penalty controls the repetition of the model. Lower
              values make the model repeat less.
            </CardDescription>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Presence Penalty</Label>
            <Slider
              defaultValue={[presencePenalty]}
              min={0}
              max={2}
              step={0.1}
              onValueChange={(val: number[]) => {
                setTopP(val[0]);
                triggerChange({ presencePenalty: val[0] });
              }}
            />
            <CardDescription>
              Presence Penalty controls the repetition of the model. Lower
              values make the model repeat less.
            </CardDescription>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
