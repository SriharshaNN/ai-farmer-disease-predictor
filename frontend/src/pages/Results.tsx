import { useEffect, useState, useRef } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAddPrediction } from '../hooks/useQueries';
import { speakText, stopSpeech, isSpeechSupported } from '../utils/speech-synthesis';
import { fetchWeather } from '../utils/weather-api';
import { getFarmerSessionId } from '../utils/session';
import diseaseData from '../data/disease-recommendations.json';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Leaf,
    AlertCircle,
    Volume2,
    VolumeX,
    ArrowLeft,
    RotateCcw,
    Sprout,
    FlaskConical,
    Wheat,
    Bug,
    ShieldCheck,
    CheckCircle2,
} from 'lucide-react';

type DiseaseKey = keyof typeof diseaseData;

const SECTION_ICONS = {
    organicTreatments: Sprout,
    chemicalTreatments: FlaskConical,
    fertilizers: Wheat,
    pesticides: Bug,
    preventionTips: ShieldCheck,
};

export function Results() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    // useSearch is typed via the router registration in App.tsx
    const search = useSearch({ from: '/results' });
    const addPrediction = useAddPrediction();

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [saved, setSaved] = useState(false);
    const savedRef = useRef(false);

    const cropType = search.cropType;
    const diseaseName = search.diseaseName;
    const confidence = search.confidence;
    const isDemo = search.isDemo;
    const imageData = search.imageData;

    const recommendations = diseaseData[diseaseName as DiseaseKey] || diseaseData['Healthy'];
    const confidencePct = Math.round(confidence * 100);

    const getConfidenceColor = (pct: number) => {
        if (pct >= 80) return 'text-success-green';
        if (pct >= 60) return 'text-warning-amber';
        return 'text-destructive';
    };

    // Save to backend on mount (once)
    useEffect(() => {
        if (savedRef.current) return;
        savedRef.current = true;

        const save = async () => {
            try {
                const weather = await fetchWeather();
                const sessionId = getFarmerSessionId();
                await addPrediction.mutateAsync({
                    farmerSessionId: sessionId,
                    cropType,
                    diseaseName,
                    confidenceScore: confidence,
                    weatherSnapshot: {
                        temperature: weather?.temperature ?? 25,
                        humidity: weather?.humidity ?? 60,
                        precipitation: weather?.precipitation ?? 0,
                        weatherDescription: weather?.weatherDescription ?? 'Unknown',
                    },
                });
                setSaved(true);
            } catch {
                // Silent fail — don't block UI
            }
        };

        save();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const buildSpeechText = () => {
        const organic = recommendations.organicTreatments[0] || '';
        const prevention = recommendations.preventionTips[0] || '';
        return `${diseaseName} detected in ${cropType}. Confidence: ${confidencePct} percent. Treatment: ${organic}. Prevention: ${prevention}`;
    };

    const handlePlayVoice = () => {
        if (isSpeaking) {
            stopSpeech();
            setIsSpeaking(false);
        } else {
            speakText(buildSpeechText(), language);
            setIsSpeaking(true);
            const duration = buildSpeechText().length * 80;
            setTimeout(() => setIsSpeaking(false), duration);
        }
    };

    const sections = [
        {
            key: 'organicTreatments',
            label: t('results_organic'),
            icon: SECTION_ICONS.organicTreatments,
            items: recommendations.organicTreatments,
            color: 'text-success-green',
        },
        {
            key: 'chemicalTreatments',
            label: t('results_chemical'),
            icon: SECTION_ICONS.chemicalTreatments,
            items: recommendations.chemicalTreatments,
            color: 'text-sky-blue',
        },
        {
            key: 'fertilizers',
            label: t('results_fertilizers'),
            icon: SECTION_ICONS.fertilizers,
            items: recommendations.fertilizers,
            color: 'text-amber-sun',
        },
        {
            key: 'pesticides',
            label: t('results_pesticides'),
            icon: SECTION_ICONS.pesticides,
            items: recommendations.pesticides,
            color: 'text-destructive',
        },
        {
            key: 'preventionTips',
            label: t('results_prevention'),
            icon: SECTION_ICONS.preventionTips,
            items: recommendations.preventionTips,
            color: 'text-primary',
        },
    ];

    return (
        <div className="flex flex-col pb-4">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate({ to: '/scan' })}
                    className="h-9 w-9 rounded-xl shrink-0"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="font-display text-xl font-bold text-foreground flex-1">
                    {t('results_title')}
                </h1>
                {isDemo && (
                    <Badge
                        variant="outline"
                        className="text-xs border-warning-amber/50 text-warning-amber shrink-0"
                    >
                        Demo
                    </Badge>
                )}
            </div>

            {/* Result Card */}
            <div className="px-4">
                <Card className="rounded-3xl shadow-card border-border overflow-hidden">
                    {imageData && (
                        <div className="h-36 overflow-hidden">
                            <img
                                src={imageData}
                                alt="Analyzed leaf"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Leaf className="h-4 w-4 text-primary shrink-0" />
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {t('results_crop')}
                                    </span>
                                </div>
                                <p className="font-bold text-foreground text-base">{cropType}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground font-medium mb-1">
                                    {t('results_confidence')}
                                </p>
                                <p className={`text-2xl font-black ${getConfidenceColor(confidencePct)}`}>
                                    {confidencePct}%
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-border">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                                <span className="text-xs text-muted-foreground font-medium">
                                    {t('results_disease')}
                                </span>
                            </div>
                            <p className="font-bold text-foreground text-lg leading-tight">{diseaseName}</p>
                        </div>

                        {/* Voice Controls */}
                        {isSpeechSupported() && (
                            <div className="mt-3 flex gap-2">
                                <Button
                                    onClick={handlePlayVoice}
                                    variant="outline"
                                    size="sm"
                                    className={`flex-1 h-10 rounded-xl gap-2 font-semibold ${
                                        isSpeaking
                                            ? 'border-destructive/50 text-destructive'
                                            : 'border-primary/40 text-primary'
                                    }`}
                                >
                                    {isSpeaking ? (
                                        <>
                                            <VolumeX className="h-4 w-4" />
                                            {t('results_stop_voice')}
                                        </>
                                    ) : (
                                        <>
                                            <Volume2 className="h-4 w-4" />
                                            {t('results_play_voice')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {saved && (
                            <p className="text-xs text-success-green flex items-center gap-1 mt-2">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {t('results_save_success')}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recommendations Accordion */}
            <div className="px-4 mt-4">
                <Accordion
                    type="multiple"
                    defaultValue={['organicTreatments', 'preventionTips']}
                    className="space-y-2"
                >
                    {sections.map(({ key, label, icon: Icon, items, color }) => (
                        <AccordionItem
                            key={key}
                            value={key}
                            className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden"
                        >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg bg-current/10 ${color}`}>
                                        <Icon className={`h-4 w-4 ${color}`} />
                                    </div>
                                    <span className="font-bold text-sm text-foreground">{label}</span>
                                    <Badge
                                        variant="secondary"
                                        className="text-xs ml-auto mr-2 h-5"
                                    >
                                        {items.length}
                                    </Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-3">
                                <ul className="space-y-2 mt-1">
                                    {items.map((item, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2 text-sm text-foreground/80"
                                        >
                                            <span
                                                className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 bg-current ${color}`}
                                            />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            {/* Demo disclaimer */}
            {isDemo && (
                <div className="px-4 mt-4">
                    <p className="text-xs text-muted-foreground bg-muted rounded-xl px-3 py-2 text-center">
                        {t('demo_disclaimer')}
                    </p>
                </div>
            )}

            {/* Scan Again */}
            <div className="px-4 mt-4">
                <Button
                    onClick={() => navigate({ to: '/scan' })}
                    size="lg"
                    variant="outline"
                    className="w-full h-12 rounded-2xl border-primary/40 text-primary font-bold gap-2"
                >
                    <RotateCcw className="h-5 w-5" />
                    {t('scan_again')}
                </Button>
            </div>
        </div>
    );
}
