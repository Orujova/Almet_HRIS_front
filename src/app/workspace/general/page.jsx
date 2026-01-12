"use client";
import { Calendar, Eye, ChevronRight, Cake, Award, Sparkles, MapPin, Briefcase, TrendingUp, Users, Building, X, FileText } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { useToast } from "@/components/common/Toast";
import { useState, useEffect } from "react";
import { newsService } from "@/services/newsService";
import celebrationService from "@/services/celebrationService";
import { useTheme } from "@/components/common/ThemeProvider";

// Featured News Component
const FeaturedNewsCard = ({ news, darkMode, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="cursor-pointer group mb-8"
    >
      <div className="relative h-[360px] rounded-3xl overflow-hidden shadow-2xl">
        <img 
          src={news.image_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200'} 
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {news.category_name && (
          <div className="absolute top-5 left-5 bg-almet-sapphire text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
            {news.category_name}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span className="text-almet-sapphire text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">
            Latest Update
          </span>
          <h2 className="text-white text-2xl md:text-3xl font-bold mb-2 leading-tight">
            {news.title}
          </h2>
          <p className="text-white/90 text-sm mb-3 line-clamp-2">
            {news.excerpt || news.content}
          </p>
          <div className="flex items-center gap-3 text-white/80 text-xs">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(news.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {news.view_count} views
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Birthday Card Component
const BirthdayCard = ({ celebration, darkMode, onCelebrate, isCelebrated }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateOnly = date.toISOString().split('T')[0];
    const todayOnly = today.toISOString().split('T')[0];
    const tomorrowOnly = tomorrow.toISOString().split('T')[0];
    
    if (dateOnly === todayOnly) return 'Today';
    if (dateOnly === tomorrowOnly) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isToday = () => {
    const date = new Date(celebration.date).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const todayCheck = isToday();

  return (
    <div className={`bg-white dark:bg-almet-cloud-burst rounded-2xl p-5 shadow-lg border ${
      todayCheck 
        ? 'border-almet-sapphire dark:border-almet-steel-blue ring-2 ring-almet-sapphire/20 dark:ring-almet-steel-blue/20' 
        : 'border-almet-mystic dark:border-almet-san-juan'
    } text-center relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
      
      {todayCheck && (
        <>
         
          <div className="absolute top-2 right-2 bg-almet-sapphire text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
            Today
          </div>
        </>
      )}
      
      <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl">
        🎂
      </div>
      
      <h4 className="font-bold text-sm text-almet-cloud-burst dark:text-white mb-0.5">
        {celebration.employee_name}
      </h4>
      <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-2">
        {celebration.position}
      </p>
      
      <div className={`flex items-center justify-center gap-1 text-[10px] mb-3 px-2 py-1 bg-almet-mystic/30 dark:bg-almet-san-juan/30 rounded-lg ${
        todayCheck 
          ? 'text-almet-sapphire dark:text-almet-steel-blue font-medium' 
          : 'text-almet-waterloo dark:text-almet-bali-hai'
      }`}>
        <Calendar className="h-3 w-3" />
        <span>{formatDate(celebration.date)}</span>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCelebrate(celebration);
        }}
        disabled={isCelebrated}
        className={`w-full py-2 rounded-lg text-[10px] font-semibold transition-all ${
          isCelebrated
            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 cursor-default'
            : 'bg-almet-sapphire text-white hover:bg-almet-astral'
        }`}
      >
        {isCelebrated ? '✓ Wished' : '🎉 Send Wishes'}
      </button>
    </div>
  );
};

// Work Anniversary Item
const AnniversaryItem = ({ celebration, darkMode, onCelebrate, isCelebrated }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateOnly = date.toISOString().split('T')[0];
    const todayOnly = today.toISOString().split('T')[0];
    const tomorrowOnly = tomorrow.toISOString().split('T')[0];
    
    if (dateOnly === todayOnly) return 'Today';
    if (dateOnly === tomorrowOnly) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isToday = () => {
    const date = new Date(celebration.date).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const todayCheck = isToday();

  return (
    <div className={`flex items-center justify-between py-3 border-b last:border-0 ${
      todayCheck 
        ? 'border-almet-sapphire/30 dark:border-almet-steel-blue/30 bg-almet-sapphire/5 dark:bg-almet-steel-blue/5 px-2 rounded-lg -mx-2' 
        : 'border-almet-mystic dark:border-almet-comet'
    }`}>
      <div className="flex items-center gap-3 flex-1">
        <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white">
          <Award className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-xs text-almet-cloud-burst dark:text-white">
              {celebration.employee_name}
            </h4>
            {todayCheck && (
              <span className="bg-almet-sapphire text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                Today
              </span>
            )}
          </div>
          <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai">
            {celebration.position}
          </p>
          <div className={`flex items-center gap-1 text-[9px] mt-0.5 ${
            todayCheck 
              ? 'text-almet-sapphire dark:text-almet-steel-blue font-medium' 
              : 'text-almet-waterloo dark:text-almet-bali-hai'
          }`}>
            <Calendar className="h-2.5 w-2.5" />
            <span>{formatDate(celebration.date)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
          {celebration.years} {celebration.years === 1 ? 'Year' : 'Years'}
        </span>
        {!isCelebrated && (
          <button
            onClick={() => onCelebrate(celebration)}
            className="text-almet-sapphire dark:text-almet-steel-blue hover:bg-almet-sapphire/10 dark:hover:bg-almet-steel-blue/10 p-1.5 rounded-lg transition-all"
          >
            🎉
          </button>
        )}
      </div>
    </div>
  );
};

// Vacancy Card Component
const VacancyCard = ({ darkMode }) => {
  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl overflow-hidden shadow-lg border border-almet-mystic dark:border-almet-san-juan min-w-[260px] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <img 
        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400" 
        alt="Job"
        className="w-full h-28 object-cover"
      />
      <div className="p-4">
        <h4 className="font-bold text-sm text-almet-cloud-burst dark:text-white mb-1">
          Senior UX Designer
        </h4>
        <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai flex items-center gap-1 mb-3">
          <MapPin className="h-3 w-3" />
          Design Studio • Posted Dec 24
        </p>
        <Link href="/structure/open-positions">
          <button className="w-full bg-almet-sapphire/10 dark:bg-almet-steel-blue/10 text-almet-sapphire dark:text-almet-steel-blue hover:bg-almet-sapphire hover:text-white dark:hover:bg-almet-steel-blue py-2 rounded-lg text-[10px] font-semibold transition-all">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
};

// News List Item
const NewsListItem = ({ news, darkMode, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="flex items-start justify-between py-3 border-b border-almet-mystic dark:border-almet-comet last:border-0 cursor-pointer group hover:bg-almet-mystic/30 dark:hover:bg-almet-san-juan/30 px-2 rounded-lg transition-all"
    >
      <div className="flex-1">
        <h4 className="font-bold text-xs text-almet-cloud-burst dark:text-white mb-1 group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors">
          {news.title}
        </h4>
        <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai line-clamp-2 mb-1">
          {news.excerpt || news.content}
        </p>
        <span className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai">
          {new Date(news.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
};

// Referral Widget Component
const ReferralWidget = ({ darkMode }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-almet-cloud-burst dark:to-almet-san-juan rounded-2xl overflow-hidden shadow-2xl">
      <div className="relative h-28 bg-gradient-to-br from-yellow-400 to-orange-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 p-5">
          <h2 className="text-yellow-300 text-lg font-extrabold uppercase tracking-wider">
            Inspector Gadget
          </h2>
        </div>
      </div>
      <div className="p-5 text-center">
        <p className="text-white/90 text-xs mb-4">
          Refer your talented friends to open positions and earn mystery rewards up to $1,500!
        </p>
        <button className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-2.5 text-xs rounded-xl transition-all">
          Submit Referral
        </button>
      </div>
    </div>
  );
};

// News Detail Modal
const NewsDetailModal = ({ isOpen, onClose, news, darkMode }) => {
  if (!isOpen || !news) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${
          darkMode ? 'bg-almet-cloud-burst' : 'bg-white'
        }`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-72">
          <img
            src={news.image_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200'}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/90 hover:bg-white text-gray-800 shadow-lg transition-all"
          >
            <X size={18} />
          </button>

          <div className="absolute bottom-5 left-5 right-5">
            {news.category_name && (
              <div className="bg-almet-sapphire text-white px-3 py-1 rounded-xl text-[10px] font-medium inline-flex items-center gap-1 mb-2">
                <FileText size={12} />
                {news.category_name}
              </div>
            )}
            <h2 className="text-white text-xl font-bold mb-2">{news.title}</h2>
          </div>
        </div>

        <div className="p-6">
          {news.excerpt && (
            <p className="text-almet-sapphire dark:text-almet-steel-blue font-semibold text-base mb-3">
              {news.excerpt}
            </p>
          )}
          <p className={`leading-relaxed whitespace-pre-line text-sm ${
            darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
          }`}>
            {news.content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function GeneralWorkspace() {
  const { darkMode } = useTheme();
  const toast = useToast();
  
  const [allNews, setAllNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [showNewsModal, setShowNewsModal] = useState(false);
  
  const [todayBirthdays, setTodayBirthdays] = useState([]);
  const [workAnniversaries, setWorkAnniversaries] = useState([]);
  const [loadingCelebrations, setLoadingCelebrations] = useState(true);
  const [celebratedItems, setCelebratedItems] = useState(new Set());
  const today = new Date().toISOString().split('T')[0];
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";

  useEffect(() => {
    loadAllNews();
    loadCelebrations();
    loadCelebratedItems();
  }, []);

  const loadAllNews = async () => {
    setLoadingNews(true);
    try {
      const response = await newsService.getNews({
        page: 1,
        page_size: 10,
        is_published: true,
        ordering: '-is_pinned,-published_at'
      });
      setAllNews(response.results || []);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  const loadCelebrations = async () => {
  setLoadingCelebrations(true);
  try {
    const allCelebrations = await celebrationService.getAllCelebrations();
    
    const today = new Date().toISOString().split('T')[0];
    
    // Filter birthdays and anniversaries
    const birthdays = allCelebrations.filter(c => c.type === 'birthday');
    const anniversaries = allCelebrations.filter(c => c.type === 'work_anniversary');
    
    // Sort function: today's first, then by date
    const sortByDateWithTodayFirst = (a, b) => {
      const dateA = new Date(a.date).toISOString().split('T')[0];
      const dateB = new Date(b.date).toISOString().split('T')[0];
      
      // If a is today and b is not, a comes first
      if (dateA === today && dateB !== today) return -1;
      // If b is today and a is not, b comes first
      if (dateB === today && dateA !== today) return 1;
      // Otherwise sort by date
      return new Date(dateA) - new Date(dateB);
    };
    
    // Sort both arrays
    birthdays.sort(sortByDateWithTodayFirst);
    anniversaries.sort(sortByDateWithTodayFirst);
    
    setTodayBirthdays(birthdays.slice(0, 4));
    setWorkAnniversaries(anniversaries.slice(0, 4));
  } catch (error) {
    console.error('Failed to load celebrations:', error);
  } finally {
    setLoadingCelebrations(false);
  }
};

  const loadCelebratedItems = () => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(`celebrated_${today}`);
    if (stored) {
      setCelebratedItems(new Set(JSON.parse(stored)));
    }
  };

  const saveCelebratedItem = (itemId) => {
    const today = new Date().toISOString().split('T')[0];
    const newCelebrated = new Set([...celebratedItems, itemId]);
    setCelebratedItems(newCelebrated);
    localStorage.setItem(`celebrated_${today}`, JSON.stringify([...newCelebrated]));
  };

  const handleCelebrate = async (celebration) => {
    if (celebratedItems.has(celebration.id)) return;

    try {
      await celebrationService.addAutoWish(
        celebration.employee_id,
        celebration.type,
        '🎉'
      );
      saveCelebratedItem(celebration.id);
      toast.showSuccess('Wishes sent successfully!');
    } catch (error) {
      console.error('Error celebrating:', error);
      toast.showError('Failed to send wishes');
    }
  };

  const handleNewsClick = async (news) => {
    try {
      const fullNews = await newsService.getNewsById(news.id);
      setSelectedNews(fullNews);
      setShowNewsModal(true);
    } catch (error) {
      console.error('Failed to load news details:', error);
      setSelectedNews(news);
      setShowNewsModal(true);
    }
  };

  const featuredNews = allNews[0];
  const otherNews = allNews.slice(1);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured News */}
          {!loadingNews && featuredNews && (
            <FeaturedNewsCard 
              news={featuredNews} 
              darkMode={darkMode}
              onClick={() => handleNewsClick(featuredNews)}
            />
          )}

          {/* Today's Birthdays */}
          {!loadingCelebrations && todayBirthdays.length > 0 && (
            <div>
              <h2 className={`text-lg font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                <Cake className="h-5 w-5 text-pink-500" />
                Upcoming Birthdays
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {todayBirthdays.map((celebration) => (
                  <BirthdayCard
                  today={today}
                    key={celebration.id}
                    celebration={celebration}
                    darkMode={darkMode}
                    onCelebrate={handleCelebrate}
                    isCelebrated={celebratedItems.has(celebration.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Internal Vacancies */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
                <Briefcase className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" />
                Internal Vacancies
              </h2>
              <Link href="/structure/open-positions" className="text-almet-sapphire dark:text-almet-steel-blue text-xs font-semibold hover:underline">
                View All
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3">
              <VacancyCard darkMode={darkMode} />
              <VacancyCard darkMode={darkMode} />
            </div>
          </div>

          {/* More News */}
          {!loadingNews && otherNews.length > 0 && (
            <div className={`${bgCard} rounded-2xl p-5 shadow-lg border ${borderColor}`}>
              <h2 className={`text-base font-bold ${textPrimary} mb-3`}>More News</h2>
              <div>
                {otherNews.slice(0, 5).map((news) => (
                  <NewsListItem
                    key={news.id}
                    news={news}
                    darkMode={darkMode}
                    onClick={() => handleNewsClick(news)}
                  />
                ))}
              </div>
              <Link href="/communication/company-news">
                <button className="w-full mt-3 bg-almet-sapphire/10 dark:bg-almet-steel-blue/10 text-almet-sapphire dark:text-almet-steel-blue hover:bg-almet-sapphire hover:text-white dark:hover:bg-almet-steel-blue py-2.5 text-xs rounded-xl font-semibold transition-all">
                  View All Company News
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Sidebar - 1/3 width */}
        <div className="space-y-5">
          {/* Referral Widget */}
          <ReferralWidget darkMode={darkMode} />

          {/* Work Anniversaries */}
          {!loadingCelebrations && workAnniversaries.length > 0 && (
            <div className={`${bgCard} rounded-2xl p-5 shadow-lg border ${borderColor}`}>
              <h3 className={`text-base font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
                <Award className="h-4 w-4 text-purple-500" />
                Work Anniversaries
              </h3>
              <div>
                {workAnniversaries.map((celebration) => (
                  <AnniversaryItem
                    key={celebration.id}
                    celebration={celebration}
                    onCelebrate={handleCelebrate}
                    isCelebrated={celebratedItems.has(celebration.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* News Detail Modal */}
      <NewsDetailModal
        isOpen={showNewsModal}
        onClose={() => {
          setShowNewsModal(false);
          setSelectedNews(null);
        }}
        news={selectedNews}
        darkMode={darkMode}
      />
    </DashboardLayout>
  );
}