# Bonus 04: useRef with TypeScript

The `useRef` hook provides a way to persist mutable values across renders and access DOM elements directly. When combined with TypeScript, it requires careful typing to maintain type safety. This section covers proper typing patterns for useRef and common use cases.

## Basic useRef Typing

### 1. DOM Element Refs

```tsx
import React, { useRef, useEffect } from 'react';

const TextInput: React.FC = () => {
  // TypeScript infers: React.RefObject<HTMLInputElement>
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // TypeScript knows inputRef.current is HTMLInputElement | null
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={handleClick}>Select Text</button>
    </div>
  );
};
```

### 2. Generic Refs

```tsx
// For any HTML element
const GenericRef: React.FC = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div ref={divRef}>
      <button ref={buttonRef}>Click me</button>
      <canvas ref={canvasRef} />
    </div>
  );
};
```

### 3. Mutable Value Refs

```tsx
const Timer: React.FC = () => {
  // For storing mutable values (not DOM elements)
  const intervalRef = useRef<number | null>(null);
  const countRef = useRef(0);

  const startTimer = () => {
    intervalRef.current = window.setInterval(() => {
      countRef.current += 1;
      console.log('Count:', countRef.current);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <div>
      <button onClick={startTimer}>Start</button>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
};
```

## Advanced useRef Patterns

### 1. Callback Refs with TypeScript

```tsx
interface VideoPlayerProps {
  src: string;
  onLoaded?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onLoaded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Callback ref with proper typing
  const setVideoRef = (element: HTMLVideoElement | null) => {
    if (videoRef.current !== element) {
      videoRef.current = element;

      if (element && onLoaded) {
        element.addEventListener('loadeddata', onLoaded);
      }
    }
  };

  const playVideo = () => {
    videoRef.current?.play();
  };

  const pauseVideo = () => {
    videoRef.current?.pause();
  };

  return (
    <div>
      <video ref={setVideoRef} src={src} controls />
      <div>
        <button onClick={playVideo}>Play</button>
        <button onClick={pauseVideo}>Pause</button>
      </div>
    </div>
  );
};
```

### 2. Refs with Generics

```tsx
// Generic ref hook
function useTypedRef<T extends HTMLElement>(): React.RefObject<T> {
  return useRef<T>(null);
}

// Usage
const MyComponent: React.FC = () => {
  const inputRef = useTypedRef<HTMLInputElement>();
  const divRef = useTypedRef<HTMLDivElement>();

  return (
    <div ref={divRef}>
      <input ref={inputRef} />
    </div>
  );
};
```

### 3. Refs for Previous Values

```tsx
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

// Usage
const Counter: React.FC = () => {
  const [count, setCount] = useState(0);
  const previousCount = usePrevious(count);

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {previousCount}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
};
```

### 4. Refs with Complex Objects

```tsx
interface GameState {
  score: number;
  level: number;
  lives: number;
}

const Game: React.FC = () => {
  // Store complex mutable state
  const gameStateRef = useRef<GameState>({
    score: 0,
    level: 1,
    lives: 3,
  });

  const updateScore = (points: number) => {
    gameStateRef.current.score += points;

    // Check for level up
    if (gameStateRef.current.score > gameStateRef.current.level * 1000) {
      gameStateRef.current.level += 1;
    }
  };

  const loseLife = () => {
    gameStateRef.current.lives -= 1;

    if (gameStateRef.current.lives <= 0) {
      console.log('Game Over!');
    }
  };

  return (
    <div>
      <p>Score: {gameStateRef.current.score}</p>
      <p>Level: {gameStateRef.current.level}</p>
      <p>Lives: {gameStateRef.current.lives}</p>
      <button onClick={() => updateScore(100)}>Score Points</button>
      <button onClick={loseLife}>Lose Life</button>
    </div>
  );
};
```

## useRef with Event Handlers

### 1. Stable References

```tsx
const DataFetcher: React.FC<{ url: string }> = ({ url }) => {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Clean up previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    const fetchData = async () => {
      try {
        const response = await fetch(url, {
          signal: abortControllerRef.current!.signal,
        });
        const data = await response.json();
        console.log('Data:', data);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Fetch error:', error);
        }
      }
    };

    fetchData();

    return () => {
      // Cleanup on unmount or url change
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url]);

  return <div>Fetching data...</div>;
};
```

