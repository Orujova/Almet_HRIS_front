// src/app/layout.jsx
import "./globals.css";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { Poppins } from "next/font/google";

// Define Poppins with specific weights
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Common weights for body text
  display: "swap", // Ensures text is visible while font loads
});

export const metadata = {
  title: "Almet Holding HRIS",
  description: "Human Resource Information System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}