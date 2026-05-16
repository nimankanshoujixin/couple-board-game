interface DiceProps {
  currentPlayerName: string;
  playerAName: string;
  playerBName: string;
  playerAPosition: number;
  playerBPosition: number;
  value: number | null;
  isRolling: boolean;
  disabled: boolean;
  onRoll: () => void;
}

const Dice = ({
  currentPlayerName,
  playerAName,
  playerBName,
  playerAPosition,
  playerBPosition,
  value,
  isRolling,
  disabled,
  onRoll
}: DiceProps) => (
  <div className="dice-hub">
    <div className="dice-hub__label">轮到 {currentPlayerName}</div>
    <div className={`dice-orb ${isRolling ? 'dice-orb--rolling' : ''}`}>{value ?? '?'}</div>
    <button
      className={`primary-button dice-hub__button ${isRolling ? 'dice-hub__button--rolling' : ''}`}
      onClick={onRoll}
      disabled={disabled}
    >
      {isRolling ? '掷骰中...' : '掷骰子'}
    </button>
    <div className="dice-hub__progress">
      <span>{playerAName}：{playerAPosition}</span>
      <span>{playerBName}：{playerBPosition}</span>
    </div>
  </div>
);

export default Dice;
