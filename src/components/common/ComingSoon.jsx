import { Settings } from "lucide-react";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";

const ComingSoon = () => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const bgAccent = darkMode ? "bg-blue-600" : "bg-blue-500";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <div
          className={`${bgAccent} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6`}
        >
          <Settings size={32} className="text-white animate-spin-slow" />
        </div>
        <h2 className={`text-3xl font-bold mb-2 ${textPrimary}`}>
          Coming Soon
        </h2>
        <p className={`${textMuted} mb-6`}>
          We're currently working on this page. Please check back later.
        </p>
        <Link
          href="/dashboard"
          className={`${bgAccent} text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors block text-center`}
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;
