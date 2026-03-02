import { useLanguage, type Language } from '../contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

const LANGUAGES: { code: Language; label: string; nativeLabel: string }[] = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
    { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
];

export function LanguageSelector() {
    const { language, setLanguage } = useLanguage();

    return (
        <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
            <SelectTrigger className="w-auto min-w-[100px] h-9 border-primary/30 bg-primary/10 text-primary-foreground text-sm gap-1">
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code} className="touch-target">
                        <span className="font-medium">{lang.nativeLabel}</span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
