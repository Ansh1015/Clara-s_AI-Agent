# Clara AI Frontend

This is the React frontend for the Clara AI Pipeline. It serves as the primary user interface for users to manage their AI voice agent configurations, connect accounts, and track pipeline metrics.

## 🚀 Features Build Status

The frontend is a fully responsive Single Page Application (SPA) built with modern UI patterns including glassmorphism, floating cards, and animated elements.

### Public Pages
- **Landing Page**: Immersive hero section, feature highlights, and integration showcases.
- **Pricing**: Dynamic pricing cards with interactive toggles.
- **Docs & Blog**: Elegant, centered reading layouts for documentation and articles.
- **Authentication**: Custom Login and Sign-up screens integrated with Supabase OAuth.

### Internal Dashboard (Protected)
- **Dashboard Hub**: Core metrics (Pipeline Runs, Active Agents, Calls Handled) and quick actions.
- **Layout**: Fixed sidebar navigation with dynamic routing.
- **Integrations**: Displays real data fetched directly from the Supabase backend.

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | Core UI library |
| **Vite** | Fast build tooling and dev server |
| **Tailwind CSS 3** | Utility-first styling and layout structures |
| **Framer Motion** | UI transitions, hover physics, and reveal animations |
| **React Router v6** | Client-side routing with protected route boundaries |
| **Lucide React** | Consistent, clean iconography |
| **Supabase JS** | Authentication and database client |

## 📦 Getting Started

### 1. Configure Environment Variables
Create a `.env` file in the `frontend` directory:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Your app should now be running locally on `http://localhost:5173`.

## 🎨 Design System

- **Colors**: Dark cinematic theme centering around deep navy (`#0A0F1E`) with vibrant blue accents (`#3B82F6`).
- **Typography**: Modern sans-serif stack utilizing global CSS styling.
- **Effects**: Heavy use of "glassmorphism" using semi-transparent rgba backgrounds, subtle white borders, and custom backdrop blurs.
