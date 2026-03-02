# Specification

## Summary
**Goal:** Build FarmGuard AI, a mobile-first PWA that helps farmers detect crop diseases by photographing leaves, with offline-capable AI inference, multilingual support, voice guidance, weather-based risk alerts, and prediction history stored on a Motoko backend.

**Planned changes:**

**Frontend (React PWA):**
- Agriculture-themed UI using earthy greens, warm ambers, and soil browns; card-based layout with large touch targets optimized for mobile (375px+)
- Camera capture screen using getUserMedia API and file upload fallback, with image preview before analysis
- TensorFlow.js integration running a MobileNetV2-based demo model in-browser for crop disease detection with confidence scores; model cached via Service Worker for offline use; demo mode clearly labeled
- Results screen showing detected crop type, disease name, confidence score, organic treatment, chemical treatment, fertilizer recommendations, pesticide recommendations, and prevention tips — sourced from a static JSON lookup table; sections are collapsible/tabbed
- Language selector (English, Kannada, Hindi, Telugu) with i18n JSON files; persists in localStorage
- Voice guidance via Web Speech API: auto-reads disease name, top organic treatment, and prevention tip after analysis; play/stop buttons on results screen; graceful fallback if unsupported
- OpenWeatherMap API integration (VITE_WEATHER_API_KEY) to fetch current weather; disease risk alert banner when humidity > 70% and temperature 20–30°C; last weather data cached in localStorage
- Prediction History screen listing past scans (crop, disease, confidence, date) fetched from backend; tapping an item shows full results; empty state handled
- Offline-first Service Worker (Workbox or custom) pre-caching app shell and model files; stale-while-revalidate for API responses; offline indicator banner when navigator.onLine is false
- PWA manifest with app name, icons, and display: standalone

**Backend (Motoko):**
- Single `backend/main.mo` actor defining a `DiseaseRecord` type (unique ID, session ID, crop type, disease name, confidence score, timestamp, weather snapshot)
- `savePrediction` update function to persist records to stable storage
- `getPredictionsBySession` query function to retrieve records by session ID
- Stable HashMap for upgrade-safe storage

**User-visible outcome:** Farmers can open the PWA on any mobile browser, photograph a crop leaf, receive an AI-based disease diagnosis with treatment and prevention recommendations, hear results read aloud in their preferred language, view weather-based disease risk alerts, and review past scans — all working offline after the first visit.
