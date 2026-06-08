import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export type NigerianState = 'Abia' | 'Anambra' | 'Enugu' | 'Ebonyi' | 'Imo';

export interface StateInfo {
  name: NigerianState;
  capital: string;
  lat: number;
  lon: number;
  description: string;
  icon: string;
  color: string;
}

export const STATES: StateInfo[] = [
  {
    name: 'Abia',
    capital: 'Umuahia',
    lat: 5.5320,
    lon: 7.4860,
    description: 'Known for commerce and the Aba market hub',
    icon: '',
    color: 'from-blue-500 to-blue-600',
  },
  {
    name: 'Anambra',
    capital: 'Awka',
    lat: 6.2100,
    lon: 7.0700,
    description: 'Home to Onitsha, the commercial heartbeat',
    icon: '',
    color: 'from-green-500 to-green-600',
  },
  {
    name: 'Enugu',
    capital: 'Enugu',
    lat: 6.4584,
    lon: 7.5464,
    description: 'The Coal City with scenic hills and culture',
    icon: '',
    color: 'from-orange-500 to-orange-600',
  },
  {
    name: 'Ebonyi',
    capital: 'Abakaliki',
    lat: 6.3249,
    lon: 8.1137,
    description: 'Salt of the nation with rich agriculture',
    icon: '',
    color: 'from-amber-500 to-amber-600',
  },
  {
    name: 'Imo',
    capital: 'Owerri',
    lat: 5.4836,
    lon: 7.0333,
    description: 'Eastern heartland with vibrant nightlife',
    icon: '',
    color: 'from-purple-500 to-purple-600',
  },
];

interface StateContextType {
  selectedState: NigerianState | null;
  setSelectedState: (state: NigerianState | null) => void;
  stateInfo: StateInfo | null;
  allStates: StateInfo[];
}

const StateContext = createContext<StateContextType | undefined>(undefined);

const STORAGE_KEY = 'easterni_selected_state';

export function StateProvider({ children }: { children: ReactNode }) {
  const [selectedState, setSelectedStateInternal] = useState<NigerianState | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved as NigerianState | null;
  });

  const setSelectedState = (state: NigerianState | null) => {
    setSelectedStateInternal(state);
    if (state) {
      localStorage.setItem(STORAGE_KEY, state);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const stateInfo = selectedState 
    ? STATES.find(s => s.name === selectedState) || null 
    : null;

  return (
    <StateContext.Provider value={{ selectedState, setSelectedState, stateInfo, allStates: STATES }}>
      {children}
    </StateContext.Provider>
  );
}

export function useStateSelection() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useStateSelection must be used within a StateProvider');
  }
  return context;
}

export function getStateInfo(state: NigerianState): StateInfo | undefined {
  return STATES.find(s => s.name === state);
}
