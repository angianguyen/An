'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

/**
 * Component to load snarkjs library from CDN
 * Must be included in layout or page that uses ZK proofs
 */
export default function ZKScripts() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if snarkjs is already loaded
    if (typeof window !== 'undefined' && window.snarkjs) {
      console.log('✅ snarkjs already loaded');
      setLoaded(true);
    }
  }, []);

  return (
    <>
      <Script 
        src="https://cdn.jsdelivr.net/npm/snarkjs@0.7.0/build/snarkjs.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ snarkjs loaded successfully');
          setLoaded(true);
        }}
        onError={(e) => {
          console.error('❌ Failed to load snarkjs:', e);
        }}
      />
    </>
  );
}
