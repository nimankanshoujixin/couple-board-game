import { useEffect, useRef, useState } from 'react';
import Board from './components/Board';
import Dice from './components/Dice';
import SettingsPanel from './components/SettingsPanel';
import TaskEditor from './components/TaskEditor';
import TaskModal from './components/TaskModal';
import VictoryModal from './components/VictoryModal';
import type { GameSettings, GameState, PendingTask, TasksMap } from './types/game';
import {
  checkWinner,
  createInitialGameState,
  DEFAULT_SETTINGS,
  getNextPlayer,
  movePlayer,
  rollDice,
  sanitizeSettings
} from './utils/game';
import { clearLocalData, loadGameState, loadTasks, saveGameState, saveTasks } from './utils/storage';
import { getDefaultTasks, getTaskForCell, normalizeTasks } from './utils/tasks';

const App = () => {
  const [tasks, setTasks] = useState<TasksMap>(() => normalizeTasks(loadTasks(getDefaultTasks())));
  const [gameState, setGameState] = useState<GameState>(() =>
    loadGameState(createInitialGameState(DEFAULT_SETTINGS))
  );
  const [isRolling, setIsRolling] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [taskEditorOpen, setTaskEditorOpen] = useState(false);
  const rollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  useEffect(() => {
    return () => {
      if (rollTimerRef.current) {
        window.clearTimeout(rollTimerRef.current);
      }
    };
  }, []);

  const currentPlayerName = gameState.settings.playerNames[gameState.currentPlayer];
  const nextPlayerName = gameState.settings.playerNames[getNextPlayer(gameState.currentPlayer)];
  const winnerName = gameState.winner ? gameState.settings.playerNames[gameState.winner] : '';
  const canRoll = !isRolling && !gameState.pendingTask && !gameState.winner;

  const restartGame = (skipConfirm = false) => {
    if (!skipConfirm && !window.confirm('确定重新开始当前对局吗？当前进度会被重置。')) {
      return;
    }

    setGameState((previous) => createInitialGameState(previous.settings));
    setIsRolling(false);
  };

  const handleRoll = () => {
    if (!canRoll) {
      return;
    }

    const rolled = rollDice();
    setIsRolling(true);

    rollTimerRef.current = window.setTimeout(() => {
      setGameState((previous) => {
        const currentPlayer = previous.currentPlayer;
        const currentPosition = previous.positions[currentPlayer];
        const result = movePlayer(
          currentPosition,
          rolled,
          previous.settings.boardLength,
          previous.settings.exactFinish
        );
        const nextPosition = result.position;
        const winnerAfterCompletion =
          result.moved && checkWinner(nextPosition, previous.settings.boardLength);
        const pendingTask: PendingTask = {
          player: currentPlayer,
          cell: nextPosition,
          task: result.moved ? getTaskForCell(tasks, nextPosition, currentPlayer) : '',
          moved: result.moved,
          note: result.note,
          winnerAfterCompletion,
          roll: rolled
        };

        return {
          ...previous,
          positions: {
            ...previous.positions,
            [currentPlayer]: nextPosition
          },
          lastRoll: rolled,
          lastMovedPlayer: currentPlayer,
          lastMovedTo: nextPosition,
          pendingTask
        };
      });

      setIsRolling(false);
    }, 780);
  };

  const handleTaskComplete = () => {
    setGameState((previous) => {
      if (!previous.pendingTask) {
        return previous;
      }

      if (previous.pendingTask.winnerAfterCompletion) {
        return {
          ...previous,
          pendingTask: null,
          winner: previous.pendingTask.player
        };
      }

      return {
        ...previous,
        currentPlayer: getNextPlayer(previous.currentPlayer),
        pendingTask: null
      };
    });
  };

  const handleSaveSettings = (settings: GameSettings) => {
    const nextSettings = sanitizeSettings(settings);

    setGameState((previous) => {
      if (nextSettings.boardLength !== previous.settings.boardLength) {
        return createInitialGameState(nextSettings);
      }

      return {
        ...previous,
        settings: nextSettings
      };
    });

    setSettingsOpen(false);
  };

  const handleClearLocalData = () => {
    if (!window.confirm('确定清空所有本地数据吗？这会移除任务、设置和游戏进度。')) {
      return;
    }

    if (!window.confirm('清空后无法恢复，是否继续？')) {
      return;
    }

    clearLocalData();
    setTasks(getDefaultTasks());
    setGameState(createInitialGameState(DEFAULT_SETTINGS));
    setSettingsOpen(false);
    setTaskEditorOpen(false);
    setIsRolling(false);
  };

  return (
    <main className="app-shell app-shell--minimal">
      <button className="settings-fab" onClick={() => setSettingsOpen(true)} aria-label="打开设置">
        ⚙
      </button>

      <Board
        settings={gameState.settings}
        positions={gameState.positions}
        currentPlayer={gameState.currentPlayer}
        lastMovedTo={gameState.lastMovedTo}
        centerContent={
          <Dice
            currentPlayerName={currentPlayerName}
            playerAName={gameState.settings.playerNames.A}
            playerBName={gameState.settings.playerNames.B}
            playerAPosition={gameState.positions.A}
            playerBPosition={gameState.positions.B}
            value={gameState.lastRoll}
            isRolling={isRolling}
            disabled={!canRoll}
            onRoll={handleRoll}
          />
        }
      />

      <TaskModal
        open={Boolean(gameState.pendingTask)}
        pendingTask={gameState.pendingTask}
        playerName={gameState.pendingTask ? gameState.settings.playerNames[gameState.pendingTask.player] : ''}
        nextPlayerName={nextPlayerName}
        onConfirm={handleTaskComplete}
      />

      <VictoryModal
        open={Boolean(gameState.winner)}
        winnerName={winnerName}
        onRestart={() => restartGame(true)}
      />

      <SettingsPanel
        open={settingsOpen}
        settings={gameState.settings}
        currentPlayerName={currentPlayerName}
        nextPlayerName={nextPlayerName}
        positions={gameState.positions}
        lastRoll={gameState.lastRoll}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
        onRestart={() => restartGame()}
        onClearLocalData={handleClearLocalData}
        onOpenTaskEditor={() => {
          setSettingsOpen(false);
          setTaskEditorOpen(true);
        }}
      />

      <TaskEditor
        open={taskEditorOpen}
        boardLength={gameState.settings.boardLength}
        tasks={tasks}
        onClose={() => setTaskEditorOpen(false)}
        onSave={(nextTasks) => {
          setTasks(normalizeTasks(nextTasks));
          setTaskEditorOpen(false);
        }}
      />
    </main>
  );
};

export default App;
