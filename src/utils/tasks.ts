import defaultTasksData from '../data/defaultTasks.json';
import type { CellTask, ExportedTasksPayload, PlayerKey, TasksMap } from '../types/game';

export const MIN_BOARD_LENGTH = 20;
export const MAX_BOARD_LENGTH = 60;
export const DEFAULT_BOARD_LENGTH = 50;

const EMPTY_CELL_TASK: CellTask = { A: '', B: '' };

const normalizeTaskValue = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  return value;
};

export const createEmptyTasksMap = (length = MAX_BOARD_LENGTH): TasksMap => {
  const tasks = {} as TasksMap;

  for (let cell = 1; cell <= length; cell += 1) {
    tasks[cell] = { ...EMPTY_CELL_TASK };
  }

  return tasks;
};

export const normalizeTasks = (input: unknown, length = MAX_BOARD_LENGTH): TasksMap => {
  const normalized = createEmptyTasksMap(length);

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return normalized;
  }

  Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
    const cell = Number(key);

    if (!Number.isInteger(cell) || cell < 1 || cell > length) {
      return;
    }

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return;
    }

    const typedValue = value as Partial<CellTask>;

    normalized[cell] = {
      A: normalizeTaskValue(typedValue.A),
      B: normalizeTaskValue(typedValue.B)
    };
  });

  return normalized;
};

export const getDefaultTasks = (): TasksMap =>
  normalizeTasks((defaultTasksData as { tasks?: Record<string, CellTask> }).tasks);

export const getTaskForCell = (tasks: TasksMap, cell: number, player: PlayerKey): string =>
  tasks[cell]?.[player]?.trim() ?? '';

export const getTaskPreview = (task: string, maxLength = 18): string => {
  const content = task.trim();

  if (!content) {
    return '暂无任务';
  }

  if (content.length <= maxLength) {
    return content;
  }

  return `${content.slice(0, maxLength)}…`;
};

export const exportTasks = (tasks: TasksMap): string => {
  const payload: ExportedTasksPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks: Object.fromEntries(
      Object.entries(tasks).map(([cell, value]) => [
        cell,
        {
          A: normalizeTaskValue(value.A),
          B: normalizeTaskValue(value.B)
        }
      ])
    )
  };

  return JSON.stringify(payload, null, 2);
};

export const importTasks = (
  jsonText: string
): { ok: true; tasks: TasksMap } | { ok: false; error: string } => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? `JSON 解析失败：${error.message}` : 'JSON 解析失败。'
    };
  }

  const source =
    parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'tasks' in parsed
      ? (parsed as { tasks?: unknown }).tasks
      : parsed;

  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return {
      ok: false,
      error: '任务 JSON 格式不正确，应为对象，或包含 tasks 字段。'
    };
  }

  const entries = Object.entries(source as Record<string, unknown>);

  for (const [cell, value] of entries) {
    const cellNumber = Number(cell);

    if (!Number.isInteger(cellNumber) || cellNumber < 1 || cellNumber > MAX_BOARD_LENGTH) {
      return {
        ok: false,
        error: `任务格子 ${cell} 无效，只允许 1 到 ${MAX_BOARD_LENGTH}。`
      };
    }

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {
        ok: false,
        error: `第 ${cell} 格任务格式不正确，必须包含 A 和 B 文本字段。`
      };
    }
  }

  return {
    ok: true,
    tasks: normalizeTasks(source)
  };
};
