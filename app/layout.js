import './globals.css';

export const metadata = {
  title: "Assistant Réclamation",
  description: "AI Tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
