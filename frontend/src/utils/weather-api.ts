export interface WeatherData {
    temperature: number;
    humidity: number;
    precipitation: number;
    weatherDescription: string;
    city?: string;
    isFromCache?: boolean;
    timestamp?: number;
}

const CACHE_KEY = 'farmguard-weather-cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCachedWeather(): WeatherData | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as WeatherData & { timestamp: number };
        const age = Date.now() - (parsed.timestamp || 0);
        if (age > CACHE_TTL) return { ...parsed, isFromCache: true };
        return { ...parsed, isFromCache: false };
    } catch {
        return null;
    }
}

function cacheWeather(data: WeatherData): void {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, timestamp: Date.now() }));
    } catch {
        // Storage full or unavailable
    }
}

export async function fetchWeather(lat?: number, lon?: number): Promise<WeatherData | null> {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
        // Return demo weather data when no API key is configured
        const demoData: WeatherData = {
            temperature: 26,
            humidity: 78,
            precipitation: 2.5,
            weatherDescription: 'Partly cloudy with high humidity',
            city: 'Demo Location',
            isFromCache: false,
            timestamp: Date.now(),
        };
        cacheWeather(demoData);
        return demoData;
    }

    try {
        let url: string;
        if (lat !== undefined && lon !== undefined) {
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        } else {
            url = `https://api.openweathermap.org/data/2.5/weather?q=Bangalore,IN&appid=${apiKey}&units=metric`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather API error');

        const json = await response.json();
        const data: WeatherData = {
            temperature: Math.round(json.main.temp),
            humidity: json.main.humidity,
            precipitation: json.rain?.['1h'] || 0,
            weatherDescription: json.weather[0]?.description || 'Unknown',
            city: json.name,
            isFromCache: false,
            timestamp: Date.now(),
        };

        cacheWeather(data);
        return data;
    } catch {
        const cached = getCachedWeather();
        if (cached) return { ...cached, isFromCache: true };
        return null;
    }
}

export function isHighRisk(weather: WeatherData): boolean {
    return weather.humidity > 70 && weather.temperature >= 20 && weather.temperature <= 30;
}
