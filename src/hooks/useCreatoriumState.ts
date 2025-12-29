import { useState } from 'react';

export type CreatoriumTab = 'forge' | 'preview' | 'learn' | 'audits';

export function useCreatoriumState() {
  const [activeTab, setActiveTab] = useState<CreatoriumTab>('forge');
  return { activeTab, setActiveTab };
}
