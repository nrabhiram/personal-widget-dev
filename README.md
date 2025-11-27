This is the widget application built for PFSN's suite of games. It was primarily developed for the *NFL Connections Game*, but is being extneded to the rest of the games. It mainly allows the user to do the following things:

- authenticate
- render the profile button, dropdown, and authentication modal
- fetch the leaderboard data
- render the leaderboard data
- fetch the games completed by a user
- submit the score after completing a game

## Getting Started

This project uses NextJS, but ESBuild is used to compile the project and provide the necessary CSS and JS to insert the widget within the tool.

```bash
# install dependencies
yarn install

# build the project
yarn build
```

## Usage

This section outlines how a user of the widget, i.e. the developer of the game can interact with the widget's API. Communication b/w the game application and the widget happens via custom events. 

### Initializing the Widget

We load the widget script and CSS into the game application as shown:

```js
  function loadWidget() {
    return new Promise((resolve, reject) => {
      // Load the widget CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://connections-game-auth-widget.vercel.app//widget.css';
      document.head.appendChild(link);

      // Load the widget script
      const script = document.createElement('script');
      script.src = 'https://connections-game-auth-widget.vercel.app//widget.js';
      script.onload = function() {
        if (window.ConnectionsWidget) {
          ConnectionsWidget.mount('.pfn-header-wrapper .pfn-header-container');
          widgetLoaded = true;
          overlayState.widgetLoaded = true;
          resolve();
        } else {
          console.error('ConnectionsWidget not found');
          reject(new Error('ConnectionsWidget not found'));
        }
      };
      script.onerror = function() {
        console.error('Failed to load widget script');
        reject(new Error('Failed to load widget script'));
      };
      document.head.appendChild(script);
    });
  }
```

### Widget to Game Communication

The follow events are triggered by the widget, and are listened to by the game.

- `COMPLETED_GAMES_UPDATED`: Whenever the state for completed games is updated, i.e. the answer for current game being played is submitted or auth state changes this event is fired.
    - `completedGames: string[]`: List of dates for which games have been completed by the player.
- `AUTH_STATE_CHANGED`: Whenever the user signs in or out, or they switch accounts.
    - `user: object | undefined`: This is used to tell whether the user is signed in or not

### Game to Widget Communication

The following events are triggered by the game, and the widget listens to them and handles them accordingly.

- `SHOW_LEADERBOARD`: Sets the state for whether the leaderboard modal is open to `true`
- `FETCH_LEADERBOARD`: Whenever the leaderboard modal is opened, and the data for the leaderboard needs to be fetched
    - `date: string`: The date of the game that is currently being played
    - `gameName: string`: The name of the game to determine which table to fetch on Firebase
- `SUBMIT_SCORE`: This is triggered once the game has been completed to share the following data so that a record can be created in the leaderboard table on Firebase
    - `displayName: string`: The name of the player that will be shown on the leaderboard. Up to the game's developer how they want to format the name. Ideally use the `user.displayName` if signed in or `Guest` otherwise.
    - `gameStats: object`: The stats that you want to show in the leaderboard entry should be present in this object (more on this below).
    - `puzzleDate: string`: The date of the game currently being submitted.
    - `gameName: string`: The name of the game to determine which table to update on Firebase.
- `widgetGameCompleted`: To update the list of games completed by this player, either locally if they're a guest, or on Firebase if they're authenticated.
    - `gameDate: string`: The date of the game currently being submitted.
    - `gameName: string`: The name of the game to determine which table to update on Firebase.

### Adding a New Game to the Widget

To add a new game to the widget, follow these steps:

1. **Add the game to the enum**
   - Open `config/games.ts`
   - Add your game to the `GameName` enum:
```typescript
     export enum GameName {
       NFLConnections = 'nfl-connections',
       NFLWordFumble = 'nfl-word-fumble',
       NFLDraftProspectGuessingGame = 'nfl-draft-prospect-guessing-game',
       YourNewGame = 'your-new-game', // Add your game here
     }
```
   - The `GAME_CONFIGS` object will automatically generate:
     - `progressCollection`: `your-new-game-user-progress`
     - `leaderboardCollection`: `your-new-game-leaderboard`
     - `guestStorageKey`: `your-new-game_guest_completed_games`
2. **Define the leaderboard entry type**
   - Open `types.ts`
   - Create a type that extends `BaseLeaderboardEntry`:
```typescript
     export interface YourNewGameLeaderboardEntry extends BaseLeaderboardEntry {
       moves: number;
       totalTime: number;
       // Add any other game-specific fields
       customField: string;
     }
```
   - Add your type to the union in `hooks/useLeaderboard.ts`:
```typescript
     type AnyLeaderboardEntry = 
       | ConnectionsLeaderboardEntry 
       | GuessingGameLeaderboardEntry
       | WordSearchLeaderboardEntry
       | WordFumbleLeaderboardEntry
       | YourNewGameLeaderboardEntry; // Add here
```
3. **Configure leaderboard sorting (optional)**
   - If your game should sort by a field other than `totalTime`, update `hooks/useLeaderboard.ts`:
```typescript
     const sortField = gameName === GameName.NFLConnections 
       ? 'score' 
       : gameName === GameName.YourNewGame
       ? 'customField'
       : 'totalTime';
     
     const sortDirection = gameName === GameName.NFLConnections 
       ? 'desc' 
       : gameName === GameName.YourNewGame
       ? 'asc'
       : 'asc';
```

**Note:** Firebase collections (`your-new-game-user-progress` and `your-new-game-leaderboard`) will be created automatically on first write. No additional Firebase configuration is needed.
