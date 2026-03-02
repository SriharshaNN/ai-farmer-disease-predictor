import { Link, useLocation } from '@tanstack/react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { OfflineIndicator } from './OfflineIndicator';
import { Home, Camera, History, Leaf, Heart } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const { t } = useLanguage();
    const location = useLocation();

    const navItems = [
        { path: '/', label: t('nav_home'), icon: Home },
        { path: '/scan', label: t('nav_scan'), icon: Camera },
        { path: '/history', label: t('nav_history'), icon: History },
    ];

    const appId = encodeURIComponent(window.location.hostname || 'farmguard-ai');

    return (
        <div className="min-h-screen flex flex-col bg-background max-w-lg mx-auto relative">
            <OfflineIndicator />

            {/* Header */}
            <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border shadow-xs">
                <div className="flex items-center justify-between px-4 h-14">
                    <Link to="/" className="flex items-center gap-2">
                        <img
                            src="/assets/generated/farmguard-logo.dim_256x256.png"
                            alt="FarmGuard AI"
                            className="h-8 w-8 rounded-lg object-cover"
                        />
                        <div className="leading-tight">
                            <span className="font-display font-bold text-primary text-base block leading-none">
                                {t('app_name')}
                            </span>
                            <span className="text-[10px] text-muted-foreground leading-none">{t('tagline')}</span>
                        </div>
                    </Link>
                    <LanguageSelector />
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 pb-20">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-40 bg-card/95 backdrop-blur-sm border-t border-border">
                <div className="flex items-center justify-around px-2 py-1">
                    {navItems.map(({ path, label, icon: Icon }) => {
                        const isActive = location.pathname === path;
                        return (
                            <Link
                                key={path}
                                to={path}
                                className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all touch-target min-w-[64px] ${isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-primary/15' : ''}`}>
                                    <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                                </div>
                                <span className="text-[10px] font-semibold leading-none">{label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Footer */}
            <footer className="hidden">
                <p className="text-xs text-muted-foreground text-center py-2">
                    © {new Date().getFullYear()} {t('app_name')} &mdash; {t('footer_built')}{' '}
                    <Heart className="inline h-3 w-3 text-destructive" />{' '}
                    {t('footer_using')}{' '}
                    <a
                        href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                    >
                        caffeine.ai
                    </a>
                </p>
            </footer>
        </div>
    );
}
