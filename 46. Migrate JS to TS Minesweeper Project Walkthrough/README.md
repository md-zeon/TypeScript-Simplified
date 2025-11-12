# Migrate JavaScript to TypeScript: Minesweeper Project Walkthrough

This walkthrough demonstrates a complete migration of a JavaScript Minesweeper game to TypeScript. We'll follow a systematic approach, converting files gradually while maintaining functionality and adding type safety throughout the process.

## Phase 1: Original JavaScript Codebase

### 1. Initial JavaScript Implementation

```javascript
// src/js/game.js
class Game {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.board = [];
    this.status = 'ready'; // 'ready', 'playing', 'won', 'lost'
    this.mines = 0;
    this.flags = 0;
    this.startTime = null;
    this.endTime = null;
  }

  initialize() {
    const config = this.getDifficultyConfig();
    this.board = this.createBoard(config.width, config.height);
    this.mines = config.mines;
    this.placeMines();
    this.calculateNeighbors();
    this.status = 'ready';
  }

  getDifficultyConfig() {
    const configs = {
      easy: { width: 9, height: 9, mines: 10 },
      medium: { width: 16, height: 16, mines: 40 },
      hard: { width: 30, height: 16, mines: 99 }
    };
    return configs[this.difficulty] || configs.medium;
  }

  createBoard(width, height) {
    const board = [];
    for (let y = 0; y < height; y++) {
      board[y] = [];
      for (let x = 0; x < width; x++) {
        board[y][x] = {
          x,
          y,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0
        };
      }
    }
    return board;
  }

  placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < this.mines) {
      const x = Math.floor(Math.random() * this.board[0].length);
      const y = Math.floor(Math.random() * this.board.length);
      
      if (!this.board[y][x].isMine) {
        this.board[y][x].isMine = true;
        minesPlaced++;
      }
    }
  }

  calculateNeighbors() {
    for (let y = 0; y < this.board.length; y++) {
      for (let x = 0; x < this.board[y].length; x++) {
        if (!this.board[y][x].isMine) {
          this.board[y][x].neighborMines = this.countNeighborMines(x, y);
        }
      }
    }
  }

  countNeighborMines(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < this.board[0].length && 
            ny >= 0 && ny < this.board.length &&
            this.board[ny][nx].isMine) {
          count++;
        }
      }
    }
    return count;
  }

  reveal(x, y) {
    if (this.status === 'ready') {
      this.startTime = Date.now();
      this.status = 'playing';
    }

    if (x < 0 || x >= this.board[0].length || 
        y < 0 || y >= this.board.length ||
        this.board[y][x].isRevealed || 
        this.board[y][x].isFlagged) {
      return;
    }

    this.board[y][x].isRevealed = true;

    if (this.board[y][x].isMine) {
      this.status = 'lost';
      this.endTime = Date.now();
      this.revealAllMines();
      return;
    }

    if (this.board[y][x].neighborMines === 0) {
      this.revealNeighbors(x, y);
    }

    this.checkWinCondition();
  }

  revealNeighbors(x, y) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < this.board[0].length && 
            ny >= 0 && ny < this.board.length) {
          this.reveal(nx, ny);
        }
      }
    }
  }

  toggleFlag(x, y) {
    const cell = this.board[y][x];
    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    this.flags += cell.isFlagged ? 1 : -1;
  }

  checkWinCondition() {
    const totalCells = this.board.length * this.board[0].length;
    const revealedCells = this.board.flat().filter(cell => cell.isRevealed).length;
    
    if (totalCells - revealedCells === this.mines) {
      this.status = 'won';
      this.endTime = Date.now();
    }
  }

  revealAllMines() {
    this.board.flat().forEach(cell => {
      if (cell.isMine) {
        cell.isRevealed = true;
      }
    });
  }

  getDuration() {
    if (!this.startTime) return 0;
    const endTime = this.endTime || Date.now();
    return Math.floor((endTime - this.startTime) / 1000);
  }
}

export default Game;
```

