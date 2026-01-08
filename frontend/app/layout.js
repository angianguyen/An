import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'StreamCredit - ZK-Powered DeFi Lending',
  description: 'Decentralized lending powered by Zero-Knowledge Proofs and Benford\'s Law fraud detection',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
