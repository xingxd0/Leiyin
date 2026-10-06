import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { defaultPortfolioContent } from './defaultPortfolioContent';
import {
  DRAFT_STORAGE_KEY,
  PUBLISHED_CONTENT_PATH,
  normalizePortfolioContent,
} from './normalizePortfolioContent';
import { PortfolioContent } from './model';

interface PortfolioContentContextValue {
  content: PortfolioContent;
  publishedContent: PortfolioContent;
  hasLocalDraft: boolean;
  saveContent: (nextContent: PortfolioContent) => void;
  resetDraft: () => void;
}

const PortfolioContentContext = createContext<PortfolioContentContextValue | null>(null);

function readStoredDraft() {
  if (typeof window === 'undefined') {
    return null;
  }

  const saved = window.localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!saved) {
    return null;
  }

  try {
    return normalizePortfolioContent(JSON.parse(saved) as PortfolioContent);
  } catch {
    return null;
  }
}

export function PortfolioContentProvider({ children }: { children: ReactNode }) {
  const initialDraft = readStoredDraft();
  const [publishedContent, setPublishedContent] = useState<PortfolioContent>(defaultPortfolioContent);
  const [content, setContent] = useState<PortfolioContent>(initialDraft ?? defaultPortfolioContent);
  const [hasLocalDraft, setHasLocalDraft] = useState(Boolean(initialDraft));

  useEffect(() => {
    let isMounted = true;

    async function loadPublishedContent() {
      try {
        const response = await fetch(PUBLISHED_CONTENT_PATH, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load ${PUBLISHED_CONTENT_PATH}`);
        }

        const nextPublished = normalizePortfolioContent((await response.json()) as PortfolioContent);
        if (!isMounted) {
          return;
        }

        setPublishedContent(nextPublished);
        setContent((current) => (hasLocalDraft ? current : nextPublished));
      } catch {
        if (!isMounted) {
          return;
        }

        setPublishedContent(defaultPortfolioContent);
        setContent((current) => (hasLocalDraft ? current : defaultPortfolioContent));
      }
    }

    void loadPublishedContent();

    return () => {
      isMounted = false;
    };
  }, [hasLocalDraft]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== DRAFT_STORAGE_KEY) {
        return;
      }

      if (!event.newValue) {
        setHasLocalDraft(false);
        setContent(publishedContent);
        return;
      }

      try {
        const nextDraft = normalizePortfolioContent(JSON.parse(event.newValue) as PortfolioContent);
        setHasLocalDraft(true);
        setContent(nextDraft);
      } catch {
        setHasLocalDraft(false);
        setContent(publishedContent);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [publishedContent]);

  const value = useMemo(
    () => ({
      content,
      publishedContent,
      hasLocalDraft,
      saveContent: (nextContent: PortfolioContent) => {
        const normalized = normalizePortfolioContent(nextContent);
        setContent(normalized);
        setHasLocalDraft(true);
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(normalized));
      },
      resetDraft: () => {
        setContent(publishedContent);
        setHasLocalDraft(false);
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      },
    }),
    [content, hasLocalDraft, publishedContent],
  );

  return <PortfolioContentContext.Provider value={value}>{children}</PortfolioContentContext.Provider>;
}

export function usePortfolioContent() {
  const context = useContext(PortfolioContentContext);

  if (!context) {
    throw new Error('usePortfolioContent must be used inside PortfolioContentProvider');
  }

  return context;
}
