interface VictoryModalProps {
  open: boolean;
  winnerName: string;
  onRestart: () => void;
}

const VictoryModal = ({ open, winnerName, onRestart }: VictoryModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-card--victory">
        <div className="victory-badge">胜利抵达</div>
        <h3>{winnerName} 赢啦</h3>
        <p>恭喜率先抵达终点，新的甜蜜任务之旅可以继续开始。</p>
        <button className="primary-button" onClick={onRestart}>
          再玩一局
        </button>
      </div>
    </div>
  );
};

export default VictoryModal;
