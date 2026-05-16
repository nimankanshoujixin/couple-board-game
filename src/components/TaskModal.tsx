import type { PendingTask } from '../types/game';

interface TaskModalProps {
  open: boolean;
  pendingTask: PendingTask | null;
  playerName: string;
  nextPlayerName: string;
  onConfirm: () => void;
}

const TaskModal = ({ open, pendingTask, playerName, nextPlayerName, onConfirm }: TaskModalProps) => {
  if (!open || !pendingTask) {
    return null;
  }

  const hasTask = pendingTask.task.trim().length > 0;

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-card--task">
        <div className="modal-card__tag">{playerName} 的回合</div>
        <h3>{pendingTask.moved ? `第 ${pendingTask.cell} 格任务` : '本回合结果'}</h3>
        <p className="modal-card__subtle">本次点数：{pendingTask.roll}</p>

        {pendingTask.note ? <div className="modal-note">{pendingTask.note}</div> : null}

        <div className="task-content">
          {pendingTask.moved ? (
            hasTask ? (
              <p>{pendingTask.task}</p>
            ) : (
              <p>这一格暂无任务。</p>
            )
          ) : (
            <p>本回合没有前进，也不会触发新的任务。</p>
          )}
        </div>

        <button className="primary-button" onClick={onConfirm}>
          {pendingTask.winnerAfterCompletion ? '完成并查看胜利结果' : `已完成，切换给 ${nextPlayerName}`}
        </button>
      </div>
    </div>
  );
};

export default TaskModal;
