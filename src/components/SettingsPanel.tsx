import { useEffect, useState } from 'react';
import type { GameSettings, PlayerKey } from '../types/game';

interface SettingsPanelProps {
  open: boolean;
  settings: GameSettings;
  currentPlayerName: string;
  nextPlayerName: string;
  positions: Record<PlayerKey, number>;
  lastRoll: number | null;
  onClose: () => void;
  onSave: (settings: GameSettings) => void;
  onRestart: () => void;
  onClearLocalData: () => void;
  onOpenTaskEditor: () => void;
}

const SettingsPanel = ({
  open,
  settings,
  currentPlayerName,
  nextPlayerName,
  positions,
  lastRoll,
  onClose,
  onSave,
  onRestart,
  onClearLocalData,
  onOpenTaskEditor
}: SettingsPanelProps) => {
  const [draft, setDraft] = useState<GameSettings>(settings);

  useEffect(() => {
    if (open) {
      setDraft(settings);
    }
  }, [open, settings]);

  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="panel-card">
        <div className="section-heading">
          <div>
            <h2>游戏设置</h2>
            <p>这里集中放对局信息、玩法说明和所有设置入口。</p>
          </div>
          <button className="ghost-button" onClick={onClose}>
            关闭
          </button>
        </div>

        <section className="settings-section">
          <h3>当前对局</h3>
          <div className="settings-summary">
            <p>当前回合：{currentPlayerName}</p>
            <p>下一位：{nextPlayerName}</p>
            <p>最近点数：{lastRoll ?? '尚未掷出'}</p>
            <p>{settings.playerNames.A}：第 {positions.A} 格</p>
            <p>{settings.playerNames.B}：第 {positions.B} 格</p>
          </div>
        </section>

        <section className="settings-section">
          <h3>玩法说明</h3>
          <div className="settings-summary">
            <p>玩家 A 先手，点击中间的掷骰按钮后按点数前进。</p>
            <p>落到某格会弹出这一格对应的任务，完成后切换下一位。</p>
            <p>开启精确到达时，超过终点会停留原地，不触发新任务。</p>
            <p>所有任务、设置和进度都只保存在当前浏览器中。</p>
          </div>
        </section>

        <div className="settings-grid">
          <label className="field">
            <span>棋盘长度</span>
            <input
              type="number"
              min={20}
              max={60}
              value={draft.boardLength}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  boardLength: Number(event.target.value) || previous.boardLength
                }))
              }
            />
          </label>

          <label className="field">
            <span>玩家 A 名称</span>
            <input
              type="text"
              value={draft.playerNames.A}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  playerNames: {
                    ...previous.playerNames,
                    A: event.target.value
                  }
                }))
              }
            />
          </label>

          <label className="field">
            <span>玩家 B 名称</span>
            <input
              type="text"
              value={draft.playerNames.B}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  playerNames: {
                    ...previous.playerNames,
                    B: event.target.value
                  }
                }))
              }
            />
          </label>

          <label className="switch-field">
            <div>
              <strong>必须精确到达终点</strong>
              <p>开启后，超过终点会停留原地。</p>
            </div>
            <input
              type="checkbox"
              checked={draft.exactFinish}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  exactFinish: event.target.checked
                }))
              }
            />
          </label>
        </div>

        <div className="notice-card">修改棋盘长度后，会按新的长度重新开始当前对局。</div>

        <div className="panel-actions">
          <button className="ghost-button" onClick={onOpenTaskEditor}>
            打开任务编辑
          </button>
          <button className="secondary-button" onClick={onRestart}>
            重新开始本局
          </button>
          <button className="danger-button" onClick={onClearLocalData}>
            清空本地数据
          </button>
          <button className="primary-button" onClick={() => onSave(draft)}>
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
