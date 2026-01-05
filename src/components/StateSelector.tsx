import { MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { STATES, useStateSelection, NigerianState } from '@/hooks/useStateSelection';

interface StateSelectorProps {
  compact?: boolean;
}

export function StateSelector({ compact = false }: StateSelectorProps) {
  const { selectedState, setSelectedState, stateInfo } = useStateSelection();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={compact ? "sm" : "default"} className="gap-2">
          {stateInfo ? (
            <>
              <span>{stateInfo.icon}</span>
              <span className={compact ? "hidden sm:inline" : ""}>{stateInfo.name}</span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              <span className={compact ? "hidden sm:inline" : ""}>All States</span>
            </>
          )}
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => setSelectedState(null)} className="gap-2">
          <span className="text-lg">🗺️</span>
          <span>All States</span>
          {!selectedState && <Badge variant="secondary" className="ml-auto text-xs">Active</Badge>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {STATES.map((state) => (
          <DropdownMenuItem
            key={state.name}
            onClick={() => setSelectedState(state.name)}
            className="gap-2"
          >
            <span className="text-lg">{state.icon}</span>
            <span>{state.name}</span>
            {selectedState === state.name && (
              <Badge variant="secondary" className="ml-auto text-xs">Active</Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
