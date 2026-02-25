import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Theme
      darkMode: true,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      // Auth (simplified demo)
      user: null,
      isDemo: true,
      login: (username) => set({ user: { username, loginAt: Date.now() }, isDemo: false }),
      logout: () => set({ user: null, isDemo: true }),
      enableDemo: () => set({ isDemo: true, user: { username: 'Demo User', loginAt: Date.now() } }),

      // Watchlist
      watchlist: [],
      addToWatchlist: (item) => set((s) => ({ watchlist: [...s.watchlist, item] })),
      removeFromWatchlist: (symbol) => set((s) => ({ watchlist: s.watchlist.filter(w => w.symbol !== symbol) })),

      // Trades
      trades: [],
      addTrade: (trade) => set((s) => ({ trades: [trade, ...s.trades] })),
      updateTrade: (id, updates) => set((s) => ({
        trades: s.trades.map(t => t.id === id ? { ...t, ...updates } : t),
      })),

      // Journal
      journalEntries: [],
      addJournalEntry: (entry) => set((s) => ({ journalEntries: [entry, ...s.journalEntries] })),
      updateJournalEntry: (id, updates) => set((s) => ({
        journalEntries: s.journalEntries.map(e => e.id === id ? { ...e, ...updates } : e),
      })),

      // Weekly Plan
      weeklyPlan: { bias: '', keyLevels: '', catalysts: '', notes: '' },
      setWeeklyPlan: (plan) => set({ weeklyPlan: plan }),

      // Calendar Notes
      calendarNotes: {},
      setCalendarNote: (eventId, note) => set((s) => ({
        calendarNotes: { ...s.calendarNotes, [eventId]: note },
      })),

      // Settings
      settings: {
        accountSize: 100000,
        defaultRiskPercent: 1,
        notifications: true,
        autoSave: true,
      },
      updateSettings: (updates) => set((s) => ({
        settings: { ...s.settings, ...updates },
      })),
    }),
    { name: 'trader-assistant-storage' }
  )
);
