import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LeaderboardEntry {
    player: Principal;
    score: bigint;
    timestamp: Time;
}
export type Time = bigint;
export interface CommunityLevel {
    id: bigint;
    title: string;
    creator: Principal;
    ratings: Array<bigint>;
    playCount: bigint;
    tileData: string;
    averageRating: number;
}
export interface PlayerProfile {
    username: string;
    bestScoresPerLevel: Array<[bigint, bigint]>;
    unlockedLevels: Array<bigint>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Only the creator (authenticated user) can delete their own level.
     */
    deleteLevel(levelId: bigint): Promise<void>;
    /**
     * / Public: anyone (including guests) can browse community levels.
     */
    getAllCommunityLevels(): Promise<Array<CommunityLevel>>;
    /**
     * / Public: anyone can view all levels (alias kept for frontend compatibility).
     */
    getAllLevels(): Promise<Array<CommunityLevel>>;
    /**
     * / Only authenticated users can read their own profile.
     */
    getCallerUserProfile(): Promise<PlayerProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Public: anyone can fetch a single community level.
     */
    getCommunityLevel(id: bigint): Promise<CommunityLevel | null>;
    /**
     * / Public: anyone can view the leaderboard for a level.
     */
    getLeaderboardEntries(levelId: bigint): Promise<Array<LeaderboardEntry>>;
    /**
     * / Public: anyone can view top-rated levels.
     */
    getTopRatedLevels(limit: bigint): Promise<Array<CommunityLevel>>;
    /**
     * / Public: anyone can look up a player profile (needed for leaderboard display).
     */
    getUserProfile(user: Principal): Promise<PlayerProfile | null>;
    /**
     * / Only authenticated users can increment play count (guests cannot save progress).
     */
    incrementPlayCount(levelId: bigint): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Only authenticated users can publish levels.
     */
    publishLevel(title: string, tileData: string): Promise<bigint>;
    /**
     * / Only authenticated users can rate a level (guests cannot submit ratings).
     */
    rateLevel(levelId: bigint, rating: bigint): Promise<void>;
    /**
     * / Only authenticated users can save their own profile.
     */
    saveCallerUserProfile(profile: PlayerProfile): Promise<void>;
    /**
     * / Only authenticated users can submit a score to the leaderboard.
     */
    submitScore(levelId: bigint, score: bigint): Promise<void>;
}