```javascript
// src/js/ui.js
class UI {
  constructor(game, container) {
    this.game = game;
    this.container = container;
    this.timerInterval = null;
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    this.container.addEventListener('click', (e) => {
      const cell = e.target.closest('.cell');
      if (!cell) return;

      const x = parseInt(cell.dataset.x);
      const y = parseInt(cell.dataset.y);
      this.game.reveal(x, y);
      this.render();
    });

    this.container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const cell = e.target.closest('.cell');
      if (!cell) return;

      const x = parseInt(cell.dataset.x);
      const y = parseInt(cell.dataset.y);
      this.game.toggleFlag(x, y);
      this.render();
    });
  }

  render() {
    this.container.innerHTML = '';
    
    // Render header
    const header = this.createHeader();
    this.container.appendChild(header);
    
    // Render board
    const board = this.createBoard();
    this.container.appendChild(board);
    
    // Update timer
    this.updateTimer();
  }

  createHeader() {
    const header = document.createElement('div');
    header.className = 'game-header';
    
    const status = document.createElement('div');
    status.className = 'game-status';
    status.textContent = `Status: ${this.game.status}`;
    
    const mines = document.createElement('div');
    mines.className = 'mine-count';
    mines.textContent = `Mines: ${this.game.mines - this.game.flags}`;
    
    const timer = document.createElement('div');
    timer.className = 'timer';
    timer.textContent = `Time: ${this.game.getDuration()}s`;
    
    header.appendChild(status);
    header.appendChild(mines);
    header.appendChild(timer);
    
    return header;
  }

  createBoard() {
    const board = document.createElement('div');
    board.className = 'game-board';
    
    this.game.board.forEach((row, y) => {
      const rowElement = document.createElement('div');
      rowElement.className = 'board-row';
      
      row.forEach((cell, x) => {
        const cellElement = document.createElement('div');
        cellElement.className = 'cell';
        cellElement.dataset.x = x;
        cellElement.dataset.y = y;
        
        if (cell.isRevealed) {
          cellElement.classList.add('revealed');
          if (cell.isMine) {
            cellElement.classList.add('mine');
            cellElement.textContent = '💣';
          } else if (cell.neighborMines > 0) {
            cellElement.textContent = cell.neighborMines;
            cellElement.classList.add(`neighbors-${cell.neighborMines}`);
          }
        } else if (cell.isFlagged) {
          cellElement.classList.add('flagged');
          cellElement.textContent = '🚩';
        }
        
        rowElement.appendChild(cellElement);
      });
      
      board.appendChild(rowElement);
    });
    
    return board;
  }

  updateTimer() {
    if (this.game.status === 'playing') {
      if (!this.timerInterval) {
        this.timerInterval = setInterval(() => {
          const timer = this.container.querySelector('.timer');
          if (timer) {
            timer.textContent = `Time: ${this.game.getDuration()}s`;
          }
        }, 1000);
      }
    } else {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }
  }
}

export default UI;
```

## Phase 2: TypeScript Setup

### 1. Install TypeScript

```bash
npm install -D typescript @types/node
```

### 2. Create TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "ESNext",
    "lib": ["ES2018", "DOM"],
    "allowJs": true,
    "checkJs": false,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": false,
    "noImplicitAny": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### 3. Update Build Scripts

```json
// package.json
{
  "scripts": {
    "build": "tsc && webpack",
    "dev": "webpack serve",
    "type-check": "tsc --noEmit",
    "migrate": "tsc --allowJs --checkJs --noEmit"
  }
}
```

## Phase 3: Core Type Definitions

### 1. Define Game Types

```typescript
// src/ts/types/game.ts
export type Difficulty = "easy" | "medium" | "hard";

export type GameStatus = "ready" | "playing" | "won" | "lost";

export interface DifficultyConfig {
  width: number;
  height: number;
  mines: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface GameStats {
  duration: number;
  moves: number;
  flagsUsed: number;
  minesRemaining: number;
}
```

### 2. Define Board Types

```typescript
// src/ts/types/board.ts
import { Position } from './game';

export interface Cell {
  readonly x: number;
  readonly y: number;
  readonly isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export type Board = Cell[][];

export interface BoardConfig {
  width: number;
  height: number;
  mines: number;
}

export interface NeighborInfo {
  position: Position;
  cell: Cell;
}
```

### 3. Define UI Types

