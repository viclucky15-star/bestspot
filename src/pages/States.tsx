import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STATES, useStateSelection, NigerianState } from '@/hooks/useStateSelection';
import { MainMenu } from '@/components/MainMenu';


const States = () => {
  const navigate = useNavigate();
  const { setSelectedState, selectedState } = useStateSelection();

  const handleStateSelect = (stateName: NigerianState) => {
    setSelectedState(stateName);
    navigate('/explore');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 via-background to-accent/10 px-4 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <span className="font-display font-bold text-foreground">tourguide</span>
          <MainMenu />
        </div>

        <div className="max-w-lg md:max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            South-East Nigeria
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold mb-2">
            Choose Your State
          </h1>
          <p className="text-muted-foreground">
            Explore romantic spots, picnic areas, and events across 5 states
          </p>
        </div>
      </div>

      {/* State Cards */}
      <div className="px-4 py-6 max-w-lg md:max-w-5xl mx-auto">
        <div className="grid gap-4 md:grid-cols-2">
          {STATES.map((state) => (
            <Card
              key={state.name}
              onClick={() => handleStateSelect(state.name)}
              className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
                selectedState === state.name ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${state.color} opacity-10`} />
              <div className="relative p-5 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${state.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {state.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-lg font-semibold">{state.name} State</h3>
                    {selectedState === state.name && (
                      <Badge variant="secondary" className="text-xs">Selected</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                    <MapPin className="w-3 h-3" />
                    <span>{state.capital}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{state.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>

        {/* All States Option */}
        <Card
          onClick={() => {
            setSelectedState(null);
            navigate('/explore');
          }}
          className="mt-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl shadow-lg">
              🗺️
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold">Explore All States</h3>
              <p className="text-sm text-muted-foreground">Browse locations across South-East Nigeria</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default States;
