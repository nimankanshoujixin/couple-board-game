import { useEffect, useState } from 'react';
import type { TasksMap } from '../types/game';
import { exportTasks, getDefaultTasks, importTasks } from '../utils/tasks';

interface TaskEditorProps {
  open: boolean;
  boardLength: number;
  tasks: TasksMap;
  onClose: () => void;
  onSave: (tasks: TasksMap) => void;
}

const TaskEditor = ({ open, boardLength, tasks, onClose, onSave }: TaskEditorProps) => {
  const [draft, setDraft] = useState<TasksMap>(tasks);
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setDraft(tasks);
      setImportText('');
      setMessage('');
      setError('');
    }
  }, [open, tasks]);

  if (!open) {
    return null;
  }

  const updateTask = (cell: number, player: 'A' | 'B', value: string) => {
    setDraft((previous) => ({
      ...previous,
      [cell]: {
        ...previous[cell],
        [player]: value
      }
    }));
  };

  const handleImportResult = (jsonText: string) => {
    const result = importTasks(jsonText);

    if (!result.ok) {
      setError(result.error);
      setMessage('');
      return;
    }

    setDraft(result.tasks);
    setError('');
    setMessage('任务 JSON 已载入编辑器，记得点击“保存任务”。');
  };

  const handleFileImport = async (file: File | null) => {
    if (!file) {
      return;
    }

    const text = await file.text();
    setImportText(text);
    handleImportResult(text);
  };

  const handleExport = () => {
    const blob = new Blob([exportTasks(draft)], { type: 'application/json;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'couple-board-game-tasks.json';
    anchor.click();
    window.URL.revokeObjectURL(url);
    setMessage('任务 JSON 已导出。');
    setError('');
  };

  return (
    <div className="modal-overlay">
      <div className="panel-card panel-card--wide">
        <div className="section-heading">
          <div>
            <h2>任务编辑器</h2>
            <p>当前展示第 1 到第 {boardLength} 格，可分别编辑 A 与 B 的任务内容。</p>
          </div>
          <button className="ghost-button" onClick={onClose}>
            关闭
          </button>
        </div>

        <div className="editor-toolbar">
          <button className="secondary-button" onClick={handleExport}>
            导出任务 JSON
          </button>
          <label className="secondary-button editor-file-button">
            导入任务文件
            <input
              type="file"
              accept="application/json,.json"
              onChange={(event) => void handleFileImport(event.target.files?.[0] ?? null)}
            />
          </label>
          <button
            className="ghost-button"
            onClick={() => {
              setDraft(getDefaultTasks());
              setMessage('默认任务已恢复到编辑器，记得保存。');
              setError('');
            }}
          >
            恢复默认任务
          </button>
        </div>

        <label className="field">
          <span>粘贴任务 JSON</span>
          <textarea
            rows={6}
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder='支持 {"tasks":{"1":{"A":"...","B":"..."}}}，也支持直接以格子对象为根节点。'
          />
        </label>

        <div className="editor-toolbar">
          <button className="secondary-button" onClick={() => handleImportResult(importText)}>
            导入粘贴内容
          </button>
          {message ? <span className="feedback feedback--success">{message}</span> : null}
          {error ? <span className="feedback feedback--error">{error}</span> : null}
        </div>

        <div className="task-editor-grid">
          {Array.from({ length: boardLength }, (_, index) => index + 1).map((cell) => (
            <article key={cell} className="task-editor-card">
              <header>
                <strong>第 {cell} 格</strong>
              </header>
              <label className="field">
                <span>玩家 A</span>
                <textarea
                  rows={3}
                  value={draft[cell]?.A ?? ''}
                  onChange={(event) => updateTask(cell, 'A', event.target.value)}
                  placeholder="这一格暂无任务"
                />
              </label>
              <label className="field">
                <span>玩家 B</span>
                <textarea
                  rows={3}
                  value={draft[cell]?.B ?? ''}
                  onChange={(event) => updateTask(cell, 'B', event.target.value)}
                  placeholder="这一格暂无任务"
                />
              </label>
            </article>
          ))}
        </div>

        <div className="panel-actions">
          <button className="ghost-button" onClick={onClose}>
            稍后再说
          </button>
          <button
            className="primary-button"
            onClick={() => {
              onSave(draft);
              setMessage('');
              setError('');
            }}
          >
            保存任务
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditor;
