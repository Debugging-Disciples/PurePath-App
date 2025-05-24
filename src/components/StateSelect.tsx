
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usStates } from '@/utils/locationData';

interface StateSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const StateSelect: React.FC<StateSelectProps> = ({ value, onChange }) => {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger>
        <SelectValue placeholder="Select a state" />
      </SelectTrigger>
      <SelectContent>
        {usStates.map((state) => (
          <SelectItem key={state.value} value={state.value}>
            {state.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
