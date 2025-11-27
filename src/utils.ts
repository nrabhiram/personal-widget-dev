export const WIDGET_EVENTS = {
  AUTH_STATE_CHANGED: 'widgetAuthStateChanged',
  LEADERBOARD_DATA: 'widgetLeaderboardData',
  SUBMIT_SCORE: 'widgetSubmitScore',
  SHOW_AUTH_MODAL: 'widgetShowAuthModal',
  SHOW_LEADERBOARD: 'widgetShowLeaderboard',
  FETCH_LEADERBOARD: 'widgetFetchLeaderboard',
  FETCH_COMPLETED_GAMES: 'widgetFetchCompletedGames',
} as const;

export const GAME_EVENTS = {
  COMPLETED_GAMES_UPDATED: "widgetCompletedGamesUpdated",
  FETCH_LEADERBOARD: 'widgetFetchLeaderboard',
  SHOW_AUTH_MODAL: 'widgetShowAuthModal',
  AUTH_STATE_CHANGED: 'widgetAuthStateChanged',
  LEADERBOARD_DATA: 'widgetLeaderboardData',
} as const;

// Google Analytics GA4 tracking utilities
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const GA_PREFIX = 'GAME.NFL_CONNECTIONS.';

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const fullEventName = `${GA_PREFIX}${eventName}`;
    console.log('GA4 Event:', fullEventName, parameters);
    window.gtag('event', fullEventName, parameters);
  }
};

// Game Events
export const trackGameStart = (puzzleType: 'daily' | 'generated', difficulty?: string) => {
  trackEvent('game_start', {
    puzzle_type: puzzleType,
    difficulty: difficulty || 'unknown',
    timestamp: new Date().toISOString()
  });
};

export const trackGameEnd = (gameStats: {
  moves: number;
  hintsUsed: number;
  timeTaken: number;
  completed: boolean;
}) => {
  trackEvent('game_end', {
    moves: gameStats.moves,
    hints_used: gameStats.hintsUsed,
    time_taken_seconds: Math.floor(gameStats.timeTaken / 1000),
    completed: gameStats.completed,
    timestamp: new Date().toISOString()
  });
};

export const trackCellClick = (row: number, col: number, newValue: string | null, moveNumber: number) => {
  trackEvent('cell_click', {
    row,
    col,
    new_value: newValue || 'empty',
    move_number: moveNumber
  });
};

export const trackUndo = (movesRemaining: number) => {
  trackEvent('undo_action', {
    moves_remaining: movesRemaining
  });
};

export const trackHint = (hintsUsed: number, row: number, col: number) => {
  trackEvent('hint_used', {
    hints_used_total: hintsUsed,
    hint_row: row,
    hint_col: col
  });
};

export const trackReset = (currentMoves: number, currentHints: number) => {
  trackEvent('game_reset', {
    moves_before_reset: currentMoves,
    hints_before_reset: currentHints
  });
};

export const trackShare = (gameStats: {
  moves: number;
  hintsUsed: number;
  timeTaken: number;
}, shareMethod: 'native' | 'clipboard' | 'fallback') => {
  trackEvent('share_result', {
    moves: gameStats.moves,
    hints_used: gameStats.hintsUsed,
    time_taken_seconds: Math.floor(gameStats.timeTaken / 1000),
    share_method: shareMethod
  });
};

export const trackRuleView = () => {
  trackEvent('rules_viewed', {
    timestamp: new Date().toISOString()
  });
};

export const trackArchiveView = () => {
  trackEvent('archive_viewed', {
    timestamp: new Date().toISOString()
  });
};

export const trackArchivePuzzleLoad = (date: string, success: boolean) => {
  trackEvent('archive_puzzle_load', {
    puzzle_date: date,
    success,
    timestamp: new Date().toISOString()
  });
};

export const trackPuzzleLoad = (success: boolean, puzzleType: 'daily' | 'generated', error?: string) => {
  trackEvent('puzzle_load', {
    success,
    puzzle_type: puzzleType,
    error: error || null,
    timestamp: new Date().toISOString()
  });
};

// Tab Navigation Events
export const trackTabSwitch = (fromTab: string, toTab: string) => {
  trackEvent('tab_switch', {
    from_tab: fromTab,
    to_tab: toTab,
    timestamp: new Date().toISOString()
  });
};

