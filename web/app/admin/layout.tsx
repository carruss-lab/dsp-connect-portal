import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "../globals.css";

// The back office is English only and sits outside the translated site, so it has its own root layout.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
