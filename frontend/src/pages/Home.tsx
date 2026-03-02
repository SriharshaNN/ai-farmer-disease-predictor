import { Link } from '@tanstack/react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { WeatherRiskBanner } from '../components/WeatherRiskBanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Leaf, Zap, Shield, Wifi, Heart } from 'lucide-react';

export function Home() {
    const { t } = useLanguage();
    const appId = encodeURIComponent(window.location.hostname || 'farmguard-ai');

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="relative h-52 sm:h-64">
                    <img
                        src="/assets/generated/hero-farmer.dim_800x400.png"
                        alt="Farmer in field"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 hero-overlay" />
                    <div className="absolute inset-0 flex flex-col justify-end p-5 pb-6">
                        <Badge className="w-fit mb-2 bg-amber-sun/90 text-foreground border-0 text-xs font-bold">
                            <Wifi className="h-3 w-3 mr-1" />
                            {t('home_offline_badge')}
                        </Badge>
                        <h1 className="font-display text-2xl font-bold text-white leading-tight drop-shadow-lg">
                            {t('home_hero_title')}
                        </h1>
                        <p className="text-white/90 text-sm mt-1 leading-snug drop-shadow">
                            {t('home_hero_subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Button */}
            <div className="px-4 -mt-5 relative z-10">
                <Link to="/scan">
                    <Button
                        size="lg"
                        className="w-full h-14 text-base font-bold rounded-2xl shadow-card-hover leaf-gradient border-0 gap-2"
                    >
                        <Camera className="h-5 w-5" />
                        {t('home_scan_btn')}
                    </Button>
                </Link>
            </div>

            {/* Weather Risk Banner */}
            <div className="px-4 mt-4">
                <WeatherRiskBanner />
            </div>

            {/* How It Works */}
            <section className="px-4 mt-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-3">
                    {t('home_features_title')}
                </h2>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: Camera, title: t('home_feature_1_title'), desc: t('home_feature_1_desc'), color: 'bg-primary/10 text-primary' },
                        { icon: Zap, title: t('home_feature_2_title'), desc: t('home_feature_2_desc'), color: 'bg-amber-sun/20 text-soil-brown' },
                        { icon: Shield, title: t('home_feature_3_title'), desc: t('home_feature_3_desc'), color: 'bg-success-green/15 text-success-green' },
                    ].map(({ icon: Icon, title, desc, color }) => (
                        <div key={title} className="bg-card rounded-2xl p-3 shadow-xs border border-border flex flex-col items-center text-center gap-2">
                            <div className={`p-2.5 rounded-xl ${color}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-bold text-xs text-foreground leading-tight">{title}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Supported Crops */}
            <section className="px-4 mt-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-primary" />
                    Supported Crops
                </h2>
                <div className="flex flex-wrap gap-2">
                    {['Tomato', 'Rice', 'Wheat', 'Cotton', 'Potato', 'Maize'].map(crop => (
                        <Badge key={crop} variant="secondary" className="text-xs px-3 py-1 rounded-full font-semibold">
                            {crop}
                        </Badge>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="px-4 mt-8 pb-4 text-center">
                <p className="text-xs text-muted-foreground">
                    © {new Date().getFullYear()} FarmGuard AI &mdash; Built with{' '}
                    <Heart className="inline h-3 w-3 text-destructive" />{' '}
                    using{' '}
                    <a
                        href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2"
                    >
                        caffeine.ai
                    </a>
                </p>
            </footer>
        </div>
    );
}
