import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchWeather, isHighRisk, type WeatherData } from '../utils/weather-api';
import { AlertTriangle, Thermometer, Droplets, CloudOff } from 'lucide-react';

export function WeatherRiskBanner() {
    const { t } = useLanguage();
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                // Try to get user location
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (pos) => {
                            if (cancelled) return;
                            const data = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
                            if (!cancelled) setWeather(data);
                            setLoading(false);
                        },
                        async () => {
                            if (cancelled) return;
                            const data = await fetchWeather();
                            if (!cancelled) setWeather(data);
                            setLoading(false);
                        }
                    );
                } else {
                    const data = await fetchWeather();
                    if (!cancelled) setWeather(data);
                    setLoading(false);
                }
            } catch {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <div className="bg-muted rounded-xl p-3 flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                <Droplets className="h-4 w-4" />
                <span>{t('weather_loading')}</span>
            </div>
        );
    }

    if (!weather) return null;

    const highRisk = isHighRisk(weather);

    return (
        <div className={`rounded-xl p-4 ${highRisk
            ? 'bg-risk-orange/15 border border-risk-orange/40'
            : 'bg-sky-blue/10 border border-sky-blue/30'
            }`}>
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${highRisk ? 'bg-risk-orange/20' : 'bg-sky-blue/20'}`}>
                    {highRisk
                        ? <AlertTriangle className="h-5 w-5 text-risk-orange" />
                        : <Droplets className="h-5 w-5 text-sky-blue" />
                    }
                </div>
                <div className="flex-1 min-w-0">
                    {highRisk && (
                        <p className="font-bold text-risk-orange text-sm mb-1">{t('weather_risk_high')}</p>
                    )}
                    <p className="text-sm text-foreground/80 leading-snug">
                        {highRisk ? t('weather_risk_message') : weather.weatherDescription}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Thermometer className="h-3.5 w-3.5" />
                            {t('weather_temp')}: {weather.temperature}°C
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Droplets className="h-3.5 w-3.5" />
                            {t('weather_humidity')}: {weather.humidity}%
                        </span>
                    </div>
                    {weather.isFromCache && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <CloudOff className="h-3 w-3" />
                            {t('weather_offline')}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
