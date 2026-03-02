import { useNavigate } from '@tanstack/react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useGetHistory } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { History as HistoryIcon, Leaf, Camera, ChevronRight, Sprout } from 'lucide-react';
import type { PredictionRecord } from '../backend';

function formatDate(timestamp: bigint): string {
    // Backend timestamp is in nanoseconds (Internet Computer Time.Time)
    const ms = Number(timestamp / BigInt(1_000_000));
    const date = new Date(ms);
    if (isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function getConfidenceBadgeVariant(confidence: number): 'default' | 'secondary' | 'destructive' {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.6) return 'secondary';
    return 'destructive';
}

interface HistoryCardProps {
    record: PredictionRecord;
    onView: () => void;
}

function HistoryCard({ record, onView }: HistoryCardProps) {
    const { t } = useLanguage();
    const confidencePct = Math.round(record.confidenceScore * 100);

    return (
        <button
            onClick={onView}
            className="w-full bg-card rounded-2xl border border-border shadow-xs p-4 flex items-center gap-3 text-left hover:shadow-card transition-shadow active:scale-[0.99]"
            style={{ minHeight: '44px' }}
        >
            <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
                <Leaf className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground truncate">{record.diseaseName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {record.cropType} · {formatDate(record.timestamp)}
                </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Badge variant={getConfidenceBadgeVariant(record.confidenceScore)} className="text-xs">
                    {confidencePct}%
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
        </button>
    );
}

export function History() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { data: records, isLoading } = useGetHistory();

    const handleView = (record: PredictionRecord) => {
        navigate({
            to: '/results',
            search: {
                cropType: record.cropType,
                diseaseName: record.diseaseName,
                confidence: record.confidenceScore,
                isDemo: false,
                imageData: undefined,
            },
        });
    };

    const sortedRecords = records
        ? [...records].sort((a, b) => {
              const diff = b.timestamp - a.timestamp;
              return diff > 0n ? 1 : diff < 0n ? -1 : 0;
          })
        : [];

    return (
        <div className="flex flex-col min-h-[calc(100vh-56px-64px)]">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 flex items-center gap-2">
                <HistoryIcon className="h-5 w-5 text-primary" />
                <h1 className="font-display text-xl font-bold text-foreground">{t('history_title')}</h1>
                {sortedRecords.length > 0 && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                        {sortedRecords.length}
                    </Badge>
                )}
            </div>

            {/* Content */}
            <div className="px-4 flex-1">
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                        ))}
                    </div>
                ) : sortedRecords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="p-6 bg-primary/10 rounded-full mb-4">
                            <Sprout className="h-12 w-12 text-primary" />
                        </div>
                        <p className="font-display font-bold text-lg text-foreground mb-2">
                            {t('history_empty')}
                        </p>
                        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                            {t('history_empty_sub')}
                        </p>
                        <Button
                            onClick={() => navigate({ to: '/scan' })}
                            className="h-12 px-6 rounded-2xl leaf-gradient border-0 font-bold gap-2"
                        >
                            <Camera className="h-5 w-5" />
                            {t('home_scan_btn')}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedRecords.map((record) => (
                            <HistoryCard
                                key={record.id.toString()}
                                record={record}
                                onView={() => handleView(record)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
