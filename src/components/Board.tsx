import Cell from './Cell';
import type { GameSettings, PlayerKey, TasksMap } from '../types/game';
import { getTaskPreview } from '../utils/tasks';

interface BoardProps {
  settings: GameSettings;
  positions: Record<PlayerKey, number>;
  currentPlayer: PlayerKey;
  lastMovedTo: number | null;
  tasks: TasksMap;
}

interface BoardRow {
  rowIndex: number;
  cells: Array<number | null>;
}

const BOARD_COLUMNS = 5;

const buildRows = (boardLength: number): BoardRow[] => {
  const rows: BoardRow[] = [];
  const totalRows = Math.ceil(boardLength / BOARD_COLUMNS);

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex += 1) {
    const start = rowIndex * BOARD_COLUMNS + 1;
    const end = Math.min(start + BOARD_COLUMNS - 1, boardLength);
    const rowCells: number[] = [];

    for (let cell = start; cell <= end; cell += 1) {
      rowCells.push(cell);
    }

    const reverse = rowIndex % 2 === 1;
    const ordered = reverse ? [...rowCells].reverse() : rowCells;
    const filler = Array.from({ length: BOARD_COLUMNS - ordered.length }, () => null);
    const padded = reverse ? [...filler, ...ordered] : [...ordered, ...filler];

    rows.unshift({
      rowIndex,
      cells: padded
    });
  }

  return rows;
};

const Board = ({ settings, positions, currentPlayer, lastMovedTo, tasks }: BoardProps) => {
  const rows = buildRows(settings.boardLength);
  const startPlayers = (['A', 'B'] as PlayerKey[]).filter((player) => positions[player] === 0);

  return (
    <section className="board-shell card">
      <div className="section-heading">
        <div>
          <h2>甜蜜航线棋盘</h2>
          <p>{settings.boardLength} 格蛇形路线，终点会在最上方。</p>
        </div>
        <span className="section-badge">{settings.showTaskPreview ? '预览开启' : '预览关闭'}</span>
      </div>

      <div className="start-strip">
        <div>
          <strong>起点等待区</strong>
          <p>还没出发的棋子会停在这里。</p>
        </div>
        <div className="start-strip__tokens">
          {startPlayers.length > 0 ? (
            startPlayers.map((player) => (
              <span
                key={player}
                className={`token token--${player} ${currentPlayer === player ? 'token--active' : ''}`}
              >
                {player}
              </span>
            ))
          ) : (
            <span className="start-strip__empty">全部已出发</span>
          )}
        </div>
      </div>

      <div className="board-grid" style={{ gridTemplateColumns: `repeat(${BOARD_COLUMNS}, minmax(0, 1fr))` }}>
        {rows.map((row) =>
          row.cells.map((cell, index) =>
            cell ? (
              <Cell
                key={`${row.rowIndex}-${cell}`}
                cellNumber={cell}
                occupants={(['A', 'B'] as PlayerKey[]).filter((player) => positions[player] === cell)}
                isCurrentTurnCell={positions[currentPlayer] === cell}
                isLastMoved={lastMovedTo === cell}
                showTaskPreview={settings.showTaskPreview}
                previewA={getTaskPreview(tasks[cell]?.A ?? '')}
                previewB={getTaskPreview(tasks[cell]?.B ?? '')}
              />
            ) : (
              <div key={`${row.rowIndex}-empty-${index}`} className="board-cell board-cell--empty" aria-hidden="true" />
            )
          )
        )}
      </div>

      <div className="board-footer">
        <span>起点：第 0 格</span>
        <span>终点：第 {settings.boardLength} 格</span>
      </div>
    </section>
  );
};

export default Board;
