import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppProvider, useAppContext } from '../store/AppContext';
import { DEFAULT_GA_CONFIG } from '../types';
import type { GAConfig, GAResult, GenerationStats } from '../types';

// Mock the dataLoader module
vi.mock('../dataLoader', () => ({
  loadUsers: vi.fn(),
  loadProducts: vi.fn(),
  loadRatings: vi.fn(),
  loadBehavior: vi.fn(),
  buildUserProfiles: vi.fn(),
}));

import { loadUsers, loadProducts, loadRatings, loadBehavior, buildUserProfiles } from '../dataLoader';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe('AppContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides initial state with defaults', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    const s = result.current.state;

    expect(s.users).toEqual([]);
    expect(s.products).toEqual([]);
    expect(s.ratings).toEqual([]);
    expect(s.behavior).toEqual([]);
    expect(s.userProfiles).toEqual([]);
    expect(s.loading).toBe(false);
    expect(s.error).toBeNull();
    expect(s.gaConfig.populationSize).toBe(DEFAULT_GA_CONFIG.populationSize);
    expect(s.selectedUser).toBeNull();
    expect(s.running).toBe(false);
    expect(s.generationHistory).toEqual([]);
    expect(s.result).toBeNull();
  });

  it('throws when useAppContext is used outside provider', () => {
    expect(() => {
      renderHook(() => useAppContext());
    }).toThrow('useAppContext must be used within an AppProvider');
  });

  it('loadData sets loading then stores data on success', async () => {
    const mockUsers = [{ user_id: 1, age: 25, location: 'NYC' }];
    const mockProducts = [{ product_id: 1, category: 'Electronics', price: 99 }];
    const mockRatings = [{ user_id: 1, product_id: 1, rating: 5 }];
    const mockBehavior = [{ user_id: 1, product_id: 1, viewed: 1, clicked: 1, purchased: 0 }];
    const mockProfiles = [
      {
        user: mockUsers[0],
        ratings: mockRatings,
        behavior: mockBehavior,
        ratingCount: 1,
        behaviorCount: 1,
        topRatedProducts: [{ product_id: 1, rating: 5 }],
      },
    ];

    vi.mocked(loadUsers).mockResolvedValue(mockUsers);
    vi.mocked(loadProducts).mockResolvedValue(mockProducts);
    vi.mocked(loadRatings).mockResolvedValue(mockRatings);
    vi.mocked(loadBehavior).mockResolvedValue(mockBehavior);
    vi.mocked(buildUserProfiles).mockReturnValue(mockProfiles);

    const { result } = renderHook(() => useAppContext(), { wrapper });

    await act(async () => {
      await result.current.loadData();
    });

    expect(result.current.state.loading).toBe(false);
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.users).toEqual(mockUsers);
    expect(result.current.state.products).toEqual(mockProducts);
    expect(result.current.state.ratings).toEqual(mockRatings);
    expect(result.current.state.behavior).toEqual(mockBehavior);
    expect(result.current.state.userProfiles).toEqual(mockProfiles);
  });

  it('loadData sets error on failure', async () => {
    vi.mocked(loadUsers).mockRejectedValue(new Error('File not found'));

    const { result } = renderHook(() => useAppContext(), { wrapper });

    await act(async () => {
      await result.current.loadData();
    });

    expect(result.current.state.loading).toBe(false);
    expect(result.current.state.error).toBe('File not found');
  });

  it('setConfig updates GA config', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    const newConfig: GAConfig = {
      ...DEFAULT_GA_CONFIG,
      populationSize: 50,
      maxGenerations: 100,
    };

    act(() => {
      result.current.setConfig(newConfig);
    });

    expect(result.current.state.gaConfig.populationSize).toBe(50);
    expect(result.current.state.gaConfig.maxGenerations).toBe(100);
  });

  it('selectUser finds and sets the user profile', async () => {
    const mockUsers = [
      { user_id: 1, age: 25, location: 'NYC' },
      { user_id: 2, age: 30, location: 'LA' },
    ];
    const mockProfiles = mockUsers.map((u) => ({
      user: u,
      ratings: [],
      behavior: [],
      ratingCount: 0,
      behaviorCount: 0,
      topRatedProducts: [],
    }));

    vi.mocked(loadUsers).mockResolvedValue(mockUsers);
    vi.mocked(loadProducts).mockResolvedValue([]);
    vi.mocked(loadRatings).mockResolvedValue([]);
    vi.mocked(loadBehavior).mockResolvedValue([]);
    vi.mocked(buildUserProfiles).mockReturnValue(mockProfiles);

    const { result } = renderHook(() => useAppContext(), { wrapper });

    await act(async () => {
      await result.current.loadData();
    });

    act(() => {
      result.current.selectUser(2);
    });

    expect(result.current.state.selectedUser).not.toBeNull();
    expect(result.current.state.selectedUser!.user.user_id).toBe(2);
  });

  it('selectUser sets null for unknown userId', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.selectUser(999);
    });

    expect(result.current.state.selectedUser).toBeNull();
  });

  it('startGA sets running and clears previous results', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.startGA();
    });

    expect(result.current.state.running).toBe(true);
    expect(result.current.state.generationHistory).toEqual([]);
    expect(result.current.state.result).toBeNull();
  });

  it('updateProgress appends generation stats', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    const stats1: GenerationStats = { generation: 0, bestFitness: 0.5, avgFitness: 0.3, bestSet: [1, 2] };
    const stats2: GenerationStats = { generation: 1, bestFitness: 0.6, avgFitness: 0.4, bestSet: [1, 3] };

    act(() => {
      result.current.startGA();
    });

    act(() => {
      result.current.updateProgress(stats1);
    });

    act(() => {
      result.current.updateProgress(stats2);
    });

    expect(result.current.state.generationHistory).toHaveLength(2);
    expect(result.current.state.generationHistory[0].generation).toBe(0);
    expect(result.current.state.generationHistory[1].generation).toBe(1);
  });

  it('setResults stores result and sets running to false', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    const gaResult: GAResult = {
      finalBestSet: { productIds: [1, 2, 3], fitnessScore: 0.85 },
      generationHistory: [],
      totalGenerations: 10,
      converged: true,
      fitnessImprovement: 42.5,
    };

    act(() => {
      result.current.startGA();
    });

    expect(result.current.state.running).toBe(true);

    act(() => {
      result.current.setResults(gaResult);
    });

    expect(result.current.state.running).toBe(false);
    expect(result.current.state.result).toEqual(gaResult);
  });
});
