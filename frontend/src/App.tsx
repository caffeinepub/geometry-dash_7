import React from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { Header } from '@/components/layout/Header';
import { ProfileSetupModal } from '@/components/auth/ProfileSetupModal';
import { useGetCallerUserProfile } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { LevelSelectPage } from '@/pages/LevelSelectPage';
import { GamePage } from '@/pages/GamePage';
import { LevelEditorPage } from '@/pages/LevelEditorPage';
import { CommunityHubPage } from '@/pages/CommunityHubPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';

function Layout() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const showProfileSetup = isAuthenticated && !isLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <footer className="border-t-4 border-border bg-secondary py-4 px-4 text-center">
        <p className="text-muted-foreground font-pixel text-[7px]">
          © {new Date().getFullYear()} PIXEL DASH &nbsp;·&nbsp; Built with{' '}
          <span className="text-destructive">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== 'undefined' ? window.location.hostname : 'pixel-dash'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-green hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
      <ProfileSetupModal open={showProfileSetup} />
    </div>
  );
}

function HomePage() {
  return <LevelSelectPage />;
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const levelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/levels',
  component: LevelSelectPage,
});

const playRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/play',
  component: GamePage,
  validateSearch: (search: Record<string, unknown>) => ({
    levelId: String(search.levelId ?? '-1'),
    type: (search.type as 'prebuilt' | 'community') ?? 'prebuilt',
  }),
});

const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/editor',
  component: LevelEditorPage,
});

const communityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/community',
  component: CommunityHubPage,
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/leaderboard',
  component: LeaderboardPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  levelsRoute,
  playRoute,
  editorRoute,
  communityRoute,
  leaderboardRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
