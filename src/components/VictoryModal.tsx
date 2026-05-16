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
        <div className="victory-badge">顺利抵达终点</div>
        <h3>{winnerName} 赢啦</h3>
        <p>这一局的甜蜜航线已经完成，准备开启下一次小旅行吧。</p>
        <button className="primary-button" onClick={onRestart}>
          再玩一局
        </button>
      </div>
    </div>
  );
};

export default VictoryModal;
