'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { GAME_EVENTS, WIDGET_EVENTS } from '@/utils'; 
import AuthModal from './AuthModal';
import { LeaderboardModal } from './LeaderboardModal';
import { ProfileButton } from './ProfileModal';
import { useGameProgress } from '@/hooks/useGameProgress';

export default function ConnectionsAuthWidget() {
  const { user, logout, loading } = useAuth();
  const { submitScore, fetchLeaderboardForDate } = useLeaderboard();
  const { completedGames, fetchCompletedGames, markGameAsCompleted, isGameCompleted, initialized } = useGameProgress();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for events from parent app
  useEffect(() => {
    const handleShowAuthModal = () => {
      setShowAuthModal(true);
    };
    
    const handleShowLeaderboard = () => {
      setShowLeaderboard(true);
    };
    
    const handleSubmitScore = async (event: CustomEvent) => {
      const { displayName, gameStats, puzzleDate, gameName } = event.detail;
      
      if (!user) {
        return;
      }

      try {
        await submitScore(user.uid, displayName, gameStats, puzzleDate, gameName);
      } catch (error) {
        console.error('Widget: Score submission error:', error);
      }
    };

    const handleFetchLeaderboard = async (event: CustomEvent) => {
      const { date, gameName } = event.detail;
      await fetchLeaderboardForDate(date, gameName);
    };

    const handleFetchCompletedGames = async (event: CustomEvent) => {
      const { gameName } = event.detail;
      const userId = user ? user.uid : 'guest';
      await fetchCompletedGames(userId, gameName);
    }

    // Add event listeners
    window.addEventListener(WIDGET_EVENTS.SHOW_AUTH_MODAL, handleShowAuthModal as EventListener);
    window.addEventListener(WIDGET_EVENTS.SHOW_LEADERBOARD, handleShowLeaderboard as EventListener);
    window.addEventListener(WIDGET_EVENTS.SUBMIT_SCORE, handleSubmitScore as unknown as EventListener);
    window.addEventListener(WIDGET_EVENTS.FETCH_LEADERBOARD, handleFetchLeaderboard as unknown as EventListener);
    window.addEventListener(WIDGET_EVENTS.FETCH_COMPLETED_GAMES, handleFetchCompletedGames as unknown as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener(WIDGET_EVENTS.SHOW_AUTH_MODAL, handleShowAuthModal as EventListener);
      window.removeEventListener(WIDGET_EVENTS.SHOW_LEADERBOARD, handleShowLeaderboard as EventListener);
      window.removeEventListener(WIDGET_EVENTS.SUBMIT_SCORE, handleSubmitScore as unknown as EventListener);
      window.removeEventListener(WIDGET_EVENTS.FETCH_LEADERBOARD, handleFetchLeaderboard as unknown as EventListener);
    };
  }, [user, submitScore, fetchLeaderboardForDate, fetchCompletedGames]);

  // useEffect(() => {
  //   if (!loading) {
  //     // Re-fetch completed games for the new user
  //     const userId = user ? user.uid : 'guest';
  //     fetchCompletedGames(userId);
  //   }
  // }, [user, loading, fetchCompletedGames]);

  useEffect(() => {
    if (initialized) {
      window.dispatchEvent(
        new CustomEvent(GAME_EVENTS.COMPLETED_GAMES_UPDATED, {
          detail: { completedGames }
        })
      );
    }
  }, [completedGames, initialized]);

  useEffect(() => {
    const handleGameCompleted = async (event: CustomEvent) => {
      const { gameDate, gameName } = event.detail;
      const userId = user ? user.uid : 'guest';
      await markGameAsCompleted(userId, gameDate, gameName);
    };

    window.addEventListener('widgetGameCompleted', handleGameCompleted as unknown as EventListener);

    return () => {
      window.removeEventListener('widgetGameCompleted', handleGameCompleted as unknown as EventListener);
    };
  }, [user, markGameAsCompleted]);

  if (!mounted) return null;

  return (
    <>
      {/* Profile Button - render this wherever you want */}
      <ProfileButton
        user={user}
        onShowLogin={() => setShowAuthModal(true)}
        onLogout={logout}
      />

      {/* Modals */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
      
      {showLeaderboard && (
        <LeaderboardModal
          user={user}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </>
  );
}
