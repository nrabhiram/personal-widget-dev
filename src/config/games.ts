export enum GameName {
  NFLConnections = 'nfl-connections',
  NFLWordFumble = 'nfl-word-fumble',
  NFLPlayerGuessingGame = 'nfl-player-guessing-game',
  NFLDraftProspectGuessingGame = 'nfl-draft-prospect-guessing-game',
  NBAPlayerGuessingGame = "nba-player-guessing-game",
  WWEGuessingGame = 'wwe-guessing-game',
  NFLWordSearch = "nfl-word-search"
}

interface GameConfig {
  progressCollection: string;
  leaderboardCollection: string;
  guestStorageKey: string;
}

export const GAME_CONFIGS: Record<GameName, GameConfig> = Object.values(GameName).reduce(
  (acc, gameName) => {
    acc[gameName] = {
      progressCollection: `${gameName}-user-progress`,
      leaderboardCollection: `${gameName}-leaderboard`,
      guestStorageKey: `${gameName}-guest-completed-games`
    };
    return acc;
  },
  {} as Record<GameName, GameConfig>
);
