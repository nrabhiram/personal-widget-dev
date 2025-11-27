// hooks/useLeaderboard.ts
import { useState, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  BaseLeaderboardEntry,
  ConnectionsLeaderboardEntry, 
  GuessingGameLeaderboardEntry, 
  WordFumbleLeaderboardEntry, 
  WordSearchLeaderboardEntry 
} from '@/types';
import { GAME_CONFIGS, GameName } from '@/config/games';
import { GAME_EVENTS } from '@/utils';

type AnyLeaderboardEntry = 
  | ConnectionsLeaderboardEntry 
  | GuessingGameLeaderboardEntry
  | WordSearchLeaderboardEntry
  | WordFumbleLeaderboardEntry;

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

export const useLeaderboard = () => {
  const [currentLeaderboard, setCurrentLeaderboard] = useState<AnyLeaderboardEntry[]>([]);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboardForDate = useCallback(async (
    date: string, 
    gameName: GameName
  ) => {
    if (!date || typeof date !== 'string' || date.trim() === '') {
      setError('Invalid puzzle date');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { leaderboardCollection, progressCollection } = GAME_CONFIGS[gameName];
      const allDocsQuery = query(collection(db, leaderboardCollection));
      const allSnapshot = await getDocs(allDocsQuery);

      const sortField = gameName === GameName.NFLConnections ? 'score' : 'totalTime';
      const sortDirection = gameName === GameName.NFLConnections ? 'desc' : 'asc';
      
      const q = query(
        collection(db, leaderboardCollection),
        where('puzzleDate', '==', date),
        orderBy(sortField, sortDirection as 'asc' | 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(q);
      const entries: AnyLeaderboardEntry[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          ...data,
          completedAt: data.completedAt?.toDate() || new Date()
        } as AnyLeaderboardEntry);
      });
      
      setCurrentLeaderboard(entries);
      setCurrentDate(date);
      
      // Dispatch event with leaderboard data
      window.dispatchEvent(
        new CustomEvent(GAME_EVENTS.LEADERBOARD_DATA, {
          detail: {
            entries,
            currentDate: date,
            gameName,
          }
        })
      );
      
    } catch (error: any) {
      console.error('Leaderboard fetch error:', error);
      setError('Failed to load leaderboard');
      setCurrentLeaderboard([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitScore = async (
    userId: string,
    displayName: string,
    gameStats: Partial<Omit<AnyLeaderboardEntry, keyof BaseLeaderboardEntry>>,
    puzzleDate: string,
    gameName: GameName
  ) => {
    try {
      setError(null);

      const { leaderboardCollection, progressCollection } = GAME_CONFIGS[gameName];
      const leaderboardRef = collection(db, leaderboardCollection);
      
      // Check if user already has a score for this puzzle date
      const existingScoreQuery = query(
        leaderboardRef,
        where('userId', '==', userId),
        where('puzzleDate', '==', puzzleDate),
        limit(1)
      );
      
      const existingScoreSnapshot = await getDocs(existingScoreQuery);
      
      if (!existingScoreSnapshot.empty) {
        return;
      }
      
      const leaderboardEntry = {
        userId,
        displayName,
        puzzleDate,
        // moves: gameStats.moves,
        // hintsUsed: gameStats.hintsUsed,
        // totalTime: gameStats.totalTime,
        // score: gameStats.score,
        completedAt: Timestamp.now(),
        ...gameStats
      };
      
      await addDoc(leaderboardRef, leaderboardEntry);
      
      // Refresh leaderboard after submission
      await fetchLeaderboardForDate(puzzleDate, gameName); 
    } catch (error: any) {
      console.error('Score submission error:', error);
      setError('Failed to submit score');
    }
  };

  const getUserRank = async (
    userId: string, 
    puzzleDate: string,
    gameName: GameName,
  ): Promise<{ rank: number; userEntry: AnyLeaderboardEntry } | null> => {
    try {
      const { leaderboardCollection, progressCollection } = GAME_CONFIGS[gameName];
      const leaderboardRef = collection(db, leaderboardCollection);

      const sortField = gameName === GameName.NFLConnections ? 'score' : 'totalTime';
      const sortDirection = gameName === GameName.NFLConnections ? 'desc' : 'asc';

      const q = query(
        leaderboardRef,
        where('puzzleDate', '==', puzzleDate),
        orderBy(sortField, sortDirection as 'asc' | 'desc')
      );
      
      const snapshot = await getDocs(q);
      const allEntries: AnyLeaderboardEntry[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        allEntries.push({
          id: doc.id,
          ...data,
          completedAt: data.completedAt?.toDate() || new Date()
        } as AnyLeaderboardEntry);
      });
      
      const userEntryIndex = allEntries.findIndex(entry => entry.userId === userId);
      if (userEntryIndex === -1) return null;
      
      return {
        rank: userEntryIndex + 1,
        userEntry: allEntries[userEntryIndex]
      };
    } catch (error) {
      console.error('Get user rank error:', error);
      return null;
    }
  };

  return {
    currentLeaderboard,
    currentDate,
    loading,
    error,
    submitScore,
    fetchLeaderboardForDate,
    getUserRank
  };
};