```typescript
// src/ts/types/ui.ts
export interface UIEvents {
  onCellClick: (x: number, y: number) => void;
  onCellRightClick: (x: number, y: number) => void;
  onNewGame: (difficulty: import('./game').Difficulty) => void;
  onReset: () => void;
}

export interface UIOptions {
  showTimer: boolean;
  showMineCount: boolean;
  theme: 'light' | 'dark';
}

export type CellDisplayState = 
  | 'hidden'
  | 'revealed-empty'
  | 'revealed-number'
  | 'revealed-mine'
  | 'flagged'
  | 'flagged-wrong';
```

## Phase 4: Migrate Utility Functions

### 1. Original JavaScript Utils

```javascript
// src/js/utils.js
export function getDifficultyConfig(difficulty) {
  const configs = {
    easy: { width: 9, height: 9, mines: 10 },
    medium: { width: 16, height: 16, mines: 40 },
    hard: { width: 30, height: 16, mines: 99 }
  };
  return configs[difficulty] || configs.medium;
}

export function getNeighbors(board, x, y) {
  const neighbors = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < board[0].length && ny >= 0 && ny < board.length) {
        neighbors.push({ x: nx, y: ny, cell: board[ny][nx] });
      }
    }
  }
  return neighbors;
}

export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
```

### 2. Migrated TypeScript Utils

```typescript
// src/ts/utils.ts
import { Difficulty, DifficultyConfig, Position } from './types/game';
import { Board, Cell, NeighborInfo } from './types/board';

export function getDifficultyConfig(difficulty: Difficulty): DifficultyConfig {
  const configs: Record<Difficulty, DifficultyConfig> = {
    easy: { width: 9, height: 9, mines: 10 },
    medium: { width: 16, height: 16, mines: 40 },
    hard: { width: 30, height: 16, mines: 99 }
  };
  return configs[difficulty];
}

export function getNeighbors(board: Board, x: number, y: number): NeighborInfo[] {
  const neighbors: NeighborInfo[] = [];
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    
    if (nx >= 0 && nx < board[0].length && ny >= 0 && ny < board.length) {
      neighbors.push({
        position: { x: nx, y: ny },
        cell: board[ny][nx]
      });
    }
  }

  return neighbors;
}

export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function isValidPosition(board: Board, x: number, y: number): boolean {
  return x >= 0 && x < board[0].length && y >= 0 && y < board.length;
}

export function getCell(board: Board, x: number, y: number): Cell | undefined {
  return board[y]?.[x];
}

export function countMines(board: Board): number {
  return board.flat().filter(cell => cell.isMine).length;
}

export function countFlags(board: Board): number {
  return board.flat().filter(cell => cell.isFlagged).length;
}

export function countRevealed(board: Board): number {
  return board.flat().filter(cell => cell.isRevealed).length;
}
```

## Phase 5: Migrate Game Logic

### 1. Type-Safe Game Class

