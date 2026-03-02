import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { LanguageProvider } from './contexts/LanguageContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { CameraCapture } from './pages/CameraCapture';
import { Results } from './pages/Results';
import { History } from './pages/History';

// Root route with Layout wrapper
const rootRoute = createRootRoute({
    component: () => (
        <LanguageProvider>
            <Layout>
                <Outlet />
            </Layout>
        </LanguageProvider>
    ),
});

// Home route
const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Home,
});

// Scan / Camera route
const scanRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/scan',
    component: CameraCapture,
});

// Results route with search params
const resultsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/results',
    validateSearch: (search: Record<string, unknown>) => ({
        cropType: (search.cropType as string) || 'Unknown',
        diseaseName: (search.diseaseName as string) || 'Healthy',
        confidence: typeof search.confidence === 'number' ? search.confidence : parseFloat(search.confidence as string) || 0.5,
        isDemo: search.isDemo === true || search.isDemo === 'true',
        imageData: (search.imageData as string) || undefined,
    }),
    component: Results,
});

// History route
const historyRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/history',
    component: History,
});

// Build route tree
const routeTree = rootRoute.addChildren([
    homeRoute,
    scanRoute,
    resultsRoute,
    historyRoute,
]);

// Create router
const router = createRouter({ routeTree });

// Register router for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

export default function App() {
    return <RouterProvider router={router} />;
}
