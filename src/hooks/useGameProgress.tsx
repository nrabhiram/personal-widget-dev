import { useState, useCallback } from 'react';
import { 
  collection, 
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { GameName, GAME_CONFIGS } from '@/config/games';
import { GAME_EVENTS } from '@/utils';

export const useGameProgress = () => {
  const [completedGames, setCompletedGames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fetchCompletedGames = useCallback(async (
    userId: string,
    gameName: GameName
  ) => {
    const { guestStorageKey: storageKey, progressCollection } = GAME_CONFIGS[gameName];

    if (!userId || userId === 'guest') {
      // For guests, use localStorage
      const guestGames = localStorage.getItem(storageKey);
      setCompletedGames(guestGames ? JSON.parse(guestGames) : []);
      window.dispatchEvent(
        new CustomEvent(GAME_EVENTS.COMPLETED_GAMES_UPDATED, {
          detail: { completedGames: guestGames ? JSON.parse(guestGames) : [] }
        })
      );
      setInitialized(true);
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, progressCollection, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCompletedGames(data.completedGames || []);
        window.dispatchEvent(
          new CustomEvent(GAME_EVENTS.COMPLETED_GAMES_UPDATED, {
            detail: { completedGames: data.completedGames || [] }
          })
        );
      } else {
        setCompletedGames([]);
        window.dispatchEvent(
          new CustomEvent(GAME_EVENTS.COMPLETED_GAMES_UPDATED, {
            detail: { completedGames: [] }
          })
        );
      }
      setInitialized(true);
    } catch (error) {
      console.error('Error fetching completed games:', error);
      setCompletedGames([]);
      setInitialized(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const markGameAsCompleted = useCallback(async (
    userId: string, 
    gameDate: string,
    gameName: GameName
  ) => {
    const { guestStorageKey: storageKey, progressCollection } = GAME_CONFIGS[gameName];
    
    if (!userId || userId === 'guest') {
      // For guests, use localStorage
      const guestGames = localStorage.getItem(storageKey);
      const games = guestGames ? JSON.parse(guestGames) : [];
      if (!games.includes(gameDate)) {
        games.push(gameDate);
        localStorage.setItem(storageKey, JSON.stringify(games));
        window.dispatchEvent(
          new CustomEvent(GAME_EVENTS.COMPLETED_GAMES_UPDATED, {
            detail: { completedGames: games }
          })
        );
        setCompletedGames(games);
      }
      return;
    }

    try {
      const docRef = doc(db, progressCollection, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(docRef, {
          completedGames: arrayUnion(gameDate),
          lastUpdated: Timestamp.now()
        });
      } else {
        // Create new document
        await setDoc(docRef, {
          userId,
          completedGames: [gameDate],
          lastUpdated: Timestamp.now()
        });
      }

      window.dispatchEvent(
        new CustomEvent(GAME_EVENTS.COMPLETED_GAMES_UPDATED, {
          detail: { completedGames: [...completedGames, gameDate] }
        })
      );
      
      // Update local state
      setCompletedGames(prev => 
        prev.includes(gameDate) ? prev : [...prev, gameDate]
      );
    } catch (error) {
      console.error('Error marking game as completed:', error);
    }
  }, [completedGames]);

  const isGameCompleted = useCallback((gameDate: string) => {
    return completedGames.includes(gameDate);
  }, [completedGames]);

  return {
    completedGames,
    initialized,
    loading,
    fetchCompletedGames,
    markGameAsCompleted,
    isGameCompleted
  };
};