```typescript
// src/ts/game.ts
import { Difficulty, GameStatus, DifficultyConfig, Position, GameStats } from './types/game';
import { Board, Cell, BoardConfig } from './types/board';
import { 
  getDifficultyConfig, 
  getNeighbors, 
  isValidPosition, 
  countMines, 
  countRevealed 
} from './utils';

export class Game {
  private board: Board = [];
  private status: GameStatus = 'ready';
  private mines: number = 0;
  private flags: number = 0;
  private startTime: number | null = null;
  private endTime: number | null = null;
  private readonly difficulty: Difficulty;

  constructor(difficulty: Difficulty = 'medium') {
    this.difficulty = difficulty;
  }

  public initialize(): void {
    const config = getDifficultyConfig(this.difficulty);
    this.board = this.createBoard(config);
    this.mines = config.mines;
    this.placeMines();
    this.calculateNeighbors();
    this.status = 'ready';
    this.flags = 0;
    this.startTime = null;
    this.endTime = null;
  }

  private createBoard(config: BoardConfig): Board {
    const board: Board = [];
    
    for (let y = 0; y < config.height; y++) {
      board[y] = [];
      for (let x = 0; x < config.width; x++) {
        board[y][x] = {
          x,
          y,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0
        };
      }
    }
    
    return board;
  }

  private placeMines(): void {
    const config = getDifficultyConfig(this.difficulty);
    const totalCells = config.width * config.height;
    const minePositions = new Set<number>();

    while (minePositions.size < config.mines) {
      const position = Math.floor(Math.random() * totalCells);
      minePositions.add(position);
    }

    let index = 0;
    for (let y = 0; y < config.height; y++) {
      for (let x = 0; x < config.width; x++) {
        if (minePositions.has(index)) {
          this.board[y][x].isMine = true;
        }
        index++;
      }
    }
  }

  private calculateNeighbors(): void {
    for (let y = 0; y < this.board.length; y++) {
      for (let x = 0; x < this.board[y].length; x++) {
        const cell = this.board[y][x];
        if (!cell.isMine) {
          cell.neighborMines = this.countNeighborMines(x, y);
        }
      }
    }
  }

  private countNeighborMines(x: number, y: number): number {
    return getNeighbors(this.board, x, y)
      .filter(neighbor => neighbor.cell.isMine)
      .length;
  }

  public reveal(x: number, y: number): void {
    if (this.status === 'ready') {
      this.startTime = Date.now();
      this.status = 'playing';
    }

    if (!isValidPosition(this.board, x, y)) return;
    
    const cell = this.board[y][x];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;

    if (cell.isMine) {
      this.status = 'lost';
      this.endTime = Date.now();
      this.revealAllMines();
      return;
    }

    if (cell.neighborMines === 0) {
      this.revealNeighbors(x, y);
    }

    this.checkWinCondition();
  }

  private revealNeighbors(x: number, y: number): void {
    const neighbors = getNeighbors(this.board, x, y);
    for (const neighbor of neighbors) {
      this.reveal(neighbor.position.x, neighbor.position.y);
    }
  }

  public toggleFlag(x: number, y: number): void {
    if (!isValidPosition(this.board, x, y)) return;
    
    const cell = this.board[y][x];
    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    this.flags += cell.isFlagged ? 1 : -1;
  }

  private checkWinCondition(): void {
    const totalCells = this.board.length * this.board[0].length;
    const revealedCells = countRevealed(this.board);
    
    if (totalCells - revealedCells === this.mines) {
      this.status = 'won';
      this.endTime = Date.now();
    }
  }

  private revealAllMines(): void {
    for (const row of this.board) {
      for (const cell of row) {
        if (cell.isMine && !cell.isFlagged) {
          cell.isRevealed = true;
        }
      }
    }
  }

  public getDuration(): number {
    if (!this.startTime) return 0;
    const endTime = this.endTime || Date.now();
    return Math.floor((endTime - this.startTime) / 1000);
  }

  public getStats(): GameStats {
    return {
      duration: this.getDuration(),
      moves: countRevealed(this.board),
      flagsUsed: this.flags,
      minesRemaining: this.mines - this.flags
    };
  }

  // Getters for external access
  public getBoard(): Readonly<Board> {
    return this.board;
  }

  public getStatus(): GameStatus {
    return this.status;
  }

  public getMines(): number {
    return this.mines;
  }

  public getFlags(): number {
    return this.flags;
  }
}

export default Game;
```

## Phase 6: Migrate UI Components

### 1. Type-Safe UI Class

