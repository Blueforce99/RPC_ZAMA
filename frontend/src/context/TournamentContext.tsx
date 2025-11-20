import React, { createContext, useContext, useReducer, ReactNode, useCallback } from "react";
import { BrowserProvider } from "ethers";
import { RPSMove } from "../services/fhevm";

// Types for tournament state
export interface Tournament {
  id: number;
  players: string[];
  entryFee: string;
  totalPrizePool: string;
  state: "REGISTRATION" | "ACTIVE" | "COMPLETED";
  createdAt: number;
  roundNumber: number;
  completed: boolean;
}

export interface Match {
  matchId: number;
  tournamentId: number;
  player1: string;
  player2: string;
  player1Move?: RPSMove;
  player2Move?: RPSMove;
  winner?: string;
  state: "PENDING" | "PLAYER1_COMMITTED" | "PLAYER2_COMMITTED" | "RESOLVED" | "PAID_OUT";
  createdAt: number;
}

export interface PlayerState {
  address?: string;
  isConnected: boolean;
  balance: string;
  usdcBalance: string;
}

export interface TournamentContextType {
  // State
  tournaments: Map<number, Tournament>;
  matches: Map<number, Match>;
  player: PlayerState;
  selectedTournament?: number;
  selectedMatch?: number;
  loading: boolean;
  error?: string;

  // Actions
  setPlayer: (player: PlayerState) => void;
  addTournament: (tournament: Tournament) => void;
  updateTournament: (id: number, tournament: Partial<Tournament>) => void;
  addMatch: (match: Match) => void;
  updateMatch: (id: number, match: Partial<Match>) => void;
  selectTournament: (id: number) => void;
  selectMatch: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  clearError: () => void;
}

// Create context
const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

// Action types
type Action =
  | { type: "SET_PLAYER"; payload: PlayerState }
  | { type: "ADD_TOURNAMENT"; payload: Tournament }
  | { type: "UPDATE_TOURNAMENT"; payload: { id: number; data: Partial<Tournament> } }
  | { type: "ADD_MATCH"; payload: Match }
  | { type: "UPDATE_MATCH"; payload: { id: number; data: Partial<Match> } }
  | { type: "SELECT_TOURNAMENT"; payload: number }
  | { type: "SELECT_MATCH"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload?: string }
  | { type: "CLEAR_ERROR" };

// Initial state
const initialState: Omit<TournamentContextType, keyof { [K in keyof TournamentContextType as TournamentContextType[K] extends Function ? K : never]: any }> = {
  tournaments: new Map(),
  matches: new Map(),
  player: {
    isConnected: false,
    balance: "0",
    usdcBalance: "0",
  },
  loading: false,
};

// Reducer
function reducer(
  state: typeof initialState,
  action: Action
): typeof initialState {
  switch (action.type) {
    case "SET_PLAYER":
      return { ...state, player: action.payload };

    case "ADD_TOURNAMENT": {
      const newTournaments = new Map(state.tournaments);
      newTournaments.set(action.payload.id, action.payload);
      return { ...state, tournaments: newTournaments };
    }

    case "UPDATE_TOURNAMENT": {
      const newTournaments = new Map(state.tournaments);
      const existing = newTournaments.get(action.payload.id);
      if (existing) {
        newTournaments.set(action.payload.id, {
          ...existing,
          ...action.payload.data,
        });
      }
      return { ...state, tournaments: newTournaments };
    }

    case "ADD_MATCH": {
      const newMatches = new Map(state.matches);
      newMatches.set(action.payload.matchId, action.payload);
      return { ...state, matches: newMatches };
    }

    case "UPDATE_MATCH": {
      const newMatches = new Map(state.matches);
      const existing = newMatches.get(action.payload.id);
      if (existing) {
        newMatches.set(action.payload.id, {
          ...existing,
          ...action.payload.data,
        });
      }
      return { ...state, matches: newMatches };
    }

    case "SELECT_TOURNAMENT":
      return { ...state, selectedTournament: action.payload };

    case "SELECT_MATCH":
      return { ...state, selectedMatch: action.payload };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "CLEAR_ERROR":
      return { ...state, error: undefined };

    default:
      return state;
  }
}

// Provider component
export const TournamentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setPlayer = useCallback((player: PlayerState) => {
    dispatch({ type: "SET_PLAYER", payload: player });
  }, []);

  const addTournament = useCallback((tournament: Tournament) => {
    dispatch({ type: "ADD_TOURNAMENT", payload: tournament });
  }, []);

  const updateTournament = useCallback((id: number, data: Partial<Tournament>) => {
    dispatch({ type: "UPDATE_TOURNAMENT", payload: { id, data } });
  }, []);

  const addMatch = useCallback((match: Match) => {
    dispatch({ type: "ADD_MATCH", payload: match });
  }, []);

  const updateMatch = useCallback((id: number, data: Partial<Match>) => {
    dispatch({ type: "UPDATE_MATCH", payload: { id, data } });
  }, []);

  const selectTournament = useCallback((id: number) => {
    dispatch({ type: "SELECT_TOURNAMENT", payload: id });
  }, []);

  const selectMatch = useCallback((id: number) => {
    dispatch({ type: "SELECT_MATCH", payload: id });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const setError = useCallback((error?: string) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const value: TournamentContextType = {
    ...state,
    setPlayer,
    addTournament,
    updateTournament,
    addMatch,
    updateMatch,
    selectTournament,
    selectMatch,
    setLoading,
    setError,
    clearError,
  };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};

// Hook to use context
export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error("useTournament must be used within TournamentProvider");
  }
  return context;
};
