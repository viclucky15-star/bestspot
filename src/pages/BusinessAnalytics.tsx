import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessAccount } from '@/hooks/useBusinessAccount';
import { useBusinessAnalytics } from '@/hooks/useBusinessAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Eye, 
  Heart, 
  Calendar,
  MapPin,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useEffect } from 'react';
import { format, subDays } from 'date-fns';

export default function BusinessAnalytics() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { businessAccount, isLoading } = useBusinessAccount();
  const [dateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });
  const { analytics, summary, isLoading: analyticsLoading } = useBusinessAnalytics(dateRange);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isLoading && !businessAccount) {
      navigate('/business/onboarding');
    }
  }, [isLoading, businessAccount, navigate]);

  if (authLoading || isLoading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: 'Total Views', 
      value: summary.totalViews, 
      icon: Eye, 
      color: 'text-blue-500',
      trend: summary.viewsTrend,
    },
    { 
      label: 'Favorites', 
      value: summary.totalFavorites, 
      icon: Heart, 
      color: 'text-red-500',
      trend: summary.favoritesTrend,
    },
    { 
      label: 'Planned Visits', 
      value: summary.totalPlannedVisits, 
      icon: Calendar, 
      color: 'text-green-500',
      trend: 0,
    },
    { 
      label: 'Map Clicks', 
      value: summary.totalMapClicks, 
      icon: MapPin, 
      color: 'text-orange-500',
      trend: 0,
    },
  ];

  // Sample chart data - in production this would come from analytics
  const chartData = analytics?.map(a => ({
    date: format(new Date(a.date), 'MMM d'),
    views: a.views,
    favorites: a.favorites,
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/business')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Analytics</h1>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  {stat.trend !== 0 && (
                    <div className={`flex items-center gap-1 text-xs ${stat.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(stat.trend)}%
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>Views and favorites for your locations</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="views" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="favorites" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>No analytics data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">💡 Tips to improve performance</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Add high-quality photos to your listings</li>
              <li>• Keep your business information up to date</li>
              <li>• Respond to customer inquiries promptly</li>
              <li>• Consider featured listings for more visibility</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
