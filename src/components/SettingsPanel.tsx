import { useEffect, useState } from 'react';
import type { GameSettings } from '../types/game';

interface SettingsPanelProps {
  open: boolean;
  settings: GameSettings;
  onClose: () => void;
  onSave: (settings: GameSettings) => void;
  onRestart: () => void;
  onClearLocalData: () => void;
}

const SettingsPanel = ({
  open,
  settings,
  onClose,
  onSave,
  onRestart,
  onClearLocalData
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
            <p>修改后会保存在当前浏览器中，刷新页面也能继续接着玩。</p>
          </div>
          <button className="ghost-button" onClick={onClose}>
            关闭
          </button>
        </div>

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
              <p>开启后，超过终点会停留原地，本回合不会触发新的格子任务。</p>
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

          <label className="switch-field">
            <div>
              <strong>显示任务预览</strong>
              <p>开启后，棋盘上会显示每一格的简短任务摘要。</p>
            </div>
            <input
              type="checkbox"
              checked={draft.showTaskPreview}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  showTaskPreview: event.target.checked
                }))
              }
            />
          </label>
        </div>

        <div className="notice-card">
          修改棋盘长度后，会按新的长度重新开始当前对局；任务编辑内容会继续保留。
        </div>

        <div className="panel-actions">
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
