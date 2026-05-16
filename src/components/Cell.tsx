import type { PlayerKey } from '../types/game';

interface CellProps {
  cellNumber: number;
  occupants: PlayerKey[];
  isCurrentTurnCell: boolean;
  isLastMoved: boolean;
  showTaskPreview: boolean;
  previewA: string;
  previewB: string;
}

const Cell = ({
  cellNumber,
  occupants,
  isCurrentTurnCell,
  isLastMoved,
  showTaskPreview,
  previewA,
  previewB
}: CellProps) => (
  <article
    className={[
      'board-cell',
      isCurrentTurnCell ? 'board-cell--current' : '',
      isLastMoved ? 'board-cell--last' : ''
    ]
      .filter(Boolean)
      .join(' ')}
  >
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

    {showTaskPreview ? (
      <div className="board-cell__preview">
        <span>A：{previewA}</span>
        <span>B：{previewB}</span>
      </div>
    ) : (
      <div className="board-cell__preview board-cell__preview--hidden">任务将在落点时显示</div>
    )}
  </article>
);

export default Cell;
