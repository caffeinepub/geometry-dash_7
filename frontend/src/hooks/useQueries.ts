import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PlayerProfile, CommunityLevel, LeaderboardEntry } from '../backend';

// ── Profile Queries ──────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<PlayerProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: PlayerProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetUserProfile(principal: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PlayerProfile | null>({
    queryKey: ['userProfile', principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      const { Principal } = await import('@dfinity/principal');
      return actor.getUserProfile(Principal.fromText(principal));
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

// ── Community Level Queries ──────────────────────────────────────────────────

export function useGetAllCommunityLevels() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CommunityLevel[]>({
    queryKey: ['communityLevels'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCommunityLevels();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetCommunityLevel(id: bigint | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CommunityLevel | null>({
    queryKey: ['communityLevel', id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getCommunityLevel(id);
    },
    enabled: !!actor && !actorFetching && id !== undefined,
  });
}

export function usePublishLevel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, tileData }: { title: string; tileData: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.publishLevel(title, tileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityLevels'] });
    },
  });
}

export function useDeleteLevel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (levelId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteLevel(levelId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityLevels'] });
    },
  });
}

export function useRateLevel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ levelId, rating }: { levelId: bigint; rating: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rateLevel(levelId, rating);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communityLevels'] });
      queryClient.invalidateQueries({ queryKey: ['communityLevel', variables.levelId.toString()] });
    },
  });
}

export function useIncrementPlayCount() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (levelId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.incrementPlayCount(levelId);
    },
  });
}

// ── Leaderboard Queries ──────────────────────────────────────────────────────

export function useGetLeaderboardEntries(levelId: bigint | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', levelId?.toString()],
    queryFn: async () => {
      if (!actor || levelId === undefined) return [];
      return actor.getLeaderboardEntries(levelId);
    },
    enabled: !!actor && !actorFetching && levelId !== undefined,
  });
}

export function useSubmitScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ levelId, score }: { levelId: bigint; score: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitScore(levelId, score);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard', variables.levelId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetTopRatedLevels(limit: number) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CommunityLevel[]>({
    queryKey: ['topRatedLevels', limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopRatedLevels(BigInt(limit));
    },
    enabled: !!actor && !actorFetching,
  });
}