```typescript
// src/ts/ui.ts
import { Difficulty, GameStatus } from './types/game';
import { Cell } from './types/board';
import Game from './game';

export interface UIOptions {
  container: HTMLElement;
  onGameEnd?: (status: GameStatus, stats: any) => void;
  theme?: 'light' | 'dark';
}

export class MinesweeperUI {
  private game: Game;
  private container: HTMLElement;
  private timerInterval: number | null = null;
  private options: UIOptions;

  constructor(game: Game, options: UIOptions) {
    this.game = game;
    this.options = options;
    this.container = options.container;
    this.bindEvents();
    this.render();
  }

  private bindEvents(): void {
    this.container.addEventListener('click', this.handleCellClick.bind(this));
    this.container.addEventListener('contextmenu', this.handleCellRightClick.bind(this));
    
    // Keyboard support
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleCellClick(event: MouseEvent): void {
    const cell = (event.target as HTMLElement).closest('.cell') as HTMLElement;
    if (!cell) return;

    const x = parseInt(cell.dataset.x || '0');
    const y = parseInt(cell.dataset.y || '0');
    
    this.game.reveal(x, y);
    this.render();
    
    this.checkGameEnd();
  }

  private handleCellRightClick(event: MouseEvent): void {
    event.preventDefault();
    const cell = (event.target as HTMLElement).closest('.cell') as HTMLElement;
    if (!cell) return;

    const x = parseInt(cell.dataset.x || '0');
    const y = parseInt(cell.dataset.y || '0');
    
    this.game.toggleFlag(x, y);
    this.render();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Add keyboard navigation if needed
    switch (event.key) {
      case 'r':
      case 'R':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.resetGame();
        }
        break;
      case 'n':
      case 'N':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.newGame();
        }
        break;
    }
  }

  private checkGameEnd(): void {
    const status = this.game.getStatus();
    if (status === 'won' || status === 'lost') {
      this.options.onGameEnd?.(status, this.game.getStats());
      this.stopTimer();
    }
  }

  public render(): void {
    this.container.innerHTML = '';
    
    const gameContainer = document.createElement('div');
    gameContainer.className = `minesweeper ${this.options.theme || 'light'}`;
    
    gameContainer.appendChild(this.createHeader());
    gameContainer.appendChild(this.createBoard());
    
    this.container.appendChild(gameContainer);
    this.updateTimer();
  }

  private createHeader(): HTMLElement {
    const header = document.createElement('div');
    header.className = 'game-header';
    
    const status = document.createElement('div');
    status.className = 'game-status';
    status.textContent = `Status: ${this.game.getStatus()}`;
    
    const mines = document.createElement('div');
    mines.className = 'mine-count';
    mines.textContent = `Mines: ${this.game.getMines() - this.game.getFlags()}`;
    
    const timer = document.createElement('div');
    timer.className = 'timer';
    timer.textContent = `Time: ${this.game.getDuration()}s`;
    
    const controls = document.createElement('div');
    controls.className = 'game-controls';
    
    const newGameBtn = document.createElement('button');
    newGameBtn.textContent = 'New Game';
    newGameBtn.onclick = () => this.newGame();
    
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.onclick = () => this.resetGame();
    
    controls.appendChild(newGameBtn);
    controls.appendChild(resetBtn);
    
    header.appendChild(status);
    header.appendChild(mines);
    header.appendChild(timer);
    header.appendChild(controls);
    
    return header;
  }

  private createBoard(): HTMLElement {
    const board = document.createElement('div');
    board.className = 'game-board';
    
    const gameBoard = this.game.getBoard();
    gameBoard.forEach((row, y) => {
      const rowElement = document.createElement('div');
      rowElement.className = 'board-row';
      
      row.forEach((cell, x) => {
        const cellElement = this.createCellElement(cell, x, y);
        rowElement.appendChild(cellElement);
      });
      
      board.appendChild(rowElement);
    });
    
    return board;
  }

  private createCellElement(cell: Cell, x: number, y: number): HTMLElement {
    const cellElement = document.createElement('button');
    cellElement.className = 'cell';
    cellElement.dataset.x = x.toString();
    cellElement.dataset.y = y.toString();
    cellElement.type = 'button';
    
    if (cell.isRevealed) {
      cellElement.classList.add('revealed');
      cellElement.disabled = true;
      
      if (cell.isMine) {
        cellElement.classList.add('mine');
        cellElement.textContent = '💣';
        cellElement.setAttribute('aria-label', 'Mine');
      } else if (cell.neighborMines > 0) {
        cellElement.textContent = cell.neighborMines.toString();
        cellElement.classList.add(`neighbors-${cell.neighborMines}`);
        cellElement.setAttribute('aria-label', `${cell.neighborMines} adjacent mines`);
      } else {
        cellElement.setAttribute('aria-label', 'Empty cell');
      }
    } else if (cell.isFlagged) {
      cellElement.classList.add('flagged');
      cellElement.textContent = '🚩';
      cellElement.setAttribute('aria-label', 'Flagged cell');
    } else {
      cellElement.setAttribute('aria-label', 'Hidden cell');
    }
    
    return cellElement;
  }

  private updateTimer(): void {
    const status = this.game.getStatus();
    
    if (status === 'playing') {
      if (!this.timerInterval) {
        this.timerInterval = window.setInterval(() => {
          const timer = this.container.querySelector('.timer');
          if (timer) {
            timer.textContent = `Time: ${this.game.getDuration()}s`;
          }
        }, 1000);
      }
    } else {
      this.stopTimer();
    }
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public newGame(difficulty?: Difficulty): void {
    this.stopTimer();
    this.game = new Game(difficulty);
    this.game.initialize();
    this.render();
  }

  public resetGame(): void {
    this.stopTimer();
    this.game.initialize();
    this.render();
  }

  public destroy(): void {
    this.stopTimer();
    this.container.removeEventListener('click', this.handleCellClick);
    this.container.removeEventListener('contextmenu', this.handleCellRightClick);
    document.removeEventListener('keydown', this.handleKeyDown);
  }
}

export default MinesweeperUI;
```

