interface DiceProps {
  currentPlayerName: string;
  value: number | null;
  isRolling: boolean;
  disabled: boolean;
  onRoll: () => void;
}

const Dice = ({ currentPlayerName, value, isRolling, disabled, onRoll }: DiceProps) => (
  <section className="dice-card card">
    <div className="section-heading">
      <div>
        <h2>掷骰子</h2>
        <p>轮到 {currentPlayerName} 行动，点击按钮前进 1 到 6 格。</p>
      </div>
    </div>

    <div className="dice-panel">
      <div className={`dice-face ${isRolling ? 'dice-face--rolling' : ''}`}>{value ?? '?'}</div>
      <button className={`primary-button dice-button ${isRolling ? 'dice-button--rolling' : ''}`} onClick={onRoll} disabled={disabled}>
        {isRolling ? '骰子旋转中...' : '掷骰子'}
      </button>
    </div>
  </section>
);

export default Dice;
