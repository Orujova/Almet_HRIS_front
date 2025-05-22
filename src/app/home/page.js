"use client";
import { Calendar, Users, LineChart, Plane } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { useAuth } from "@/auth/AuthContext";

const ActionCard = ({ icon, title, description, href }) => {
  return (
    <Link
      href={href}
      className="bg-white dark:bg-almet-cloud-burst rounded-lg p-4 shadow hover:shadow-md transition-all hover:scale-[1.01]"
    >
      <div className="flex flex-col h-full">
        <div className="text-almet-sapphire dark:text-almet-bali-hai mb-3">
          {icon}
        </div>
        <h3 className="text-gray-800 dark:text-white font-medium text-sm md:text-base">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-almet-bali-hai text-xs md:text-sm mt-1">
          {description}
        </p>
      </div>
    </Link>
  );
};

const NewsCard = ({ tag, title, description, date, image }) => {
  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-lg overflow-hidden shadow">
      <img src={image} alt={title} className="w-full h-40 object-cover" />
      <div className="p-4">
        <div className="bg-blue-100 dark:bg-almet-sapphire text-almet-sapphire dark:text-white text-xs rounded-full px-2 py-0.5 inline-block mb-2">{tag}</div>
        <h3 className="text-gray-800 dark:text-white font-medium text-sm md:text-base mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-almet-bali-hai text-xs md:text-sm mb-3 line-clamp-2">{description}</p>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 dark:text-almet-waterloo text-xs">{date}</span>
          <Link href="#" className="text-almet-sapphire dark:text-almet-bali-hai text-xs md:text-sm">
            Read more
          </Link>
        </div>
      </div>
    </div>
  );
};

const EventCard = ({ icon, type, title, date, image }) => {
  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-4 shadow">
      <div className="flex items-center mb-3">
        <div className="h-9 w-9 rounded-full overflow-hidden mr-3">
          <img src={image} alt={type} className="h-full w-full object-cover" />
        </div>
        <div>
          <p className="text-gray-500 dark:text-almet-bali-hai text-xs">{type}</p>
          <h3 className="text-gray-800 dark:text-white font-medium text-sm">{title}</h3>
        </div>
      </div>
      <div className="flex items-center text-gray-500 dark:text-almet-bali-hai text-xs">
        <Calendar className="h-3 w-3 mr-1" />
        {date}
      </div>
    </div>
  );
};

export default function Home() {
  const { account } = useAuth();
  
  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="bg-almet-sapphire rounded-lg overflow-hidden mb-6 shadow-md">
        <div className="flex flex-col md:flex-row">
          <div className="p-5 md:w-2/3">
            <h1 className="text-xl md:text-2xl font-bold text-white mb-2">
              {account ? `Welcome, ${account.name || account.username || "İstifadəçi"}!` : "Welcome, Almet Central!"}
            </h1>
            <p className="text-blue-100 text-sm">
              Your comprehensive HR management platform
            </p>
          </div>
          <div className="md:w-1/3">
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2970&q=80"
              alt="Office meeting"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ActionCard
          icon={<Calendar className="h-5 w-5" />}
          title="Request Vacation"
          description="Plan your time off"
          href="/requests/vacation"
        />
        <ActionCard
          icon={<Plane className="h-5 w-5" />}
          title="Submit Business Trip"
          description="Travel request form"
          href="/requests/business-trip"
        />
        <ActionCard
          icon={<LineChart className="h-5 w-5" />}
          title="View Performance"
          description="Check your progress"
          href="/efficiency/performance-mng"
        />
        <ActionCard
          icon={<Users className="h-5 w-5" />}
          title="Access Directory"
          description="Find colleagues"
          href="/structure/headcount-table"
        />
      </div>

      {/* Company Updates */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-medium text-gray-800 dark:text-white">
            Company Updates
          </h2>
          <Link 
            href="#" 
            className="text-almet-sapphire dark:text-almet-bali-hai flex items-center text-xs md:text-sm"
          >
            View All
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NewsCard
            tag="News"
            title="Q4 Performance Review Schedule"
            description="Important dates and guidelines for upcoming performance reviews."
            date="Jan 15, 2024"
            image="https://images.unsplash.com/photo-1573164713619-24c711fe7878?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80"
          />
          <NewsCard
            tag="Announcement"
            title="New Office Opening in Dubai"
            description="Exciting expansion of our operations in the Middle East region."
            date="Jan 14, 2024"
            image="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2970&q=80"
          />
          <NewsCard
            tag="Update"
            title="Updated Travel Policy Guidelines"
            description="Review the new business travel procedures and requirements."
            date="Jan 13, 2024"
            image="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
          />
        </div>
      </div>

      {/* Upcoming Events */}
      <div>
        <h2 className="text-base font-medium text-gray-800 dark:text-white mb-3">
          Upcoming Events
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <EventCard
            type="Birthday"
            title="Sarah Johnson"
            date="January 18"
            image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
          />
          <EventCard
            type="Company Event"
            title="Annual Meeting"
            date="January 20"
            image="https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          />
          <EventCard
            type="Training"
            title="Leadership Workshop"
            date="January 25"
            image="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          />
          <EventCard
            type="Deadline"
            title="Project Milestone"
            date="January 30"
            image="https://images.unsplash.com/photo-1586282391129-76a6df230234?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}