### 2. Imperative Handle with TypeScript

```tsx
interface ModalHandle {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

interface ModalProps {
  children: React.ReactNode;
}

const Modal = React.forwardRef<ModalHandle, ModalProps>(({ children }, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  React.useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    isOpen,
  }));

  return (
    <>
      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {children}
            <button onClick={() => setIsOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
});

// Usage
const App: React.FC = () => {
  const modalRef = useRef<ModalHandle>(null);

  return (
    <div>
      <button onClick={() => modalRef.current?.open()}>
        Open Modal
      </button>
      <Modal ref={modalRef}>
        <h2>Modal Content</h2>
        <p>This is a modal dialog.</p>
      </Modal>
    </div>
  );
};
```

## Common useRef Patterns

### 1. Accessing DOM Measurements

```tsx
const ResizablePanel: React.FC = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (panelRef.current) {
        const { offsetWidth, offsetHeight } = panelRef.current;
        setDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div ref={panelRef} className="resizable-panel">
      <p>Width: {dimensions.width}px</p>
      <p>Height: {dimensions.height}px</p>
    </div>
  );
};
```

### 2. Third-Party Library Integration

```tsx
// Chart.js integration
import { Chart as ChartJS } from 'chart.js';

interface ChartProps {
  data: ChartJS.ChartData;
  options?: ChartJS.ChartOptions;
}

const Chart: React.FC<ChartProps> = ({ data, options }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      chartRef.current = new ChartJS(canvasRef.current, {
        type: 'line',
        data,
        options,
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, options]);

  return <canvas ref={canvasRef} />;
};
```

### 3. Animation and Timing

```tsx
const AnimatedCounter: React.FC<{ target: number; duration: number }> = ({
  target,
  duration,
}) => {
  const [current, setCurrent] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const animate = (timestamp: number) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    setCurrent(Math.floor(target * progress));

    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [target, duration]);

  return <div className="counter">{current}</div>;
};
```

## TypeScript-Specific Patterns

### 1. Refs with Discriminated Unions

```tsx
type ElementRef =
  | { type: 'input'; ref: React.RefObject<HTMLInputElement> }
  | { type: 'textarea'; ref: React.RefObject<HTMLTextAreaElement> }
  | { type: 'select'; ref: React.RefObject<HTMLSelectElement> };

const DynamicFormField: React.FC<{
  type: 'input' | 'textarea' | 'select';
  name: string;
}> = ({ type, name }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const focusField = () => {
    switch (type) {
      case 'input':
        inputRef.current?.focus();
        break;
      case 'textarea':
        textareaRef.current?.focus();
        break;
      case 'select':
        selectRef.current?.focus();
        break;
    }
  };

  const renderField = () => {
    switch (type) {
      case 'input':
        return <input ref={inputRef} name={name} />;
      case 'textarea':
        return <textarea ref={textareaRef} name={name} />;
      case 'select':
        return <select ref={selectRef} name={name} />;
    }
  };

  return (
    <div>
      {renderField()}
      <button onClick={focusField}>Focus</button>
    </div>
  );
};
```

### 2. Refs with Generic Constraints

```tsx
// Constrain ref to specific element types
function useElementRef<T extends HTMLElement = HTMLElement>(): React.RefObject<T> {
  return useRef<T>(null);
}

// Usage
const Button: React.FC = () => {
  const buttonRef = useElementRef<HTMLButtonElement>();

  const scrollToButton = () => {
    buttonRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <button ref={buttonRef}>Target Button</button>
      <button onClick={scrollToButton}>Scroll to Button</button>
    </div>
  );
};
```

### 3. Refs with Type Guards

