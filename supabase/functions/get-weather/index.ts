import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map Nigerian states to their capital city coordinates for AccuWeather
const stateLocations: Record<string, { city: string; lat: number; lon: number }> = {
  'Enugu': { city: 'Enugu', lat: 6.4584, lon: 7.5464 },
  'Anambra': { city: 'Awka', lat: 6.2100, lon: 7.0700 },
  'Abia': { city: 'Umuahia', lat: 5.5261, lon: 7.4861 },
  'Ebonyi': { city: 'Abakaliki', lat: 6.3249, lon: 8.1137 },
  'Imo': { city: 'Owerri', lat: 5.4836, lon: 7.0333 },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { state } = await req.json();
    const apiKey = Deno.env.get('ACCUWEATHER_API_KEY');
    
    if (!apiKey) {
      throw new Error('AccuWeather API key not configured');
    }

    const location = stateLocations[state] || stateLocations['Enugu'];
    
    // Step 1: Get location key from coordinates
    const geoResponse = await fetch(
      `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${apiKey}&q=${location.lat},${location.lon}`
    );
    
    if (!geoResponse.ok) {
      const errorText = await geoResponse.text();
      console.error('AccuWeather geo error:', errorText);
      throw new Error('Failed to get location from AccuWeather');
    }
    
    const geoData = await geoResponse.json();
    const locationKey = geoData.Key;
    
    // Step 2: Get current conditions
    const currentResponse = await fetch(
      `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}&details=true`
    );
    
    if (!currentResponse.ok) {
      throw new Error('Failed to get current weather');
    }
    
    const currentData = await currentResponse.json();
    const current = currentData[0];
    
    // Step 3: Get 5-day forecast
    const forecastResponse = await fetch(
      `https://dataservice.accuweather.com/forecasts/v1/daily/5day/${locationKey}?apikey=${apiKey}&metric=true`
    );
    
    if (!forecastResponse.ok) {
      throw new Error('Failed to get forecast');
    }
    
    const forecastData = await forecastResponse.json();
    
    // Map AccuWeather icon codes to weather conditions
    const getCondition = (iconCode: number): string => {
      if (iconCode <= 5) return 'sunny';
      if (iconCode <= 11) return 'cloudy';
      if (iconCode <= 18) return 'rainy';
      if (iconCode <= 29) return 'rainy';
      if (iconCode <= 32) return 'windy';
      return 'cloudy';
    };
    
    const weatherData = {
      location: geoData.LocalizedName || location.city,
      state: state,
      current: {
        temperature: Math.round(current.Temperature.Metric.Value),
        condition: getCondition(current.WeatherIcon),
        description: current.WeatherText,
        humidity: current.RelativeHumidity,
        windSpeed: Math.round(current.Wind.Speed.Metric.Value),
        feelsLike: Math.round(current.RealFeelTemperature.Metric.Value),
        uvIndex: current.UVIndex,
      },
      forecast: forecastData.DailyForecasts.map((day: any) => ({
        date: day.Date,
        high: Math.round(day.Temperature.Maximum.Value),
        low: Math.round(day.Temperature.Minimum.Value),
        condition: getCondition(day.Day.Icon),
        description: day.Day.IconPhrase,
      })),
      lastUpdated: new Date().toISOString(),
    };

    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Weather API error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
