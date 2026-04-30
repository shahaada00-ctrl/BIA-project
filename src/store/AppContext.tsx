import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type {
  User,
  Product,
  Rating,
  BehaviorRecord,
  UserProfile,
  GAConfig,
  GAResult,
  GenerationStats,
} from '../types';
import { DEFAULT_GA_CONFIG } from '../types';
import { loadUsers, loadProducts, loadRatings, loadBehavior, buildUserProfiles } from '../dataLoader';

// ============================================================
// State
// ============================================================

interface AppState {
  // Data state
  users: User[];
  products: Product[];
  ratings: Rating[];
  behavior: BehaviorRecord[];
  userProfiles: UserProfile[];
  loading: boolean;
  error: string | null;

  // GA config
  gaConfig: GAConfig;

  // Selected user
  selectedUser: UserProfile | null;

  // GA run state
  running: boolean;
  generationHistory: GenerationStats[];
  result: GAResult | null;
}

const initialState: AppState = {
  users: [],
  products: [],
  ratings: [],
  behavior: [],
  userProfiles: [],
  loading: false,
  error: null,
  gaConfig: { ...DEFAULT_GA_CONFIG, fitnessWeights: { ...DEFAULT_GA_CONFIG.fitnessWeights } },
  selectedUser: null,
  running: false,
  generationHistory: [],
  result: null,
};

// ============================================================
// Actions
// ============================================================

type Action =
  | { type: 'LOAD_DATA_START' }
  | { type: 'LOAD_DATA_SUCCESS'; payload: { users: User[]; products: Product[]; ratings: Rating[]; behavior: BehaviorRecord[]; userProfiles: UserProfile[] } }
  | { type: 'LOAD_DATA_ERROR'; payload: string }
  | { type: 'SET_CONFIG'; payload: GAConfig }
  | { type: 'SELECT_USER'; payload: UserProfile | null }
  | { type: 'START_GA' }
  | { type: 'UPDATE_PROGRESS'; payload: GenerationStats }
  | { type: 'SET_RESULTS'; payload: GAResult };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_DATA_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_DATA_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        users: action.payload.users,
        products: action.payload.products,
        ratings: action.payload.ratings,
        behavior: action.payload.behavior,
        userProfiles: action.payload.userProfiles,
      };
    case 'LOAD_DATA_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_CONFIG':
      return { ...state, gaConfig: action.payload };
    case 'SELECT_USER':
      return { ...state, selectedUser: action.payload };
    case 'START_GA':
      return { ...state, running: true, generationHistory: [], result: null };
    case 'UPDATE_PROGRESS':
      return { ...state, generationHistory: [...state.generationHistory, action.payload] };
    case 'SET_RESULTS':
      return { ...state, running: false, result: action.payload };
    default:
      return state;
  }
}

// ============================================================
// Context
// ============================================================

interface AppContextValue {
  state: AppState;
  loadData: () => Promise<void>;
  setConfig: (config: GAConfig) => void;
  selectUser: (userId: number) => void;
  startGA: () => void;
  updateProgress: (stats: GenerationStats) => void;
  setResults: (result: GAResult) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// ============================================================
// Provider
// ============================================================

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadData = useCallback(async () => {
    dispatch({ type: 'LOAD_DATA_START' });
    try {
      const [users, products, ratings, behavior] = await Promise.all([
        loadUsers(),
        loadProducts(),
        loadRatings(),
        loadBehavior(),
      ]);
      console.log('users', users)
      console.log('products', products)
      console.log('ratings', ratings)
      console.log('behavior', behavior)
      const userProfiles = buildUserProfiles(users, ratings, behavior);
      dispatch({
        type: 'LOAD_DATA_SUCCESS',
        payload: { users, products, ratings, behavior, userProfiles },
      });
    } catch (err) {
      dispatch({
        type: 'LOAD_DATA_ERROR',
        payload: err instanceof Error ? err.message : String(err),
      });
    }
  }, []);

  const setConfig = useCallback((config: GAConfig) => {
    dispatch({ type: 'SET_CONFIG', payload: config });
  }, []);

  const selectUser = useCallback(
    (userId: number) => {
      const profile = state.userProfiles.find((p) => p.user.user_id === userId) ?? null;
      dispatch({ type: 'SELECT_USER', payload: profile });
    },
    [state.userProfiles],
  );

  const startGA = useCallback(() => {
    dispatch({ type: 'START_GA' });
  }, []);

  const updateProgress = useCallback((stats: GenerationStats) => {
    dispatch({ type: 'UPDATE_PROGRESS', payload: stats });
  }, []);

  const setResults = useCallback((result: GAResult) => {
    dispatch({ type: 'SET_RESULTS', payload: result });
  }, []);

  const value: AppContextValue = {
    state,
    loadData,
    setConfig,
    selectUser,
    startGA,
    updateProgress,
    setResults,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================================
// Hook
// ============================================================

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return ctx;
}

export { AppContext };
export type { AppState, AppContextValue };
