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
      className="cursor-pointer group mb-12"
    >
      <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-2xl">
        <img 
          src={news.image_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200'} 
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {news.category_name && (
          <div className="absolute top-6 left-6 bg-almet-sapphire text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
            {news.category_name}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <span className="text-almet-sapphire text-xs font-bold uppercase tracking-wider mb-2 inline-block">
            Latest Update
          </span>
          <h2 className="text-white text-3xl md:text-4xl font-bold mb-3 leading-tight">
            {news.title}
          </h2>
          <p className="text-white/90 text-base mb-4 line-clamp-2">
            {news.excerpt || news.content}
          </p>
          <div className="flex items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(news.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
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
  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-6 shadow-lg border border-almet-mystic dark:border-almet-san-juan text-center relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="absolute top-3 right-3 bg-almet-sapphire text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase">
        Today
      </div>
      
      <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl">
        🎂
      </div>
      
      <h4 className="font-bold text-base text-almet-cloud-burst dark:text-white mb-1">
        {celebration.employee_name}
      </h4>
      <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-4">
        {celebration.position}
      </p>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCelebrate(celebration);
        }}
        disabled={isCelebrated}
        className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${
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
const AnniversaryItem = ({ celebration, onCelebrate, isCelebrated }) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-almet-mystic dark:border-almet-comet last:border-0">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white">
          <Award className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-almet-cloud-burst dark:text-white">
            {celebration.employee_name}
          </h4>
          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
            {celebration.position}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
          {celebration.years} {celebration.years === 1 ? 'Year' : 'Years'}
        </span>
        {!isCelebrated && (
          <button
            onClick={() => onCelebrate(celebration)}
            className="text-almet-sapphire dark:text-almet-steel-blue hover:bg-almet-sapphire/10 dark:hover:bg-almet-steel-blue/10 p-2 rounded-lg transition-all"
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
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl overflow-hidden shadow-lg border border-almet-mystic dark:border-almet-san-juan min-w-[280px] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <img 
        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400" 
        alt="Job"
        className="w-full h-32 object-cover"
      />
      <div className="p-5">
        <h4 className="font-bold text-base text-almet-cloud-burst dark:text-white mb-2">
          Senior UX Designer
        </h4>
        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai flex items-center gap-1 mb-3">
          <MapPin className="h-3 w-3" />
          Design Studio • Posted Dec 24
        </p>
        <Link href="/structure/open-positions">
          <button className="w-full bg-almet-sapphire/10 dark:bg-almet-steel-blue/10 text-almet-sapphire dark:text-almet-steel-blue hover:bg-almet-sapphire hover:text-white dark:hover:bg-almet-steel-blue py-2 rounded-lg text-xs font-semibold transition-all">
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
      className="flex items-start justify-between py-4 border-b border-almet-mystic dark:border-almet-comet last:border-0 cursor-pointer group hover:bg-almet-mystic/30 dark:hover:bg-almet-san-juan/30 px-2 rounded-lg transition-all"
    >
      <div className="flex-1">
        <h4 className="font-bold text-sm text-almet-cloud-burst dark:text-white mb-1 group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors">
          {news.title}
        </h4>
        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai line-clamp-2 mb-2">
          {news.excerpt || news.content}
        </p>
        <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
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
      <div className="relative h-36 bg-gradient-to-br from-yellow-400 to-orange-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 p-6">
          <h2 className="text-yellow-300 text-xl font-extrabold uppercase tracking-wider">
            Inspector Gadget
          </h2>
        </div>
      </div>
      <div className="p-6 text-center">
        <p className="text-white/90 text-sm mb-5">
          Refer your talented friends to open positions and earn mystery rewards up to $1,500!
        </p>
        <button className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 rounded-xl transition-all">
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
        <div className="relative h-80">
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
            <X size={20} />
          </button>

          <div className="absolute bottom-6 left-6 right-6">
            {news.category_name && (
              <div className="bg-almet-sapphire text-white px-3 py-1.5 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 mb-3">
                <FileText size={14} />
                {news.category_name}
              </div>
            )}
            <h2 className="text-white text-2xl font-bold mb-2">{news.title}</h2>
          </div>
        </div>

        <div className="p-8">
          {news.excerpt && (
            <p className="text-almet-sapphire dark:text-almet-steel-blue font-semibold text-lg mb-4">
              {news.excerpt}
            </p>
          )}
          <p className={`leading-relaxed whitespace-pre-line text-base ${
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
      
      const birthdays = allCelebrations.filter(c => 
        c.type === 'birthday' && c.date.split('T')[0] === today
      );
      
      const anniversaries = allCelebrations.filter(c => 
        c.type === 'work_anniversary'
      ).slice(0, 4);
      
      setTodayBirthdays(birthdays.slice(0, 3));
      setWorkAnniversaries(anniversaries);
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
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
              <h2 className={`text-2xl font-bold ${textPrimary} mb-6 flex items-center gap-2`}>
                <Cake className="h-6 w-6 text-pink-500" />
                Today's Birthdays
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {todayBirthdays.map((celebration) => (
                  <BirthdayCard
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
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${textPrimary} flex items-center gap-2`}>
                <Briefcase className="h-6 w-6 text-almet-sapphire dark:text-almet-steel-blue" />
                Internal Vacancies
              </h2>
              <Link href="/structure/open-positions" className="text-almet-sapphire dark:text-almet-steel-blue text-sm font-semibold hover:underline">
                View All
              </Link>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4">
              <VacancyCard darkMode={darkMode} />
              <VacancyCard darkMode={darkMode} />
            </div>
          </div>

          {/* More News */}
          {!loadingNews && otherNews.length > 0 && (
            <div className={`${bgCard} rounded-2xl p-6 shadow-lg border ${borderColor}`}>
              <h2 className={`text-xl font-bold ${textPrimary} mb-4`}>More News</h2>
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
                <button className="w-full mt-4 bg-almet-sapphire/10 dark:bg-almet-steel-blue/10 text-almet-sapphire dark:text-almet-steel-blue hover:bg-almet-sapphire hover:text-white dark:hover:bg-almet-steel-blue py-3 rounded-xl font-semibold transition-all">
                  View All Company News
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Referral Widget */}
          <ReferralWidget darkMode={darkMode} />

          {/* Work Anniversaries */}
          {!loadingCelebrations && workAnniversaries.length > 0 && (
            <div className={`${bgCard} rounded-2xl p-6 shadow-lg border ${borderColor}`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                <Award className="h-5 w-5 text-purple-500" />
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

          {/* Quick Resources */}
          <div className={`${bgCard} rounded-2xl p-6 shadow-lg border ${borderColor}`}>
            <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Quick Resources</h3>
            <div className="space-y-3">
              <Link href="/structure/org-chart">
                <button className="w-full text-left bg-almet-mystic/30 dark:bg-almet-san-juan/30 hover:bg-almet-mystic/50 dark:hover:bg-almet-san-juan/50 p-4 rounded-xl transition-all flex items-center gap-3">
                  <Building className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" />
                  <span className={`font-semibold text-sm ${textPrimary}`}>Organization Chart</span>
                </button>
              </Link>
              <Link href="/communication/company-news">
                <button className="w-full text-left bg-almet-mystic/30 dark:bg-almet-san-juan/30 hover:bg-almet-mystic/50 dark:hover:bg-almet-san-juan/50 p-4 rounded-xl transition-all flex items-center gap-3">
                  <FileText className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" />
                  <span className={`font-semibold text-sm ${textPrimary}`}>About Almet Group</span>
                </button>
              </Link>
            </div>
          </div>
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