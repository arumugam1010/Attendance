# BuildTrack - Smart Attendance Management System

A modern React-based attendance management system with GPS location tracking.

## Features

- ✅ Employee attendance marking with GPS verification
- ✅ Real-time location tracking and validation
- ✅ Attendance history with detailed location information
- ✅ Role-based access (Admin/Employee)
- ✅ Responsive design with modern UI

## Location Accuracy

The app uses reverse geocoding to convert GPS coordinates to human-readable addresses.

### Current Implementation
- Uses OpenStreetMap Nominatim API (free, no API key required)
- Provides detailed address components when available
- Admins can manually edit incorrect addresses

### Accuracy Issues & Solutions

**Why addresses might be wrong:**
- GPS device/browser accuracy limitations
- Incomplete map data in geocoding services
- Network conditions affecting GPS signals
- Rural/remote areas with poor map coverage

**Backend won't automatically fix this** - accuracy depends on geocoding service quality, not frontend vs backend.

### For Better Accuracy (Optional)

1. **Get Google Maps API Key**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
   - Enable "Geocoding API"
   - Create an API key

2. **Add to Environment**:
   ```bash
   # In .env file
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

3. **Benefits**:
   - More accurate addresses
   - Better place recognition
   - Commercial-grade reliability

### Manual Address Correction
- Admins can manually edit incorrect addresses in attendance history
- Raw GPS coordinates are always preserved for verification
- Manual edits are marked with "manual" source indicator

### For Production Use
Consider using enterprise geocoding services like:
- Google Maps Platform (paid)
- Mapbox Geocoding (paid)
- Here Maps (paid)
- TomTom Geocoding (paid)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Query
- Wouter (routing)
- Local Storage (demo data)