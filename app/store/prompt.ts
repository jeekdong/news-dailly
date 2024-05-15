import { create } from 'zustand'

import { combine } from 'zustand/middleware'

import { createSelectors } from './tools'
import { buildSummaryPrompt } from '../utils/prompt'

export const useConfigStoreBase = create(
  combine(
    {
      language: 'zh',
    },
    (set) => ({
      setLanguage: (language: string) => set({ language }),
    }),
  ),
)
export const useConfigStore = createSelectors(useConfigStoreBase)

export const usePromptStore = create(
  combine(
    {
      summaryPrompt: buildSummaryPrompt(
        useConfigStore.use.language(),
      ),
    },
    (set) => ({
      setPrompt: (summaryPrompt: string) => set({ summaryPrompt }),
    }),
  ),
)
export const usePromptStoreSelectors = createSelectors(usePromptStore)