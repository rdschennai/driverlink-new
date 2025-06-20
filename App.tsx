import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Booking, BookingStatus, View, User, TripType } from './types';
import { SAMPLE_BOOKINGS } from './constants'; 
import BookingList from './components/BookingList';
import BookingForm from './components/BookingForm';
import { LoadingSpinner } from './components/LoadingSpinner';
import Sidebar from './components/Sidebar';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import ActualBookingHistoryPage from './components/ActualBookingHistoryPage';
import LoginPage from './components/LoginPage'; 
import SignupPage from './components/SignupPage'; 
import { useLanguage } from './contexts/LanguageContext';
import { useNotification } from './contexts/NotificationContext';
import { useAuth } from './contexts/AuthContext'; 

type TabId = 'personal' | 'my-shared' | 'available-bookings' | 'my-active-trips';

interface TabConfig {
  id: TabId;
  translationKey: string; 
  listType: 'personal' | 'available-shared' | 'my-offered' | 'my-active-rides';
}

const App: React.FC = () => {
  const { t } = useLanguage();
  const { triggerNewBookingNotification } = useNotification();
  const { 
    currentUser, 
    isAuthenticated, 
    isLoading: isAuthLoading, 
    authError, 
    setAuthError 
  } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>(SAMPLE_BOOKINGS); // Starts empty now
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [bookingOpError, setBookingOpError] = useState<string | null>(null); 
  const [showBookingForm, setShowBookingForm] = useState<boolean>(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [activeDashboardTab, setActiveDashboardTab] = useState<TabId>('personal');
  const [activeView, setActiveView] = useState<View>('login'); 
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthLoading) {
      if (isAuthenticated && (activeView === 'login' || activeView === 'signup')) {
        setActiveView('dashboard'); 
      } else if (!isAuthenticated && activeView !== 'signup') {
        setActiveView('login'); 
      }
    }
  }, [isAuthenticated, isAuthLoading, activeView]);

  // activeUserId is now derived from currentUser directly where needed or passed as currentUser?.id

  const handleViewChange = useCallback((view: View) => {
    setActiveView(view);
    setIsMobileSidebarOpen(false); 
    setAuthError(null); 
    if (view !== 'dashboard') { 
        setShowBookingForm(false);
        setEditingBooking(null);
    }
  }, [setAuthError]);

  const handleAddBooking = useCallback((newBookingData: Omit<Booking, 'id' | 'status' | 'originalDriverId' | 'claimedByDriverId'>) => {
    if (!currentUser) {
      setBookingOpError(t("authErrorGeneric")); // Or a more specific message
      return;
    }
    setIsLoading(true);
    setBookingOpError(null);
    setTimeout(() => {
      setBookings(prev => [
        ...prev,
        {
          ...newBookingData,
          id: `booking-${Date.now()}`,
          status: BookingStatus.PERSONAL,
          originalDriverId: currentUser.id, 
        } as Booking, 
      ]);
      setIsLoading(false);
      setShowBookingForm(false);
      setEditingBooking(null);
    }, 500);
  }, [currentUser, t, setIsLoading, setBookingOpError, setBookings, setShowBookingForm, setEditingBooking]);

  const handleUpdateBooking = useCallback((updatedBookingData: Booking) => {
    setIsLoading(true);
    setBookingOpError(null);
    setTimeout(() => {
      setBookings(prev => prev.map(b => b.id === updatedBookingData.id ? {...b, ...updatedBookingData} : b));
      setIsLoading(false);
      setShowBookingForm(false);
      setEditingBooking(null);
    }, 500);
  }, [setIsLoading, setBookingOpError, setBookings, setShowBookingForm, setEditingBooking]);

  const handleOfferBooking = useCallback((bookingId: string) => {
    if (!currentUser) return;
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId && b.status === BookingStatus.PERSONAL && b.originalDriverId === currentUser.id
          ? { ...b, status: BookingStatus.OFFERED }
          : b
      )
    );
  }, [currentUser, setBookings]);

  const handleClaimBooking = useCallback((bookingId: string) => {
    if (!currentUser) return;
     setBookings(prev =>
      prev.map(b =>
        b.id === bookingId && b.status === BookingStatus.OFFERED
          ? { ...b, status: BookingStatus.ASSIGNED, claimedByDriverId: currentUser.id }
          : b
      )
    );
  }, [currentUser, setBookings]);

  const handleAssignToSelf = useCallback((bookingId: string) => {
    if (!currentUser) return;
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId && b.status === BookingStatus.PERSONAL && b.originalDriverId === currentUser.id
          ? { ...b, status: BookingStatus.ASSIGNED, claimedByDriverId: currentUser.id }
          : b
      )
    );
  }, [currentUser, setBookings]);

  const handleCancelOffer = useCallback((bookingId: string) => {
    if (!currentUser) return;
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId && b.status === BookingStatus.OFFERED && b.originalDriverId === currentUser.id
          ? { ...b, status: BookingStatus.PERSONAL }
          : b
      )
    );
  }, [currentUser, setBookings]);
  
  const handleEditBooking = useCallback((booking: Booking) => {
    setEditingBooking(booking);
    setShowBookingForm(true);
    setActiveView('dashboard'); 
  }, [setEditingBooking, setShowBookingForm, setActiveView]);

  const updateRideStatus = useCallback((bookingId: string, newStatus: BookingStatus) => {
    if (!currentUser) return;
    setBookings(prev => prev.map(b => b.id === bookingId && b.claimedByDriverId === currentUser.id ? { ...b, status: newStatus } : b));
  }, [currentUser, setBookings]);

  const handleConfirmRide = useCallback((bookingId: string) => updateRideStatus(bookingId, BookingStatus.CONFIRMED), [updateRideStatus]);
  const handleStartTrip = useCallback((bookingId: string) => updateRideStatus(bookingId, BookingStatus.ON_TRIP), [updateRideStatus]);
  const handleUpdateToOnTrip = useCallback((bookingId: string) => updateRideStatus(bookingId, BookingStatus.ON_TRIP), [updateRideStatus]);
  const handleEndTrip = useCallback((bookingId: string) => updateRideStatus(bookingId, BookingStatus.TRIP_ENDED), [updateRideStatus]);
  const handleCompleteRide = useCallback((bookingId: string) => updateRideStatus(bookingId, BookingStatus.COMPLETED), [updateRideStatus]);

  const handleCancelBooking = useCallback((bookingId: string) => {
    if (!currentUser) return;
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const canCancelPersonal = b.status === BookingStatus.PERSONAL && b.originalDriverId === currentUser.id;
        const canCancelOffered = b.status === BookingStatus.OFFERED && b.originalDriverId === currentUser.id;
        const canCancelActiveRide = b.claimedByDriverId === currentUser.id && 
                                    [BookingStatus.ASSIGNED, BookingStatus.CONFIRMED].includes(b.status);
        
        if (canCancelPersonal || canCancelOffered || canCancelActiveRide) {
          return { ...b, status: BookingStatus.CANCELLED };
        }
      }
      return b;
    }));
  }, [currentUser, setBookings]);

  const myPersonalBookings = useMemo(() => bookings.filter(b => b.status === BookingStatus.PERSONAL && currentUser && b.originalDriverId === currentUser.id), [bookings, currentUser]);
  const myOfferedBookings = useMemo(() => bookings.filter(b => currentUser && b.originalDriverId === currentUser.id && (b.status === BookingStatus.OFFERED || b.status === BookingStatus.TAKEN_BY_OTHER)), [bookings, currentUser]);
  const availableToClaimBookings = useMemo(() => bookings.filter(b => b.status === BookingStatus.OFFERED && (!currentUser || b.originalDriverId !== currentUser.id)), [bookings, currentUser]);
  
  const myActiveRides = useMemo(() => bookings.filter(b => 
    currentUser && b.claimedByDriverId === currentUser.id &&
    [
      BookingStatus.ASSIGNED, 
      BookingStatus.CONFIRMED, 
      BookingStatus.ON_TRIP, 
      BookingStatus.TRIP_ENDED 
    ].includes(b.status)
  ), [bookings, currentUser]);

  const myHistoricalBookings = useMemo(() => bookings.filter(b => 
    currentUser && (b.originalDriverId === currentUser.id || b.claimedByDriverId === currentUser.id) &&
    [BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(b.status)
  ), [bookings, currentUser]);


  useEffect(() => {
    triggerNewBookingNotification(availableToClaimBookings);
  }, [availableToClaimBookings, triggerNewBookingNotification]);


  const DASHBOARD_TABS: TabConfig[] = [
    { id: 'personal', translationKey: 'dashboardTabPersonal', listType: 'personal' },
    { id: 'my-shared', translationKey: 'dashboardTabShared', listType: 'my-offered' },
    { id: 'available-bookings', translationKey: 'dashboardTabAvailable', listType: 'available-shared' },
    { id: 'my-active-trips', translationKey: 'dashboardTabActive', listType: 'my-active-rides' },
  ];

  const getBookingsForDashboardTab = (tabId: TabId): Booking[] => {
    switch (tabId) {
      case 'personal': return myPersonalBookings;
      case 'my-shared': return myOfferedBookings;
      case 'available-bookings': return availableToClaimBookings;
      case 'my-active-trips': return myActiveRides;
      default: return [];
    }
  };

  const currentDashboardTabConfig = DASHBOARD_TABS.find(tab => tab.id === activeDashboardTab);
  const currentDashboardBookings = currentDashboardTabConfig ? getBookingsForDashboardTab(currentDashboardTabConfig.id) : [];

  const renderDashboardTabContent = () => (
    <>
      <div className="mb-6 border-b border-gray-300">
        <nav className="flex flex-wrap gap-x-1 gap-y-2 pb-2 sm:gap-x-2" aria-label={t('dashboardTabPersonal')}>
          {DASHBOARD_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDashboardTab(tab.id)}
              className={`flex-1 text-center px-2 py-1.5 font-medium text-xs rounded-t-lg transition-colors duration-150 border-b-2 
                sm:px-3 sm:py-2 sm:text-sm 
                md:px-4 md:py-3
                ${activeDashboardTab === tab.id
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-sky-600 hover:border-gray-300'
                }`}
              aria-current={activeDashboardTab === tab.id ? 'page' : undefined}
            >
              {t(tab.translationKey)}
              <span className={`ml-1 px-1.5 py-0.5 text-xs font-semibold rounded-full 
                sm:ml-2 sm:px-2
                ${activeDashboardTab === tab.id 
                  ? 'bg-sky-500 text-white' 
                  : 'bg-gray-200 text-gray-700'}`}>
                {getBookingsForDashboardTab(tab.id).length}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {currentDashboardTabConfig && (
        <BookingList
          title={t(currentDashboardTabConfig.translationKey)}
          bookings={currentDashboardBookings}
          listType={currentDashboardTabConfig.listType}
          activeUserId={currentUser?.id}
          onOffer={handleOfferBooking}
          onClaim={handleClaimBooking}
          onAssignToSelf={currentDashboardTabConfig.listType === 'personal' ? handleAssignToSelf : undefined}
          onCancelOffer={handleCancelOffer}
          onEdit={handleEditBooking}
          onConfirmRide={handleConfirmRide}
          onStartTrip={handleStartTrip}
          onUpdateToOnTrip={handleUpdateToOnTrip}
          onEndTrip={handleEndTrip}
          onCompleteRide={handleCompleteRide}
          onCancelBooking={handleCancelBooking}
        />
      )}
    </>
  );

  const renderDashboardWithForm = () => (
    <div className="lg:flex lg:gap-x-6">
      <div className={`transition-all duration-300 ease-in-out ${showBookingForm ? "lg:w-3/5 xl:w-2/3" : "w-full"}`}>
        {renderDashboardTabContent()}
      </div>
      {showBookingForm && (
        <div className="lg:w-2/5 xl:w-1/3 mt-6 lg:mt-0">
          <BookingForm
            onClose={() => { setShowBookingForm(false); setEditingBooking(null); }}
            onSubmit={(bookingData) => {
              if (editingBooking) {
                handleUpdateBooking({ ...editingBooking, ...bookingData } as Booking);
              } else {
                 handleAddBooking(bookingData as Omit<Booking, 'id' | 'status' | 'originalDriverId' | 'claimedByDriverId'>);
              }
            }}
            existingBooking={editingBooking}
          />
        </div>
      )}
    </div>
  );

  const renderActiveView = () => {
    if (isAuthLoading) {
      return (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <LoadingSpinner size="lg" color="text-sky-500" />
        </div>
      );
    }

    if (!isAuthenticated) {
      if (activeView === 'signup') return <SignupPage setActiveView={handleViewChange} />;
      return <LoginPage setActiveView={handleViewChange} />; 
    }

    switch (activeView) {
      case 'profile':
        return <ProfilePage />;
      case 'dashboard':
        return renderDashboardWithForm();
      case 'history':
        return <ActualBookingHistoryPage bookings={myHistoricalBookings} onEdit={handleEditBooking} activeUserId={currentUser?.id} />;
      case 'settings':
        return <SettingsPage />;
      default: 
        return renderDashboardWithForm(); 
    }
  };

  if (!isAuthenticated && !isAuthLoading) {
    return renderActiveView();
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
      {isAuthenticated && (
        <header className="py-4 px-4 sm:px-8 shadow-md bg-white sticky top-0 z-20 md:ml-64 transition-all duration-300 ease-in-out">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <button
                className="md:hidden mr-3 p-2 text-gray-600 hover:text-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label={t('sidebarOpenMenu')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-sky-600">
                {t('appName')}
              </h1>
            </div>
            {activeView === 'dashboard' && (
              <button
                  onClick={() => { setEditingBooking(null); setShowBookingForm(!showBookingForm); }} 
                  className={`${showBookingForm ? 'bg-red-500 hover:bg-red-600' : 'bg-sky-500 hover:bg-sky-600'} text-white font-semibold py-2 px-3 sm:px-4 rounded-lg shadow hover:shadow-md transition-all duration-300 ease-in-out flex items-center text-sm sm:text-base`}
                  aria-label={showBookingForm ? t('bookingFormCancel') : t('newBookingButton')}
                  aria-expanded={showBookingForm}
              >
                  {showBookingForm ? (
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  )}
                  {showBookingForm ? t('bookingFormCancel') : t('newBookingButton')}
              </button>
            )}
          </div>
        </header>
      )}

      {bookingOpError && (
         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4 rounded-md shadow-lg container mx-auto md:ml-64" role="alert">
          <p className="font-bold">{t('errorTitle')}</p>
          <p>{bookingOpError}</p>
        </div>
      )}

      {isLoading && ( 
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <LoadingSpinner size="lg" color="text-sky-500" />
          <p className="ml-3 text-xl text-gray-700">{t('processing')}</p>
        </div>
      )}
      
       {isAuthLoading && !currentUser && (
        <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-[100]">
          <LoadingSpinner size="lg" color="text-sky-600" />
          <p className="ml-4 text-xl text-gray-700">Loading application...</p>
        </div>
      )}
      
      {isMobileSidebarOpen && isAuthenticated && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      {isAuthenticated && ( 
        <Sidebar 
          activeView={activeView} 
          setActiveView={handleViewChange} 
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        />
      )}
      
      {isAuthenticated && ( 
        <div className="flex flex-1 md:ml-64 transition-all duration-300 ease-in-out">
          <main className="flex-grow p-4 sm:p-6 transition-all duration-300 ease-in-out w-full">
            <div className="container mx-auto">
              {renderActiveView()}
            </div>
          </main>
        </div>
      )}

      {isAuthenticated && ( 
        <footer className="text-center py-4 text-sm text-gray-500 bg-gray-200 border-t border-gray-300 md:ml-64 transition-all duration-300 ease-in-out">
          {t('footerText')}
        </footer>
      )}
    </div>
  );
};

export default App;