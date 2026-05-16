export type PlayerKey = 'A' | 'B';

export interface PlayerNames {
  A: string;
  B: string;
}

export interface GameSettings {
  boardLength: number;
  playerNames: PlayerNames;
  exactFinish: boolean;
  showTaskPreview: boolean;
  overshootRule: 'stay';
}

export interface CellTask {
  A: string;
  B: string;
}

export type TasksMap = Record<number, CellTask>;

export interface PendingTask {
  player: PlayerKey;
  cell: number;
  task: string;
  moved: boolean;
  note?: string;
  winnerAfterCompletion: boolean;
  roll: number;
}

export interface GameState {
  settings: GameSettings;
  positions: Record<PlayerKey, number>;
  currentPlayer: PlayerKey;
  lastRoll: number | null;
  lastMovedPlayer: PlayerKey | null;
  lastMovedTo: number | null;
  pendingTask: PendingTask | null;
  winner: PlayerKey | null;
}

export interface MoveResult {
  position: number;
  moved: boolean;
  overshot: boolean;
  note?: string;
}

export interface ExportedTasksPayload {
  version: number;
  exportedAt: string;
  tasks: Record<string, CellTask>;
}
