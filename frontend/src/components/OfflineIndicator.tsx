import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const { t } = useLanguage();

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="bg-warning-amber text-foreground px-4 py-2 flex items-center gap-2 text-sm font-medium z-50">
            <WifiOff className="h-4 w-4 shrink-0" />
            <span>{t('offline_banner')}</span>
        </div>
    );
}
