// Demo mode AI model - simulates disease detection without a real trained model
// In production, replace with actual TFLite/ONNX model inference

export interface PredictionResult {
    cropType: string;
    diseaseName: string;
    confidence: number;
    isDemo: boolean;
}

const DEMO_PREDICTIONS: PredictionResult[] = [
    { cropType: 'Tomato', diseaseName: 'Tomato Late Blight', confidence: 0.87, isDemo: true },
    { cropType: 'Rice', diseaseName: 'Rice Blast', confidence: 0.92, isDemo: true },
    { cropType: 'Wheat', diseaseName: 'Wheat Rust', confidence: 0.78, isDemo: true },
    { cropType: 'Cotton', diseaseName: 'Cotton Bollworm', confidence: 0.83, isDemo: true },
    { cropType: 'Potato', diseaseName: 'Potato Early Blight', confidence: 0.89, isDemo: true },
    { cropType: 'Maize', diseaseName: 'Maize Leaf Blight', confidence: 0.75, isDemo: true },
    { cropType: 'Tomato', diseaseName: 'Healthy', confidence: 0.95, isDemo: true },
];

let modelLoaded = false;

export async function loadModel(): Promise<boolean> {
    // Simulate model loading delay
    await new Promise(resolve => setTimeout(resolve, 800));
    modelLoaded = true;
    return true;
}

export async function predictDisease(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<PredictionResult> {
    if (!modelLoaded) {
        await loadModel();
    }

    // Simulate inference time
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Demo: analyze image brightness to vary prediction slightly
    let brightnessScore = 0.5;
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(imageElement, 0, 0, 32, 32);
            const data = ctx.getImageData(0, 0, 32, 32).data;
            let total = 0;
            for (let i = 0; i < data.length; i += 4) {
                total += (data[i] + data[i + 1] + data[i + 2]) / 3;
            }
            brightnessScore = total / (data.length / 4) / 255;
        }
    } catch {
        // Canvas tainted or unavailable
    }

    // Use brightness to deterministically pick a prediction for demo consistency
    const index = Math.floor(brightnessScore * DEMO_PREDICTIONS.length) % DEMO_PREDICTIONS.length;
    const base = DEMO_PREDICTIONS[index];

    // Add slight randomness to confidence
    const confidence = Math.min(0.99, Math.max(0.60, base.confidence + (Math.random() * 0.06 - 0.03)));

    return { ...base, confidence: parseFloat(confidence.toFixed(2)) };
}

export function checkImageQuality(imageElement: HTMLImageElement | HTMLCanvasElement): { isGood: boolean; warning?: string } {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (!ctx) return { isGood: true };

        ctx.drawImage(imageElement, 0, 0, 64, 64);
        const data = ctx.getImageData(0, 0, 64, 64).data;

        let totalBrightness = 0;
        for (let i = 0; i < data.length; i += 4) {
            totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        const avgBrightness = totalBrightness / (data.length / 4);

        if (avgBrightness < 40) {
            return { isGood: false, warning: 'camera_quality_warning' };
        }
        return { isGood: true };
    } catch {
        return { isGood: true };
    }
}