```tsx
function isInputElement(element: Element | null): element is HTMLInputElement {
  return element?.tagName === 'INPUT';
}

function isTextAreaElement(element: Element | null): element is HTMLTextAreaElement {
  return element?.tagName === 'TEXTAREA';
}

const SmartInput: React.FC<{ type?: 'input' | 'textarea' }> = ({ type = 'input' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getValue = (): string => {
    if (type === 'input' && inputRef.current) {
      return inputRef.current.value;
    }
    if (type === 'textarea' && textareaRef.current) {
      return textareaRef.current.value;
    }
    return '';
  };

  const setValue = (value: string) => {
    if (type === 'input' && inputRef.current) {
      inputRef.current.value = value;
    }
    if (type === 'textarea' && textareaRef.current) {
      textareaRef.current.value = value;
    }
  };

  return (
    <div>
      {type === 'input' ? (
        <input ref={inputRef} />
      ) : (
        <textarea ref={textareaRef} />
      )}
      <button onClick={() => console.log('Value:', getValue())}>
        Log Value
      </button>
      <button onClick={() => setValue('Hello World!')}>
        Set Value
      </button>
    </div>
  );
};
```

## Best Practices

### 1. Proper Null Checking

```tsx
// ✅ Good: Always check for null
const MyComponent: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return <input ref={inputRef} onClick={focusInput} />;
};

// ❌ Avoid: Direct access without checking
const BadComponent: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current!.focus(); // Dangerous!
  };

  return <input ref={inputRef} onClick={focusInput} />;
};
```

### 2. Use Correct Ref Types

```tsx
// ✅ Good: Specific element types
const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return <video ref={videoRef} />;
};

// ❌ Avoid: Generic HTMLElement
const BadVideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLElement>(null); // Too generic

  return <video ref={videoRef} />;
};
```

### 3. Cleanup Refs Properly

```tsx
// ✅ Good: Cleanup in useEffect
const DataFetcher: React.FC<{ url: string }> = ({ url }) => {
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current = new AbortController();

    const fetchData = async () => {
      try {
        const response = await fetch(url, {
          signal: abortRef.current!.signal,
        });
        // Handle response
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error);
        }
      }
    };

    fetchData();

    return () => {
      abortRef.current?.abort();
    };
  }, [url]);

  return <div>Loading...</div>;
};
```

### 4. Avoid Overusing Refs

```tsx
// ✅ Good: Use refs only when necessary
const Form: React.FC = () => {
  const [email, setEmail] = useState('');

  return (
    <input
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  );
};

// ❌ Avoid: Unnecessary refs
const BadForm: React.FC = () => {
  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const email = emailRef.current?.value;
    // Process email
  };

  return (
    <div>
      <input ref={emailRef} />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};
```

## Common Pitfalls

### 1. Mutable Ref Values

```tsx
// Refs are mutable but don't trigger re-renders
const Counter: React.FC = () => {
  const countRef = useRef(0);

  const increment = () => {
    countRef.current += 1;
    console.log('Count:', countRef.current); // Will update
    // But component won't re-render!
  };

  return (
    <div>
      <button onClick={increment}>Increment</button>
      <p>Count: {countRef.current}</p> {/* Won't update visually */}
    </div>
  );
};
```

### 2. Ref Timing Issues

```tsx
// Refs are set after render
const AutoFocusInput: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // This runs after the component mounts
    inputRef.current?.focus();
  }, []);

  // inputRef.current is null during render
  console.log('Ref during render:', inputRef.current); // null

  return <input ref={inputRef} />;
};
```

### 3. Forwarding Refs with TypeScript

```tsx
// Correctly forwarding refs
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, onClick }, ref) => {
    return (
      <button ref={ref} onClick={onClick}>
        {children}
      </button>
    );
  }
);

// Usage
const App: React.FC = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return <Button ref={buttonRef}>Click me</Button>;
};
```

## Summary

`useRef` with TypeScript provides powerful capabilities for DOM manipulation and mutable state management. Key principles:

### Typing:
- Use specific element types for DOM refs
- Use `null` as initial value for DOM elements
- Type mutable values appropriately

### Patterns:
- Callback refs for complex ref logic
- Refs for previous values and mutable state
- Imperative handles for component communication

### Best Practices:
- Always check for null before accessing refs
- Use specific types over generic HTMLElement
- Clean up refs properly in useEffect
- Avoid overusing refs when state suffices

### Common Use Cases:
- DOM element access and manipulation
- Storing mutable values across renders
- Third-party library integration
- Animation and timing control
- Imperative component APIs

TypeScript enhances `useRef` by providing compile-time guarantees about ref types and preventing runtime errors from incorrect ref usage.
