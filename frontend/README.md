# Vertex Admin Dashboard

A high-performance, responsive React admin dashboard designed for enterprise scale. 
Features dark/light mode, real-time data table mockups, glassmorphism aesthetics, and extensive component reusability.

## Tech Stack
- **React 18** (Hooks, Suspense, Lazy Loading)
- **Vite** (Ultra-fast HMR and build pipeline)
- **Tailwind CSS v3** (Custom design tokens, animations, variables)
- **React Router v6** (Protected routes, nested layouts)
- **Zustand** (Authentication state management)
- **Lucide React** (Consistent iconography)

## Local Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Build & Deploy

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

## Demo Credentials
- **Email**: admin@vertex.io
- **Password**: password123

## Folder Structure
```
src/
├── components/
│   ├── dashboard/  # Data tables, Modals, Stat Cards
│   ├── layout/     # Sidebar, Navbar, Page Wrappers
│   └── ui/         # Buttons, Badges, Avatars, Skeletons, Toasts
├── context/        # Auth Context
├── data/           # Mock API data responses
├── hooks/          # useTable, useModal, useToast
├── lib/            # Utilities (cn, tailwind-merge)
└── pages/          # Route views (Login, Dashboard, Users, etc.)
```
