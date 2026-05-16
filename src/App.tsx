import { useEffect, useRef, useState } from 'react';
import Board from './components/Board';
import Dice from './components/Dice';
import SettingsPanel from './components/SettingsPanel';
import TaskEditor from './components/TaskEditor';
import TaskModal from './components/TaskModal';
import VictoryModal from './components/VictoryModal';
import { useLocalStorage } from './hooks/useLocalStorage';
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

const RULE_CARD_STORAGE_KEY = 'couple-flight-chess.rule-card';

const App = () => {
  const [tasks, setTasks] = useState<TasksMap>(() => normalizeTasks(loadTasks(getDefaultTasks())));
  const [gameState, setGameState] = useState<GameState>(() =>
    loadGameState(createInitialGameState(DEFAULT_SETTINGS))
  );
  const [isRolling, setIsRolling] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [taskEditorOpen, setTaskEditorOpen] = useState(false);
  const [showRuleCard, setShowRuleCard] = useLocalStorage<boolean>(RULE_CARD_STORAGE_KEY, true);
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
  const currentProgress = gameState.positions[gameState.currentPlayer];
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
    setShowRuleCard(true);
    setSettingsOpen(false);
    setTaskEditorOpen(false);
    setIsRolling(false);
  };

  return (
    <main className="app-shell">
      <section className="hero-card card">
        <div>
          <span className="hero-card__eyebrow">Couple Board Game</span>
          <h1>情侣飞行棋</h1>
          <p>一台手机就能开始的双人本地小游戏，任务和进度只保存在你的浏览器里。</p>
        </div>

        <div className="hero-actions">
          <button className="ghost-button" onClick={() => setSettingsOpen(true)}>
            设置
          </button>
          <button className="ghost-button" onClick={() => setTaskEditorOpen(true)}>
            任务编辑
          </button>
          <button className="secondary-button" onClick={() => restartGame()}>
            重新开始
          </button>
        </div>
      </section>

      {showRuleCard ? (
        <section className="info-card card">
          <div>
            <h2>游玩提示</h2>
            <p>
              玩家 A 先手。落到某格后会弹出该玩家对应任务；若开启“必须精确到达终点”，超过终点时会停留原地。
            </p>
          </div>
          <button className="ghost-button" onClick={() => setShowRuleCard(false)}>
            收起
          </button>
        </section>
      ) : null}

      <section className="status-grid">
        <article className="status-card card">
          <span className="status-card__label">当前回合</span>
          <strong>{currentPlayerName}</strong>
          <p>
            位置：第 {currentProgress} 格 / {gameState.settings.boardLength} 格
          </p>
        </article>

        <article className="status-card card">
          <span className="status-card__label">胜利规则</span>
          <strong>{gameState.settings.exactFinish ? '必须刚好到终点' : '到达或超过终点即胜利'}</strong>
          <p>{gameState.settings.exactFinish ? '超出终点会停留原地。' : '本局使用轻松模式。'}</p>
        </article>

        <article className="status-card card">
          <span className="status-card__label">双方进度</span>
          <strong>
            {gameState.settings.playerNames.A}：{gameState.positions.A} 格
          </strong>
          <p>
            {gameState.settings.playerNames.B}：{gameState.positions.B} 格
          </p>
        </article>
      </section>

      <Dice currentPlayerName={currentPlayerName} value={gameState.lastRoll} isRolling={isRolling} disabled={!canRoll} onRoll={handleRoll} />

      <Board
        settings={gameState.settings}
        positions={gameState.positions}
        currentPlayer={gameState.currentPlayer}
        lastMovedTo={gameState.lastMovedTo}
        tasks={tasks}
      />

      <footer className="privacy-note">
        所有自定义任务、设置和对局进度都只保存在当前浏览器的 localStorage 中，不会上传到任何服务器。
      </footer>

      <TaskModal
        open={Boolean(gameState.pendingTask)}
        pendingTask={gameState.pendingTask}
        playerName={gameState.pendingTask ? gameState.settings.playerNames[gameState.pendingTask.player] : ''}
        nextPlayerName={nextPlayerName}
        onConfirm={handleTaskComplete}
      />

      <VictoryModal open={Boolean(gameState.winner)} winnerName={winnerName} onRestart={() => restartGame(true)} />

      <SettingsPanel
        open={settingsOpen}
        settings={gameState.settings}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
        onRestart={() => restartGame()}
        onClearLocalData={handleClearLocalData}
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
