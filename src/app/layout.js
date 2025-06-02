// src/app/layout.js - Updated
import "./globals.css";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { Poppins } from "next/font/google";
import { AuthProvider } from '@/auth/AuthContext';
import { ReduxProvider } from '@/components/providers/ReduxProvider';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Almet Holding HRIS",
  description: "Human Resource Information System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <ReduxProvider>
          <AuthProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}