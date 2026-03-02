import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { predictDisease, checkImageQuality } from '../utils/tfjs-model';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Upload, RotateCcw, Scan, AlertTriangle, FlipHorizontal, Loader2, Info } from 'lucide-react';

type CaptureMode = 'idle' | 'camera' | 'preview';

export function CameraCapture() {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const [mode, setMode] = useState<CaptureMode>('idle');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [qualityWarning, setQualityWarning] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
    const streamRef = useRef<MediaStream | null>(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    }, []);

    const startCamera = useCallback(async () => {
        stopCamera();
        setCameraError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setMode('camera');
        } catch {
            setCameraError(t('camera_permission_denied'));
        }
    }, [facingMode, stopCamera, t]);

    useEffect(() => {
        return () => stopCamera();
    }, [stopCamera]);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
        setMode('preview');

        // Check quality after a brief delay for image to load
        setTimeout(() => {
            if (canvasRef.current) {
                const quality = checkImageQuality(canvasRef.current);
                setQualityWarning(!quality.isGood);
            }
        }, 100);
    }, [stopCamera]);

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            setCapturedImage(dataUrl);
            setMode('preview');

            // Check quality after image loads
            const img = new Image();
            img.onload = () => {
                const quality = checkImageQuality(img);
                setQualityWarning(!quality.isGood);
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
        // Reset input
        e.target.value = '';
    }, []);

    const handleRetake = useCallback(() => {
        setCapturedImage(null);
        setQualityWarning(false);
        setMode('idle');
        stopCamera();
    }, [stopCamera]);

    const handleAnalyze = useCallback(async () => {
        if (!capturedImage) return;
        setIsAnalyzing(true);

        try {
            const img = new Image();
            img.src = capturedImage;
            await new Promise<void>((resolve) => { img.onload = () => resolve(); });

            const result = await predictDisease(img);

            navigate({
                to: '/results',
                search: {
                    cropType: result.cropType,
                    diseaseName: result.diseaseName,
                    confidence: result.confidence,
                    isDemo: result.isDemo,
                    imageData: capturedImage,
                }
            });
        } catch (err) {
            console.error('Analysis failed:', err);
        } finally {
            setIsAnalyzing(false);
        }
    }, [capturedImage, navigate]);

    const flipCamera = useCallback(() => {
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
        if (mode === 'camera') {
            setTimeout(() => startCamera(), 100);
        }
    }, [mode, startCamera]);

    return (
        <div className="flex flex-col min-h-[calc(100vh-56px-64px)]">
            {/* Header */}
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <h1 className="font-display text-xl font-bold text-foreground">{t('camera_title')}</h1>
                <Badge variant="outline" className="text-xs border-primary/40 text-primary gap-1">
                    <Info className="h-3 w-3" />
                    Demo
                </Badge>
            </div>

            {/* Demo note */}
            <div className="px-4 mb-3">
                <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
                    {t('camera_demo_note')}
                </p>
            </div>

            {/* Camera / Preview Area */}
            <div className="px-4 flex-1">
                <div className="relative bg-foreground/5 rounded-3xl overflow-hidden aspect-[4/3] w-full border-2 border-dashed border-border">
                    {/* Idle state */}
                    {mode === 'idle' && !capturedImage && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                            <img
                                src="/assets/generated/demo-leaf.dim_400x400.png"
                                alt="Demo leaf"
                                className="w-32 h-32 object-cover rounded-2xl opacity-60"
                            />
                            <p className="text-sm text-muted-foreground text-center">{t('camera_placeholder')}</p>
                        </div>
                    )}

                    {/* Camera feed */}
                    {mode === 'camera' && (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    )}

                    {/* Preview */}
                    {mode === 'preview' && capturedImage && (
                        <img
                            ref={imgRef}
                            src={capturedImage}
                            alt="Captured leaf"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    )}

                    {/* Camera flip button */}
                    {mode === 'camera' && (
                        <button
                            onClick={flipCamera}
                            className="absolute top-3 right-3 p-2 bg-black/40 rounded-full text-white touch-target"
                        >
                            <FlipHorizontal className="h-5 w-5" />
                        </button>
                    )}

                    {/* Scan overlay for camera mode */}
                    {mode === 'camera' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-48 h-48 border-2 border-white/60 rounded-2xl relative">
                                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg" />
                                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg" />
                                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg" />
                                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Quality Warning */}
                {qualityWarning && (
                    <Alert className="mt-3 border-warning-amber/50 bg-warning-amber/10">
                        <AlertTriangle className="h-4 w-4 text-warning-amber" />
                        <AlertDescription className="text-sm">{t('camera_quality_warning')}</AlertDescription>
                    </Alert>
                )}

                {/* Camera Error */}
                {cameraError && (
                    <Alert className="mt-3 border-destructive/50 bg-destructive/10">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <AlertDescription className="text-sm">{cameraError}</AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Action Buttons */}
            <div className="px-4 pt-4 pb-4 space-y-3">
                {mode === 'idle' && (
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            onClick={startCamera}
                            size="lg"
                            className="h-14 rounded-2xl leaf-gradient border-0 font-bold gap-2"
                        >
                            <Camera className="h-5 w-5" />
                            {t('camera_take_photo')}
                        </Button>
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            size="lg"
                            variant="outline"
                            className="h-14 rounded-2xl border-primary/40 text-primary font-bold gap-2"
                        >
                            <Upload className="h-5 w-5" />
                            {t('camera_upload')}
                        </Button>
                    </div>
                )}

                {mode === 'camera' && (
                    <div className="flex gap-3">
                        <Button
                            onClick={handleRetake}
                            size="lg"
                            variant="outline"
                            className="flex-1 h-14 rounded-2xl border-border font-bold gap-2"
                        >
                            <RotateCcw className="h-5 w-5" />
                            {t('back')}
                        </Button>
                        <Button
                            onClick={capturePhoto}
                            size="lg"
                            className="flex-[2] h-14 rounded-2xl leaf-gradient border-0 font-bold gap-2"
                        >
                            <Camera className="h-5 w-5" />
                            {t('camera_take_photo')}
                        </Button>
                    </div>
                )}

                {mode === 'preview' && (
                    <div className="flex gap-3">
                        <Button
                            onClick={handleRetake}
                            size="lg"
                            variant="outline"
                            className="flex-1 h-14 rounded-2xl border-border font-bold gap-2"
                            disabled={isAnalyzing}
                        >
                            <RotateCcw className="h-5 w-5" />
                            {t('camera_retake')}
                        </Button>
                        <Button
                            onClick={handleAnalyze}
                            size="lg"
                            className="flex-[2] h-14 rounded-2xl leaf-gradient border-0 font-bold gap-2"
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    {t('camera_analyzing')}
                                </>
                            ) : (
                                <>
                                    <Scan className="h-5 w-5" />
                                    {t('camera_analyze')}
                                </>
                            )}
                        </Button>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </div>
        </div>
    );
}