## Phase 7: Add Type Guards and Validation

### 1. Type Guards

```typescript
// src/ts/type-guards.ts
import { Difficulty, GameStatus } from './types/game';
import { Cell } from './types/board';

export function isValidDifficulty(value: unknown): value is Difficulty {
  return typeof value === 'string' && 
         ['easy', 'medium', 'hard'].includes(value);
}

export function isValidGameStatus(value: unknown): value is GameStatus {
  return typeof value === 'string' && 
         ['ready', 'playing', 'won', 'lost'].includes(value);
}

export function isValidCell(value: unknown): value is Cell {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Cell).x === 'number' &&
    typeof (value as Cell).y === 'number' &&
    typeof (value as Cell).isMine === 'boolean' &&
    typeof (value as Cell).isRevealed === 'boolean' &&
    typeof (value as Cell).isFlagged === 'boolean' &&
    typeof (value as Cell).neighborMines === 'number'
  );
}

export function assertValidPosition(x: number, y: number, width: number, height: number): void {
  if (x < 0 || x >= width || y < 0 || y >= height) {
    throw new Error(`Invalid position: (${x}, ${y})`);
  }
}
```

### 2. Validation Functions

```typescript
// src/ts/validation.ts
import { Difficulty, GameStatus } from './types/game';
import { Board } from './types/board';
import { isValidDifficulty, isValidGameStatus, isValidCell } from './type-guards';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateDifficulty(difficulty: unknown): ValidationResult {
  const errors: string[] = [];
  
  if (!isValidDifficulty(difficulty)) {
    errors.push('Invalid difficulty level');
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validateBoard(board: unknown): ValidationResult {
  const errors: string[] = [];
  
  if (!Array.isArray(board)) {
    errors.push('Board must be an array');
    return { isValid: false, errors };
  }
  
  if (board.length === 0) {
    errors.push('Board cannot be empty');
    return { isValid: false, errors };
  }
  
  const rowLength = board[0].length;
  for (let y = 0; y < board.length; y++) {
    const row = board[y];
    
    if (!Array.isArray(row)) {
      errors.push(`Row ${y} must be an array`);
      continue;
    }
    
    if (row.length !== rowLength) {
      errors.push(`Row ${y} has inconsistent length`);
    }
    
    for (let x = 0; x < row.length; x++) {
      if (!isValidCell(row[x])) {
        errors.push(`Invalid cell at (${x}, ${y})`);
      }
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validateGameState(state: unknown): ValidationResult {
  const errors: string[] = [];
  
  if (typeof state !== 'object' || state === null) {
    errors.push('Game state must be an object');
    return { isValid: false, errors };
  }
  
  const s = state as any;
  
  if (!isValidGameStatus(s.status)) {
    errors.push('Invalid game status');
  }
  
  if (typeof s.mines !== 'number' || s.mines < 0) {
    errors.push('Invalid mine count');
  }
  
  if (typeof s.flags !== 'number' || s.flags < 0) {
    errors.push('Invalid flag count');
  }
  
  if (s.board) {
    const boardValidation = validateBoard(s.board);
    if (!boardValidation.isValid) {
      errors.push(...boardValidation.errors);
    }
  }
  
  return { isValid: errors.length === 0, errors };
}
```

## Phase 8: Testing

### 1. Unit Tests

