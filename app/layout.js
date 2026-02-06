import './globals.css';
import PostHogProvider from './PostHogProvider';

export const metadata = {
  title: "Assistant Réclamation",
  description: "AI Tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
     <body>
    <PostHogProvider />
    {children}
  </body> 
    </html>
  );
}
