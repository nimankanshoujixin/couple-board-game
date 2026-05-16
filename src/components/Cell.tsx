import type { CSSProperties } from 'react';
import type { PlayerKey } from '../types/game';

interface CellProps {
  cellNumber: number;
  occupants: PlayerKey[];
  isCurrentTurnCell: boolean;
  isLastMoved: boolean;
  isFinish: boolean;
  style: CSSProperties;
}

const Cell = ({ cellNumber, occupants, isCurrentTurnCell, isLastMoved, isFinish, style }: CellProps) => (
  <article
    className={[
      'board-cell',
      isCurrentTurnCell ? 'board-cell--current' : '',
      isLastMoved ? 'board-cell--last' : '',
      isFinish ? 'board-cell--finish' : ''
    ]
      .filter(Boolean)
      .join(' ')}
    style={style}
  >
    <span className="board-cell__index">{cellNumber}</span>
    {occupants.length > 0 ? (
      <div className="board-cell__tokens">
        {occupants.map((player) => (
          <span key={player} className={`token token--mini token--${player}`}>
            {player}
          </span>
        ))}
      </div>
    ) : null}
  </article>
);

export default Cell;
