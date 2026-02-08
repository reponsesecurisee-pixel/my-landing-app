import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: "Assistant Réclamation",
  description: "AI Tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LB3ZQGKBS0"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LB3ZQGKBS0');
          `}
        </Script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