```typescript
// src/tests/game.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import Game from '../ts/game';
import { Difficulty } from '../ts/types/game';

describe('Game', () => {
  let game: Game;

  beforeEach(() => {
    game = new Game('easy');
    game.initialize();
  });

  it('should initialize with correct board size', () => {
    const board = game.getBoard();
    expect(board).toHaveLength(9);
    expect(board[0]).toHaveLength(9);
  });

  it('should place correct number of mines', () => {
    expect(game.getMines()).toBe(10);
  });

  it('should start with ready status', () => {
    expect(game.getStatus()).toBe('ready');
  });

  it('should reveal cell correctly', () => {
    game.reveal(0, 0);
    expect(game.getStatus()).toBe('playing');
    
    const board = game.getBoard();
    expect(board[0][0].isRevealed).toBe(true);
  });

  it('should toggle flag correctly', () => {
    game.toggleFlag(0, 0);
    expect(game.getFlags()).toBe(1);
    
    game.toggleFlag(0, 0);
    expect(game.getFlags()).toBe(0);
  });

  it('should calculate duration correctly', () => {
    expect(game.getDuration()).toBe(0);
    
    // Simulate game start
    (game as any).startTime = Date.now() - 5000;
    expect(game.getDuration()).toBe(5);
  });
});
```

### 2. Integration Tests

```typescript
// src/tests/ui.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MinesweeperUI } from '../ts/ui';
import Game from '../ts/game';

describe('MinesweeperUI', () => {
  let game: Game;
  let container: HTMLElement;
  let ui: MinesweeperUI;

  beforeEach(() => {
    game = new Game('easy');
    game.initialize();
    
    container = document.createElement('div');
    document.body.appendChild(container);
    
    ui = new MinesweeperUI(game, { container });
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should render game board', () => {
    const board = container.querySelector('.game-board');
    expect(board).toBeTruthy();
    
    const cells = container.querySelectorAll('.cell');
    expect(cells).toHaveLength(81); // 9x9 grid
  });

  it('should render game header', () => {
    const header = container.querySelector('.game-header');
    expect(header).toBeTruthy();
    
    expect(container.querySelector('.game-status')).toBeTruthy();
    expect(container.querySelector('.mine-count')).toBeTruthy();
    expect(container.querySelector('.timer')).toBeTruthy();
  });

  it('should handle cell clicks', () => {
    const firstCell = container.querySelector('.cell') as HTMLElement;
    firstCell.click();
    
    // Check that the game state updated
    expect(game.getStatus()).toBe('playing');
  });

  it('should handle right clicks for flagging', () => {
    const firstCell = container.querySelector('.cell') as HTMLElement;
    
    // Simulate right click
    const event = new MouseEvent('contextmenu', { bubbles: true });
    firstCell.dispatchEvent(event);
    
    expect(game.getFlags()).toBe(1);
  });
});
```

## Phase 9: Final Polish

### 1. Update TypeScript Configuration

```json
// tsconfig.json - Final configuration
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "ESNext",
    "lib": ["ES2018", "DOM"],
    "allowJs": true,
    "checkJs": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "src/js/**/*"  // Exclude old JavaScript files
  ]
}
```

### 2. Create Index File

```typescript
// src/index.ts
export { default as Game } from './ts/game';
export { MinesweeperUI } from './ts/ui';
export * from './ts/types/game';
export * from './ts/types/board';
export * from './ts/types/ui';
export * from './ts/utils';
export * from './ts/type-guards';
export * from './ts/validation';
```

### 3. Update Package.json

```json
{
  "name": "minesweeper-typescript",
  "version": "2.0.0",
  "description": "TypeScript Minesweeper Game",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc && webpack --mode production",
    "dev": "webpack serve --mode development",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "clean": "rm -rf dist"
  },
  "keywords": ["minesweeper", "game", "typescript"],
  "author": "Your Name",
  "license": "MIT"
}
```

## Summary

This migration demonstrates a complete JavaScript-to-TypeScript conversion:

- **Gradual Migration**: Started with permissive settings, gradually enabled strict checks
- **Type Safety**: Added comprehensive types for game state, board logic, and UI interactions
- **Error Prevention**: Type guards and validation prevent runtime errors
- **Better DX**: Enhanced IntelliSense and refactoring support
- **Testing**: Type-safe unit and integration tests
- **Maintainability**: Self-documenting code with clear type contracts

The migrated codebase now provides:
- Compile-time error detection
- Improved code documentation through types
- Better IDE support and developer experience
- Type-safe APIs for future extensions
- Comprehensive test coverage

This migration serves as a blueprint for converting existing JavaScript projects to TypeScript, demonstrating best practices for maintaining functionality while adding type safety.
