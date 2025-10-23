"use client";
import { Calendar, Users, LineChart, Plane, Clock, CheckCircle, TrendingUp, Bell, UserCheck, MapPin, FileText, Eye, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { useAuth } from "@/auth/AuthContext";
import { useState, useEffect } from "react";
import { newsService } from "@/services/newsService";
import { useTheme } from "@/components/common/ThemeProvider";

const StatsCard = ({ icon, title, value, subtitle, actionText, isHighlight = false }) => {
  return (
    <div className={`${
      isHighlight 
        ? 'bg-gradient-to-br from-almet-sapphire to-almet-astral shadow-lg shadow-almet-sapphire/20' 
        : 'bg-white dark:bg-almet-cloud-burst shadow-md'
    } backdrop-blur-sm rounded-xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer border ${
      isHighlight 
        ? 'border-almet-steel-blue' 
        : 'border-almet-mystic dark:border-almet-san-juan'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 ${
          isHighlight 
            ? 'bg-white/20 text-white' 
            : 'bg-gradient-to-br from-almet-mystic to-white dark:from-almet-san-juan dark:to-almet-comet text-almet-sapphire dark:text-almet-steel-blue'
        } rounded-xl transition-all duration-300 shadow-sm`}>
          {icon}
        </div>
      </div>
      <h3 className={`${
        isHighlight 
          ? 'text-white/90' 
          : 'text-almet-waterloo dark:text-almet-bali-hai'
      } text-xs font-semibold mb-1 uppercase tracking-wide`}>
        {title}
      </h3>
      <div className={`text-2xl font-bold mb-1 ${
        isHighlight 
          ? 'text-white' 
          : 'text-almet-cloud-burst dark:text-white'
      }`}>
        {value}
      </div>
      <p className={`${
        isHighlight 
          ? 'text-white/80' 
          : 'text-almet-waterloo dark:text-almet-bali-hai'
      } text-sm mb-4`}>
        {subtitle}
      </p>
      {actionText && (
        <button className={`${
          isHighlight 
            ? 'bg-white/20 hover:bg-white/30 text-white' 
            : 'bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-astral hover:to-almet-steel-blue text-white shadow-md'
        } text-xs font-semibold px-4 py-2.5 rounded-lg transition-all duration-300 hover:scale-105 w-full`}>
          {actionText}
        </button>
      )}
    </div>
  );
};

const ActionCard = ({ icon, title, description, href }) => {
  return (
    <Link
      href={href}
      className="bg-white dark:bg-almet-cloud-burst rounded-lg p-4 shadow hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 border border-almet-mystic dark:border-almet-san-juan"
    >
      <div className="flex flex-col h-full">
        <div className="text-almet-sapphire dark:text-almet-steel-blue mb-3 transition-all duration-300">
          {icon}
        </div>
        <h3 className="text-almet-cloud-burst dark:text-white font-medium text-sm md:text-base">
          {title}
        </h3>
        <p className="text-almet-waterloo dark:text-almet-bali-hai text-xs md:text-sm mt-1">
          {description}
        </p>
      </div>
    </Link>
  );
};

const NewsCard = ({ news, darkMode }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  return (
    <Link 
      href={`/communication/company-news`}
      className="bg-white dark:bg-almet-cloud-burst rounded-lg overflow-hidden shadow hover:shadow-lg transition-all duration-300 group border border-almet-mystic dark:border-almet-san-juan"
    >
      <div className="relative h-40 overflow-hidden">
        <img 
          src={news.image_url || 'https://images.unsplash.com/photo-1573164713619-24c711fe7878?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80'} 
          alt={news.title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
        />
        {news.category_name && (
          <div className="absolute top-2 left-2 bg-almet-sapphire text-white text-xs rounded-full px-3 py-1 font-medium shadow-lg">
            {news.category_name}
          </div>
        )}
        {news.is_pinned && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs rounded-full px-3 py-1 font-medium shadow-lg">
            Pinned
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-almet-cloud-burst dark:text-white font-medium text-sm md:text-base mb-2 line-clamp-2 group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors">
          {news.title}
        </h3>
        <p className="text-almet-waterloo dark:text-almet-bali-hai text-xs md:text-sm mb-3 line-clamp-2">
          {news.excerpt}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-almet-waterloo dark:text-almet-bali-hai text-xs flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(news.published_at)}
          </span>
          <div className="flex items-center gap-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {news.view_count}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const EventCard = ({ icon, type, title, date, image }) => {
  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-4 shadow hover:shadow-lg transition-all duration-300 cursor-pointer border border-almet-mystic dark:border-almet-san-juan">
      <div className="flex items-center mb-3">
        <div className="h-9 w-9 rounded-full overflow-hidden mr-3 ring-2 ring-almet-mystic dark:ring-almet-san-juan">
          <img src={image} alt={type} className="h-full w-full object-cover" />
        </div>
        <div>
          <p className="text-almet-waterloo dark:text-almet-bali-hai text-xs">{type}</p>
          <h3 className="text-almet-cloud-burst dark:text-white font-medium text-sm">{title}</h3>
        </div>
      </div>
      <div className="flex items-center text-almet-waterloo dark:text-almet-bali-hai text-xs">
        <Calendar className="h-3 w-3 mr-1" />
        {date}
      </div>
    </div>
  );
};

export default function Home() {
  const { account } = useAuth();
  const { darkMode } = useTheme();
  const [isManager, setIsManager] = useState(false);
  const [latestNews, setLatestNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  
  useEffect(() => {
    loadLatestNews();
  }, []);

  const loadLatestNews = async () => {
    setLoadingNews(true);
    try {
      const response = await newsService.getNews({
        page: 1,
        page_size: 3,
        is_published: true,
        ordering: '-is_pinned,-published_at'
      });
      setLatestNews(response.results || []);
    } catch (error) {
      console.error('Failed to load latest news:', error);
    } finally {
      setLoadingNews(false);
    }
  };
  
  return (
    <DashboardLayout>
      {/* Enhanced Welcome Banner */}
      <div className="bg-gradient-to-br from-almet-mystic via-white to-almet-mystic dark:from-almet-san-juan dark:via-almet-cloud-burst dark:to-almet-san-juan rounded-2xl overflow-hidden mb-6 shadow-lg border-2 border-almet-sapphire/20 dark:border-almet-steel-blue/20">
        <div className="p-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-almet-sapphire via-almet-astral to-almet-steel-blue dark:from-almet-steel-blue dark:via-almet-astral dark:to-almet-sapphire bg-clip-text text-transparent mb-2">
                {isManager ? "Manager Dashboard" : (account ? `Welcome, ${account.name || account.username || "İstifadəçi"}!` : "Welcome, Almet Central!")}
              </h1>
              <p className="text-almet-waterloo dark:text-almet-bali-hai text-xs md:text-sm font-medium">
                {isManager ? "Approvals and team overview at a glance." : "Your key stats and quick actions for the day."}
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button 
                onClick={() => setIsManager(false)}
                className={`${!isManager ? 'bg-gradient-to-r from-almet-sapphire to-almet-astral text-white shadow-md shadow-almet-sapphire/30' : 'bg-white/60 dark:bg-almet-comet text-almet-cloud-burst dark:text-almet-bali-hai hover:bg-white/80 dark:hover:bg-almet-comet/80 border border-almet-sapphire/20 dark:border-almet-steel-blue/20'} px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105`}
              >
                Employee
              </button>
              <button 
                onClick={() => setIsManager(true)}
                className={`${isManager ? 'bg-gradient-to-r from-almet-sapphire to-almet-astral text-white shadow-md shadow-almet-sapphire/30' : 'bg-white/60 dark:bg-almet-comet text-almet-cloud-burst dark:text-almet-bali-hai hover:bg-white/80 dark:hover:bg-almet-comet/80 border border-almet-sapphire/20 dark:border-almet-steel-blue/20'} px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105`}
              >
                Manager
              </button>
            </div>
          </div>
          
          {/* Key Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {!isManager ? (
              <>
                <StatsCard
                  icon={<Clock className="h-5 w-5" />}
                  title="My Leave Balance"
                  value="12"
                  subtitle="days available"
                  actionText="Request Leave"
                  isHighlight={true}
                />
                <StatsCard
                  icon={<CheckCircle className="h-5 w-5" />}
                  title="My Requests"
                  value="1"
                  subtitle="pending approval"
                  actionText="View All Requests"
                />
                <StatsCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  title="Performance"
                  value="Nov 30"
                  subtitle="Next review on:"
                  actionText="View History"
                />
                <StatsCard
                  icon={<Bell className="h-5 w-5" />}
                  title="Info Center"
                  value={latestNews.length}
                  subtitle="Latest company updates."
                  actionText="Read Company News"
                />
              </>
            ) : (
              <>
                <StatsCard
                  icon={<UserCheck className="h-5 w-5" />}
                  title="Team Approvals"
                  value="5"
                  subtitle="requests awaiting action"
                  actionText="Manage Requests"
                  isHighlight={true}
                />
                <StatsCard
                  icon={<Users className="h-5 w-5" />}
                  title="Team Status"
                  value="3 members"
                  subtitle="out of office today"
                  actionText="View Team Calendar"
                />
                <StatsCard
                  icon={<MapPin className="h-5 w-5" />}
                  title="Open Positions"
                  value="1"
                  subtitle="in the Marketing department"
                  actionText="Review Candidates"
                />
                <StatsCard
                  icon={<FileText className="h-5 w-5" />}
                  title="Quick Reports"
                  value="Generate"
                  subtitle="one-click reports for your team"
                  actionText="Go To Reports"
                />
              </>
            )}
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

      {/* Company Updates - REAL NEWS */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-medium text-almet-cloud-burst dark:text-white">
            Company Updates
          </h2>
          <Link 
            href="/communication/company-news" 
            className="text-almet-sapphire dark:text-almet-steel-blue flex items-center text-xs md:text-sm hover:underline transition-all duration-300 group"
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {loadingNews ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-almet-cloud-burst rounded-lg overflow-hidden shadow animate-pulse border border-almet-mystic dark:border-almet-san-juan">
                <div className="h-40 bg-almet-mystic dark:bg-almet-san-juan"></div>
                <div className="p-4">
                  <div className="h-4 bg-almet-mystic dark:bg-almet-san-juan rounded mb-2"></div>
                  <div className="h-3 bg-almet-mystic dark:bg-almet-san-juan rounded mb-2"></div>
                  <div className="h-3 bg-almet-mystic dark:bg-almet-san-juan rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : latestNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestNews.map((news) => (
              <NewsCard key={news.id} news={news} darkMode={darkMode} />
            ))}
          </div>
        ) : (
          <div className={`rounded-lg p-8 text-center border ${
            darkMode ? 'bg-almet-cloud-burst border-almet-san-juan' : 'bg-white border-almet-mystic'
          }`}>
            <FileText className={`h-12 w-12 mx-auto mb-3 ${
              darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'
            }`} />
            <h3 className={`text-sm font-semibold mb-1 ${
              darkMode ? 'text-white' : 'text-almet-cloud-burst'
            }`}>
              No News Available
            </h3>
            <p className={`text-xs ${
              darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'
            }`}>
              Check back later for company updates
            </p>
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div>
        <h2 className="text-base font-medium text-almet-cloud-burst dark:text-white mb-3">
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