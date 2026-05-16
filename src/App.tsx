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

const GUIDE_OPEN_STORAGE_KEY = 'couple-flight-chess.guide-open';

const App = () => {
  const [tasks, setTasks] = useState<TasksMap>(() => normalizeTasks(loadTasks(getDefaultTasks())));
  const [gameState, setGameState] = useState<GameState>(() =>
    loadGameState(createInitialGameState(DEFAULT_SETTINGS))
  );
  const [isRolling, setIsRolling] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [taskEditorOpen, setTaskEditorOpen] = useState(false);
  const [showGuide, setShowGuide] = useLocalStorage<boolean>(GUIDE_OPEN_STORAGE_KEY, false);
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

  const progressA = Math.min(100, (gameState.positions.A / gameState.settings.boardLength) * 100);
  const progressB = Math.min(100, (gameState.positions.B / gameState.settings.boardLength) * 100);

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
    setShowGuide(false);
    setSettingsOpen(false);
    setTaskEditorOpen(false);
    setIsRolling(false);
  };

  return (
    <main className="app-shell">
      <section className="topbar card">
        <div className="topbar__title">
          <span className="hero-card__eyebrow">Couple Board Game</span>
          <h1>情侣飞行棋</h1>
          <p>打开就是对局，任务、设置和进度都只保存在本地浏览器。</p>
        </div>

        <div className="topbar__status">
          <div className="turn-pill">
            <span>当前回合</span>
            <strong>{currentPlayerName}</strong>
          </div>
          <div className="topbar__actions">
            <button className="ghost-button" onClick={() => setShowGuide((previous) => !previous)}>
              {showGuide ? '收起玩法' : '玩法说明'}
            </button>
            <button className="ghost-button" onClick={() => setTaskEditorOpen(true)}>
              任务编辑
            </button>
            <button className="ghost-button" onClick={() => setSettingsOpen(true)}>
              设置
            </button>
            <button className="secondary-button" onClick={() => restartGame()}>
              重新开始
            </button>
          </div>
        </div>
      </section>

      {showGuide ? (
        <section className="guide-card card">
          <div className="guide-card__header">
            <h2>玩法说明</h2>
            <span className="section-badge">默认折叠</span>
          </div>
          <div className="guide-grid">
            <p>玩家 A 先手，点击“掷骰子”后按点数前进。</p>
            <p>落到某格会弹出该玩家对应任务，完成后轮到下一位。</p>
            <p>开启精确到达时，超过终点会停留原地，不触发新任务。</p>
            <p>任务内容、棋盘长度、玩家名称和进度都会自动保存在本地。</p>
          </div>
        </section>
      ) : null}

      <section className="dashboard-grid">
        <article className="race-card card">
          <div className="section-heading">
            <div>
              <h2>甜蜜赛况</h2>
              <p>谁先抵达第 {gameState.settings.boardLength} 格，谁就赢下这一局。</p>
            </div>
            <span className="section-badge">
              {gameState.settings.exactFinish ? '精确到达开启' : '轻松模式'}
            </span>
          </div>

          <div className="progress-list">
            <div className="progress-row">
              <div className="progress-row__label">
                <span className="token token--A">A</span>
                <strong>{gameState.settings.playerNames.A}</strong>
                <span>{gameState.positions.A} / {gameState.settings.boardLength}</span>
              </div>
              <div className="progress-track progress-track--A">
                <div className="progress-track__fill" style={{ width: `${progressA}%` }} />
              </div>
            </div>

            <div className="progress-row">
              <div className="progress-row__label">
                <span className="token token--B">B</span>
                <strong>{gameState.settings.playerNames.B}</strong>
                <span>{gameState.positions.B} / {gameState.settings.boardLength}</span>
              </div>
              <div className="progress-track progress-track--B">
                <div className="progress-track__fill" style={{ width: `${progressB}%` }} />
              </div>
            </div>
          </div>
        </article>

        <article className="summary-card card">
          <span className="status-card__label">对局状态</span>
          <strong>{currentPlayerName} 准备行动</strong>
          <p>下一位：{nextPlayerName}</p>
          <p>最近点数：{gameState.lastRoll ?? '尚未掷出'}</p>
          <p>{gameState.settings.showTaskPreview ? '棋盘任务预览已开启' : '棋盘任务预览已关闭'}</p>
        </article>
      </section>

      <Dice
        currentPlayerName={currentPlayerName}
        value={gameState.lastRoll}
        isRolling={isRolling}
        disabled={!canRoll}
        onRoll={handleRoll}
      />

      <Board
        settings={gameState.settings}
        positions={gameState.positions}
        currentPlayer={gameState.currentPlayer}
        lastMovedTo={gameState.lastMovedTo}
        tasks={tasks}
      />

      <footer className="privacy-note">
        所有内容只保存在当前浏览器的 localStorage 中，不会上传到任何服务器。
      </footer>

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
