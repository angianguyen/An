'use client';

import { Web3Provider } from '../context/Web3Context';

export function Providers({ children }) {
  return (
    <Web3Provider>
      {children}
    </Web3Provider>
  );
}
