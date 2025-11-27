// components/LeaderboardModal.tsx
'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X, Trophy } from 'lucide-react';
import { User } from 'firebase/auth';
import Image from 'next/image';
import { GAME_EVENTS, WIDGET_EVENTS } from '@/utils';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  moves: number;
  hintsUsed: number;
  totalTime: number;
  completedAt: Date;
  puzzleDate: string;
  score: number;
}

interface LeaderboardModalProps {
  user: User | null;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  user,
  onClose
}) => {
  const [currentLeaderboard, setCurrentLeaderboard] = React.useState<LeaderboardEntry[]>([]);
  const [currentPuzzleDate, setCurrentPuzzleDate] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [userRankInfo, setUserRankInfo] = React.useState<{ rank: number; userEntry: LeaderboardEntry } | null>(null);

  // Listen for leaderboard data from widget
  React.useEffect(() => {
    const handleLeaderboardData = (event: CustomEvent) => {
      const { entries, currentDate } = event.detail;
      setCurrentLeaderboard(entries);
      setCurrentPuzzleDate(currentDate);
    };

    window.addEventListener('widgetLeaderboardData', handleLeaderboardData as EventListener);

    return () => {
      window.removeEventListener('widgetLeaderboardData', handleLeaderboardData as EventListener);
    };
  }, []);

  // Request leaderboard data when modal opens
  React.useEffect(() => {
    // Get current date from parent app or use today's date
    const today = new Date().toISOString().split('T')[0];
    
    window.dispatchEvent(
      new CustomEvent(GAME_EVENTS.FETCH_LEADERBOARD, {
        detail: { date: today }
      })
    );
  }, []);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const userInTop20 = user && currentLeaderboard.some(entry => entry.userId === user.uid);

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-scroll flex flex-col">
        {/* Header */}
        {user && (
          <div className="bg-gradient-to-r from-gray-800 to-black p-6 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src="https://connections-game-pfn.netlify.app/leaderboard-logo.png"
              alt=""
              width={154}
              height={94}
              className='absolute top-0 -left-2'
            />
            <div className="flex items-center justify-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-800">
                {currentPuzzleDate ? 
                  `${new Date(currentPuzzleDate).toLocaleDateString('en-US', { 
                    day: 'numeric', 
                    month: 'short' 
                  })} Leaderboard` :
                  `Leaderboard`
                }
              </h2>
            </div>
            
            <p className="text-gray-400 text-sm mt-1">
              Rankings based on highest score
            </p>
          </div>
        )}

        {/* Content */}
        {user && (
          <div className="p-4 overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Loading leaderboard...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
              </div>
            ) : currentLeaderboard.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No scores yet today!</p>
                <p className="text-gray-500">Be the first to complete today's puzzle.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Top 20 Players</h3>
                </div>
                
                {currentLeaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 shadow-lg'
                        : ''
                    } ${
                      user?.uid === entry.userId
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {getRankIcon(index + 1)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-sm ${
                            index === 0 
                              ? 'text-yellow-800 text-base font-bold' 
                              : 'text-gray-800'
                          }`}>
                            {entry.displayName || 'Anonymous'}
                          </span>
                          {index === 0 && (
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-bold">
                              WINNER
                            </span>
                          )}
                          {user?.uid === entry.userId && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-base font-bold ${
                        index === 0 
                          ? 'text-yellow-700 text-lg' 
                          : 'text-green-600'
                        }
                      `}>
                        {entry.score} pts
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(entry.totalTime)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!user && (
          <div className="flex flex-col px-4 py-5 text-center">
            <button
              onClick={onClose}
              className="mt-4 mr-4 ml-auto mb-2 text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex w-full justify-center">
              <img
                src="https://connections-game-pfn.netlify.app/leaderboard-icon.png"
                alt=""
                width={34}
                height={34}
                className=''
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign in to view the leaderboard</h2>
            <p className="text-xs text-[#666666] mb-4">Create an account to see how you rank against other players and track your progress over time.</p>
            <button 
              className="px-4 py-2 bg-[#0857C3] text-white text-lg font-semibold w-full text-center block rounded-md"
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent(GAME_EVENTS.SHOW_AUTH_MODAL))
              }}
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
