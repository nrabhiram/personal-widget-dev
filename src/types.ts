// types/events.ts
export interface AuthStateChangedEvent {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
  } | null;
}

export interface BaseLeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  puzzleDate: string;
  // score: number;
  // totalTime: number;
  completedAt: Date;
}

export interface ConnectionsLeaderboardEntry extends BaseLeaderboardEntry {
  moves: number;
  hintsUsed: number;
  totalTime: number;
  score: number;
}

export interface GuessingGameLeaderboardEntry extends BaseLeaderboardEntry {
  moves: number;
  totalTime: number;
}

export interface WordSearchLeaderboardEntry extends BaseLeaderboardEntry {
  moves: number;
  totalTime: number;
}

export interface WordFumbleLeaderboardEntry extends BaseLeaderboardEntry {
  moves: number;
  totalTime: number;
}

interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  puzzleDate: string;
  moves: number;
  hintsUsed: number;
  totalTime: number;
  completedAt: Date;
  score: number;
}

export interface LeaderboardDataEvent {
  entries: Array<{
    id: string;
    userId: string;
    displayName: string;
    puzzleDate: string;
    score: number;
    moves: number;
    hintsUsed: number;
    totalTime: number;
    completedAt: Date;
  }>;
  currentDate: string;
}

export interface ScoreSubmissionEvent {
  displayName: string;
  gameStats: {
    // moves: number;
    // hintsUsed: number;
    totalTime: number;
    score: number;
    [key: string]: any;
  };
  puzzleDate: string;
}
