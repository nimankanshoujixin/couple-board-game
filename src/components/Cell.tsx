import type { PlayerKey } from '../types/game';

interface CellProps {
  cellNumber: number;
  occupants: PlayerKey[];
  isCurrentTurnCell: boolean;
  isLastMoved: boolean;
  showTaskPreview: boolean;
  previewA: string;
  previewB: string;
  isFinish: boolean;
}

const Cell = ({
  cellNumber,
  occupants,
  isCurrentTurnCell,
  isLastMoved,
  showTaskPreview,
  previewA,
  previewB,
  isFinish
}: CellProps) => (
  <article
    className={[
      'board-cell',
      occupants.length > 0 ? 'board-cell--occupied' : '',
      isCurrentTurnCell ? 'board-cell--current' : '',
      isLastMoved ? 'board-cell--last' : '',
      isFinish ? 'board-cell--finish' : ''
    ]
      .filter(Boolean)
      .join(' ')}
  >
    <div className="board-cell__glow" aria-hidden="true" />

    <div className="board-cell__header">
      <span className="board-cell__index">#{cellNumber}</span>
      <div className="board-cell__tokens">
        {occupants.map((player) => (
          <span key={player} className={`token token--${player}`}>
            {player}
          </span>
        ))}
      </div>
    </div>

    <div className="board-cell__body">
      {showTaskPreview ? (
        <div className="board-cell__preview">
          <span>A · {previewA}</span>
          <span>B · {previewB}</span>
        </div>
      ) : (
        <div className="board-cell__preview board-cell__preview--hidden">落到这里时再揭晓任务</div>
      )}
    </div>
  </article>
);

export default Cell;
