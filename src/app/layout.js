import "./globals.css";
import { ThemeProvider } from "@/components/common/ThemeProvider";

export const metadata = {
  title: "Almet Holding HRIS",
  description: "Human Resource Information System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
