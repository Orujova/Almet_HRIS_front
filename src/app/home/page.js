"use client";
import { Calendar, Users, Award, Bell, Plane } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { useTheme } from "@/components/common/ThemeProvider";

const CompanyUpdateCard = ({ tag, title, description, date, image }) => {
  const { darkMode } = useTheme();
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";

  return (
    <div
      className={`flex flex-col md:flex-row ${bgCard} rounded-lg overflow-hidden mb-6 shadow-md`}
    >
      <div className="md:w-1/3">
        <img
          src={image}
          alt={title}
          className="w-full h-48 md:h-full object-cover"
        />
      </div>
      <div className="p-6 md:w-2/3">
        <div className="text-sm text-blue-500 font-medium mb-2">{tag}</div>
        <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>{title}</h3>
        <p className={`${textSecondary} mb-4`}>{description}</p>
        <div className="flex justify-between items-center">
          <span className={`text-sm ${textMuted}`}>{date}</span>
          <Link
            href="#"
            className="text-blue-500 hover:text-blue-600 flex items-center"
          >
            Read More <span className="ml-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ icon, title, color, href }) => {
  const { darkMode } = useTheme();
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";

  return (
    <Link
      href={href}
      className={`${bgCard} rounded-lg p-4 flex flex-col items-center justify-center shadow-md transition-transform hover:scale-105`}
    >
      <div
        className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mb-3`}
      >
        {icon}
      </div>
      <span className={`${textPrimary} text-sm font-medium text-center`}>
        {title}
      </span>
    </Link>
  );
};

const NewsCard = ({ tag, title, date, image }) => {
  const { darkMode } = useTheme();
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";

  return (
    <div className={`${bgCard} rounded-lg overflow-hidden shadow-md h-full`}>
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <div className="text-xs text-blue-500 font-medium mb-1">{tag}</div>
        <h3 className={`text-base font-bold ${textPrimary} mb-2`}>{title}</h3>
        <div className={`text-xs ${textMuted}`}>{date}</div>
      </div>
    </div>
  );
};

const EventCard = ({ icon, type, title, date }) => {
  const { darkMode } = useTheme();
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";

  return (
    <div
      className={`${bgCard} rounded-lg p-4 border ${
        darkMode ? "border-gray-700" : "border-gray-200"
      }`}
    >
      <div className="flex items-start">
        <div className="mr-3">{icon}</div>
        <div>
          <div className={`text-xs ${textMuted}`}>{type}</div>
          <h4 className={`text-base font-medium ${textPrimary} mb-1`}>
            {title}
          </h4>
          <div className={`text-xs ${textMuted}`}>{date}</div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgSection = darkMode ? "bg-gray-900" : "bg-gray-50";

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className={`${bgSection} rounded-lg p-6 mb-6`}>
        <h1 className={`text-2xl md:text-3xl font-bold ${textPrimary} mb-2`}>
          Welcome to Almet Central
        </h1>
        <p className={`${textSecondary}`}>Your corporate communication hub</p>
      </div>

      {/* Featured Update */}
      <CompanyUpdateCard
        tag="Company Update"
        title="Q1 2024 Company Performance Overview"
        description="Join us for a comprehensive review of our first quarter performance. We'll discuss key achievements, challenges, and our strategic outlook for the rest of the year."
        date="March 15, 2024"
        image="https://placehold.co/800x400/e2e8f0/1e293b?text=Company+Meeting"
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <ActionCard
          icon={<Calendar className="text-white" />}
          title="Request Vacation"
          color="bg-indigo-500"
          href="/requests/vacation"
        />
        <ActionCard
          icon={<Plane className="text-white" />}
          title="Submit Business Trip"
          color="bg-amber-500"
          href="/requests/business-trip"
        />
        <ActionCard
          icon={<Award className="text-white" />}
          title="View Performance"
          color="bg-emerald-500"
          href="/efficiency/performance-mng"
        />
        <ActionCard
          icon={<Users className="text-white" />}
          title="Company Directory"
          color="bg-blue-500"
          href="/structure/headcount-table"
        />
      </div>

      {/* News Section */}
      <h2 className={`text-xl font-bold ${textPrimary} mb-4`}>
        Latest Updates
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <NewsCard
          tag="HR Update"
          title="New Employee Benefits Program"
          date="March 10, 2024"
          image="https://placehold.co/600x400/e2e8f0/1e293b?text=Benefits"
        />
        <NewsCard
          tag="Announcement"
          title="Office Renovation Schedule"
          date="March 8, 2024"
          image="https://placehold.co/600x400/e2e8f0/1e293b?text=Office"
        />
        <NewsCard
          tag="Training"
          title="Leadership Development Program"
          date="March 5, 2024"
          image="https://placehold.co/600x400/e2e8f0/1e293b?text=Training"
        />
      </div>

      {/* Upcoming Events */}
      <div className="mb-6">
        <h2 className={`text-xl font-bold ${textPrimary} mb-4`}>
          Upcoming Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EventCard
            icon={<Calendar className="text-pink-500" />}
            type="Birthday"
            title="Sarah Johnson"
            date="March 20"
          />
          <EventCard
            icon={<Users className="text-blue-500" />}
            type="Company Event"
            title="Team Building Day"
            date="March 25"
          />
          <EventCard
            icon={<Award className="text-green-500" />}
            type="Training"
            title="Digital Skills Workshop"
            date="March 30"
          />
        </div>
      </div>

      {/* Footer */}
      <div
        className={`text-center ${textMuted} text-xs mt-12 pt-4 border-t ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        © 2024 Almet Holding. Created by Databyte Technology. All rights
        reserved.
      </div>
    </DashboardLayout>
  );
}
