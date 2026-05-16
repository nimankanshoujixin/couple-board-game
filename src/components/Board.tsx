import type { CSSProperties, ReactNode } from 'react';
import Cell from './Cell';
import type { GameSettings, PlayerKey } from '../types/game';

interface BoardProps {
  settings: GameSettings;
  positions: Record<PlayerKey, number>;
  currentPlayer: PlayerKey;
  lastMovedTo: number | null;
  centerContent: ReactNode;
}

const getCellPosition = (index: number, total: number) => {
  const angle = Math.PI / 2 - (index / total) * Math.PI * 2;
  const radiusX = 40;
  const radiusY = 35;

  return {
    left: `${50 + Math.cos(angle) * radiusX}%`,
    top: `${50 + Math.sin(angle) * radiusY}%`
  };
};

const getCellSize = (boardLength: number): number => {
  if (boardLength <= 24) {
    return 58;
  }

  if (boardLength <= 36) {
    return 50;
  }

  if (boardLength <= 48) {
    return 42;
  }

  return 36;
};

const Board = ({ settings, positions, currentPlayer, lastMovedTo, centerContent }: BoardProps) => {
  const cellSize = getCellSize(settings.boardLength);
  const boardStyle = {
    '--cell-size': `${cellSize}px`
  } as CSSProperties;

  return (
    <section className="board-shell card">
      <div className="board-stage" style={boardStyle}>
        <div className="board-stage__orbit board-stage__orbit--outer" aria-hidden="true" />
        <div className="board-stage__orbit board-stage__orbit--inner" aria-hidden="true" />

        {Array.from({ length: settings.boardLength }, (_, index) => {
          const cellNumber = index + 1;
          const position = getCellPosition(index, settings.boardLength);

          return (
            <Cell
              key={cellNumber}
              cellNumber={cellNumber}
              occupants={(['A', 'B'] as PlayerKey[]).filter((player) => positions[player] === cellNumber)}
              isCurrentTurnCell={positions[currentPlayer] === cellNumber}
              isLastMoved={lastMovedTo === cellNumber}
              isFinish={cellNumber === settings.boardLength}
              style={position}
            />
          );
        })}

        <div className="board-center">{centerContent}</div>
      </div>
    </section>
  );
};

export default Board;
