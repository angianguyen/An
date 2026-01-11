'use client';

import { Web3Provider } from '../context/Web3Context';
import { I18nextProvider } from 'react-i18next';
import i18n from '../config/i18n';
import { useEffect, useState } from 'react';

export function Providers({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <Web3Provider>
        {children}
      </Web3Provider>
    </I18nextProvider>
  );
}
