import type { GameSettings, GameState, MoveResult, PlayerKey } from '../types/game';
import { DEFAULT_BOARD_LENGTH, MAX_BOARD_LENGTH, MIN_BOARD_LENGTH } from './tasks';

export const DEFAULT_SETTINGS: GameSettings = {
  boardLength: DEFAULT_BOARD_LENGTH,
  playerNames: {
    A: '玩家 A',
    B: '玩家 B'
  },
  exactFinish: false,
  showTaskPreview: true,
  overshootRule: 'stay'
};

export const clampBoardLength = (value: number): number => {
  if (!Number.isFinite(value)) {
    return DEFAULT_BOARD_LENGTH;
  }

  return Math.min(MAX_BOARD_LENGTH, Math.max(MIN_BOARD_LENGTH, Math.round(value)));
};

export const sanitizePlayerName = (value: string, fallback: string): string => {
  const nextValue = value.trim();
  return nextValue || fallback;
};

export const sanitizeSettings = (input?: Partial<GameSettings> | null): GameSettings => ({
  boardLength: clampBoardLength(input?.boardLength ?? DEFAULT_SETTINGS.boardLength),
  playerNames: {
    A: sanitizePlayerName(input?.playerNames?.A ?? DEFAULT_SETTINGS.playerNames.A, '玩家 A'),
    B: sanitizePlayerName(input?.playerNames?.B ?? DEFAULT_SETTINGS.playerNames.B, '玩家 B')
  },
  exactFinish: Boolean(input?.exactFinish),
  showTaskPreview:
    typeof input?.showTaskPreview === 'boolean'
      ? input.showTaskPreview
      : DEFAULT_SETTINGS.showTaskPreview,
  overshootRule: 'stay'
});

export const createInitialGameState = (settings?: GameSettings): GameState => {
  const nextSettings = sanitizeSettings(settings);

  return {
    settings: nextSettings,
    positions: {
      A: 0,
      B: 0
    },
    currentPlayer: 'A',
    lastRoll: null,
    lastMovedPlayer: null,
    lastMovedTo: null,
    pendingTask: null,
    winner: null
  };
};

export const rollDice = (): number => Math.floor(Math.random() * 6) + 1;

export const movePlayer = (
  currentPosition: number,
  steps: number,
  boardLength: number,
  exactFinish: boolean
): MoveResult => {
  const target = currentPosition + steps;

  if (!exactFinish) {
    return {
      position: Math.min(target, boardLength),
      moved: true,
      overshot: false
    };
  }

  if (target > boardLength) {
    return {
      position: currentPosition,
      moved: false,
      overshot: true,
      note: `需要刚好到达终点，第 ${boardLength} 格才算胜利；本次超出后停留原地。`
    };
  }

  return {
    position: target,
    moved: true,
    overshot: false
  };
};

export const checkWinner = (position: number, boardLength: number): boolean => position >= boardLength;

export const getNextPlayer = (player: PlayerKey): PlayerKey => (player === 'A' ? 'B' : 'A');

export const sanitizeGameState = (input: unknown, fallback: GameState): GameState => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return fallback;
  }

  const raw = input as Partial<GameState>;
  const settings = sanitizeSettings(raw.settings);
  const clampPosition = (value: unknown): number => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return 0;
    }

    return Math.min(settings.boardLength, Math.max(0, Math.round(value)));
  };

  const positions = {
    A: clampPosition(raw.positions?.A),
    B: clampPosition(raw.positions?.B)
  };

  const currentPlayer: PlayerKey = raw.currentPlayer === 'B' ? 'B' : 'A';
  const winner =
    raw.winner === 'A' || raw.winner === 'B'
      ? checkWinner(positions[raw.winner], settings.boardLength)
        ? raw.winner
        : null
      : null;

  const pendingTask =
    raw.pendingTask &&
    typeof raw.pendingTask === 'object' &&
    !Array.isArray(raw.pendingTask) &&
    (raw.pendingTask.player === 'A' || raw.pendingTask.player === 'B')
      ? {
          player: raw.pendingTask.player,
          cell: clampPosition(raw.pendingTask.cell),
          task: typeof raw.pendingTask.task === 'string' ? raw.pendingTask.task : '',
          moved: Boolean(raw.pendingTask.moved),
          note: typeof raw.pendingTask.note === 'string' ? raw.pendingTask.note : undefined,
          winnerAfterCompletion: Boolean(raw.pendingTask.winnerAfterCompletion),
          roll:
            typeof raw.pendingTask.roll === 'number' &&
            raw.pendingTask.roll >= 1 &&
            raw.pendingTask.roll <= 6
              ? raw.pendingTask.roll
              : 1
        }
      : null;

  return {
    settings,
    positions,
    currentPlayer,
    lastRoll:
      typeof raw.lastRoll === 'number' && raw.lastRoll >= 1 && raw.lastRoll <= 6
        ? raw.lastRoll
        : null,
    lastMovedPlayer: raw.lastMovedPlayer === 'A' || raw.lastMovedPlayer === 'B' ? raw.lastMovedPlayer : null,
    lastMovedTo:
      typeof raw.lastMovedTo === 'number' && raw.lastMovedTo >= 0
        ? clampPosition(raw.lastMovedTo)
        : null,
    pendingTask,
    winner
  };
};
