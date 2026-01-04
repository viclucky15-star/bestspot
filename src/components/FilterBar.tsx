import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Category, BudgetLevel, FilterOptions } from '@/types';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  areas: string[];
}

const categories: { value: Category | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '✨' },
  { value: 'romantic', label: 'Romantic', icon: '💕' },
  { value: 'picnic', label: 'Picnic', icon: '🧺' },
  { value: 'event', label: 'Events', icon: '🎉' },
  { value: 'hiking', label: 'Hiking', icon: '🥾' },
];

const budgetLevels: { value: BudgetLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'Any Budget' },
  { value: 'low', label: '₦ Budget Friendly' },
  { value: 'medium', label: '₦₦ Mid Range' },
  { value: 'high', label: '₦₦₦ Premium' },
];

export function FilterBar({ filters, onFiltersChange, areas }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = [
    filters.category !== 'all' && filters.category,
    filters.budgetLevel !== 'all' && filters.budgetLevel,
    filters.area !== 'all' && filters.area,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({
      category: 'all',
      budgetLevel: 'all',
      area: 'all',
      searchQuery: '',
    });
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search locations..."
          value={filters.searchQuery || ''}
          onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
          className="pl-10 pr-4 h-12 rounded-xl"
        />
      </div>

      {/* Category pills - horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onFiltersChange({ ...filters, category: cat.value })}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              filters.category === cat.value
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Filter button & active filters */}
      <div className="flex items-center gap-2">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="bg-primary text-primary-foreground ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
            <SheetHeader>
              <SheetTitle className="font-display text-xl">Filter Locations</SheetTitle>
            </SheetHeader>
            
            <div className="space-y-6 mt-6">
              {/* Budget Level */}
              <div>
                <h4 className="font-medium mb-3">Budget</h4>
                <div className="flex flex-wrap gap-2">
                  {budgetLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => onFiltersChange({ ...filters, budgetLevel: level.value })}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        filters.budgetLevel === level.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area */}
              <div>
                <h4 className="font-medium mb-3">Area in Enugu</h4>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  <button
                    onClick={() => onFiltersChange({ ...filters, area: 'all' })}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      filters.area === 'all'
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    All Areas
                  </button>
                  {areas.map((area) => (
                    <button
                      key={area}
                      onClick={() => onFiltersChange({ ...filters, area })}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        filters.area === area
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={clearFilters}
                >
                  Clear All
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => setIsOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Active filter badges */}
        {activeFiltersCount > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {filters.category !== 'all' && (
              <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => onFiltersChange({ ...filters, category: 'all' })}
              >
                {categories.find(c => c.value === filters.category)?.label}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
            {filters.budgetLevel !== 'all' && (
              <Badge 
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => onFiltersChange({ ...filters, budgetLevel: 'all' })}
              >
                {budgetLevels.find(b => b.value === filters.budgetLevel)?.label}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
            {filters.area !== 'all' && (
              <Badge 
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => onFiltersChange({ ...filters, area: 'all' })}
              >
                {filters.area}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