// Leaderboard Events
export const trackLeaderboardView = (puzzleDate: string, userLoggedIn: boolean) => {
  trackEvent('leaderboard_view', {
    puzzle_date: puzzleDate,
    user_logged_in: userLoggedIn,
    timestamp: new Date().toISOString()
  });
};

export const trackLeaderboardRankView = (userRank: number, totalPlayers: number) => {
  trackEvent('leaderboard_rank_view', {
    user_rank: userRank,
    total_players: totalPlayers,
    timestamp: new Date().toISOString()
  });
};

// Dashboard Events
export const trackDashboardView = (userLoggedIn: boolean) => {
  trackEvent('dashboard_view', {
    user_logged_in: userLoggedIn,
    timestamp: new Date().toISOString()
  });
};

export const trackUserStatsView = (totalGames: number, currentStreak: number) => {
  trackEvent('user_stats_view', {
    total_games: totalGames,
    current_streak: currentStreak,
    timestamp: new Date().toISOString()
  });
};

export const trackPendingGamesClick = (pendingCount: number, totalAvailable: number) => {
  trackEvent('pending_games_click', {
    pending_count: pendingCount,
    total_available: totalAvailable,
    timestamp: new Date().toISOString()
  });
};

// Authentication Events
export const trackLoginAttempt = (method: 'email' | 'google') => {
  trackEvent('login_attempt', {
    method,
    timestamp: new Date().toISOString()
  });
};

export const trackLoginSuccess = (method: 'email' | 'google', isNewUser: boolean) => {
  trackEvent('login_success', {
    method,
    is_new_user: isNewUser,
    timestamp: new Date().toISOString()
  });
};

export const trackLoginError = (method: 'email' | 'google', errorType: string) => {
  trackEvent('login_error', {
    method,
    error_type: errorType,
    timestamp: new Date().toISOString()
  });
};

export const trackLogout = () => {
  trackEvent('logout', {
    timestamp: new Date().toISOString()
  });
};

export const trackSignupAttempt = (method: 'email' | 'google') => {
  trackEvent('signup_attempt', {
    method,
    timestamp: new Date().toISOString()
  });
};

export const trackSignupSuccess = (method: 'email' | 'google') => {
  trackEvent('signup_success', {
    method,
    timestamp: new Date().toISOString()
  });
};

// Profile Events
export const trackProfileEdit = () => {
  trackEvent('profile_edit', {
    timestamp: new Date().toISOString()
  });
};

export const trackProfileUpdate = (success: boolean) => {
  trackEvent('profile_update', {
    success,
    timestamp: new Date().toISOString()
  });
};

// Completion Screen Events
export const trackCompletionScreenView = (gameStats: {
  moves: number;
  hintsUsed: number;
  totalTime: number;
}) => {
  trackEvent('completion_screen_view', {
    moves: gameStats.moves,
    hints_used: gameStats.hintsUsed,
    total_time_seconds: Math.floor(gameStats.totalTime / 1000),
    timestamp: new Date().toISOString()
  });
};

export const trackCompletionScreenAction = (action: 'share' | 'leaderboard' | 'archive' | 'login') => {
  trackEvent('completion_screen_action', {
    action,
    timestamp: new Date().toISOString()
  });
};

// CTA Events
export const trackCTAClick = (ctaType: string, location: string, userLoggedIn: boolean) => {
  trackEvent('cta_click', {
    cta_type: ctaType,
    location,
    user_logged_in: userLoggedIn,
    timestamp: new Date().toISOString()
  });
};

// Modal Events
export const trackModalOpen = (modalType: string) => {
  trackEvent('modal_open', {
    modal_type: modalType,
    timestamp: new Date().toISOString()
  });
};

export const trackModalClose = (modalType: string, method: 'button' | 'overlay' | 'escape') => {
  trackEvent('modal_close', {
    modal_type: modalType,
    close_method: method,
    timestamp: new Date().toISOString()
  });
};

// Score Submission Events
export const trackScoreSubmission = (success: boolean, gameStats: {
  moves: number;
  hintsUsed: number;
  totalTime: number;
}, puzzleDate: string) => {
  trackEvent('score_submission', {
    success,
    moves: gameStats.moves,
    hints_used: gameStats.hintsUsed,
    total_time_seconds: Math.floor(gameStats.totalTime / 1000),
    puzzle_date: puzzleDate,
    timestamp: new Date().toISOString()
  });
};
