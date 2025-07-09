import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import EditProfileModal from '../components/EditProfileModal';
import logo2 from '../assets/logo2.jpg';

const StaffPortal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, isAdmin, isPartner, currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  // Close the profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuRef]);
  
  const isLoginPage = location.pathname === "/staffportal/login";
  const isReportsPage = location.pathname === "/staffportal/reports";
  const isDashboardPage = location.pathname === "/staffportal" || location.pathname === "/staffportal/";
  const isStaffPage = isDashboardPage || isReportsPage;
  const isAdminPage = location.pathname === "/staffportal/admin";
  const isPartnerPage = location.pathname === "/staffportal/partners";

  // Authentication protection only
  useEffect(() => {
    // Handle login/logout redirects
    if (!isAuthenticated && !isLoginPage) {
      navigate('/staffportal/login', { replace: true });
    } else if (isAuthenticated && isLoginPage) {
      navigate('/staffportal', { replace: true });
    }
  }, [isAuthenticated, isLoginPage, navigate]);

  // Separate effect for role-based redirects to prevent loops
  useEffect(() => {
    // Skip handling role-based redirects during these conditions
    if (!isAuthenticated || isLoginPage) return;
    
    // Store the current pathname to detect if we need to prevent redirects
    const currentPath = location.pathname;
    let redirectPath = '';
    
    // Admin and Partner route protection
    if (isAdminPage && !isAdmin) {
      redirectPath = '/staffportal';
    }
    else if (isPartnerPage && !(isPartner || isAdmin)) {
      redirectPath = '/staffportal';
    }
    // Redirect admin to admin dashboard instead of staff dashboard
    else if (isAdmin && isDashboardPage) {
      redirectPath = '/staffportal/admin';
    }
    // Prevent admins and partners from accessing reports page
    else if ((isPartner || isAdmin) && isReportsPage) {
      redirectPath = isAdmin ? '/staffportal/admin' : '/staffportal/partners';
    }
    // Redirect partners to partner dashboard
    else if (isPartner && !isAdmin && isDashboardPage) {
      redirectPath = '/staffportal/partners';
    }
    
    // Only navigate if redirect path is set and different from current
    if (redirectPath && redirectPath !== currentPath) {
      navigate(redirectPath, { replace: true });
    }
  }, [location.pathname, isAdmin, isAdminPage, isAuthenticated, isDashboardPage, isLoginPage, isPartner, isPartnerPage, isReportsPage, navigate]);

  // Helper for active link that handles both exact matches and subpaths
  const isActive = (path: string) => {
    // Exact match
    if (location.pathname === path) return true;
    
    // For "/staffportal" route, only match exact to avoid highlighting when in subdirectories
    if (path === "/staffportal" && location.pathname !== "/staffportal") return false;
    
    // Special case for subpaths
    if (path !== "/staffportal" && location.pathname.startsWith(path)) return true;
    
    return false;
  };

  return (
    <>
      {/* Header */}
      <header className="w-full fixed top-0 left-0   supports-[backdrop-filter]:bg-[#0647a6]/90 z-50 shadow-xl transition-all duration-200">
        <nav className={` ${location.pathname === "/staffportal/login" ? 'py-4' : 'py-3' } container mx-auto flex items-center justify-between  px-4 sm:px-6`}>
          <Link to="/" className="flex items-center transition-transform hover:scale-105">
            <img src={logo2} alt="Ahmed-Abdul&co" className="w-[35px] h-auto sm:ml-0 rounded-md shadow-sm"/>
            <span className="ml-3 text-white font-bold text-lg hidden sm:block">Ahmed Abdul & Co</span>
          </Link>
          
          {/* Desktop menu */}
          <ul className="hidden sm:flex items-center list-none gap-8">
            {isAuthenticated && (
              <>   
                {/* Dashboard links based on role */}
                {isAdmin ? (
                  <li>
                    <Link to="/staffportal/admin" className={`no-underline font-semibold text-base ${isActive('/staffportal/admin') ? 'text-white bg-blue-900/70 px-3 py-1 rounded-md shadow-inner' : 'text-gray-100 hover:text-white'}`}>Admin</Link>
                  </li>
                ) : isPartner && !isAdmin ? (
                  <li>
                    <Link to="/staffportal/partners" className={`no-underline font-semibold text-base ${isActive('/staffportal/partners') ? 'text-white bg-blue-900/70 px-3 py-1 rounded-md shadow-inner' : 'text-gray-100 hover:text-white'}`}>Managing Partner</Link>
                  </li>
                ) : (
                  <li>
                    <Link to="/staffportal" className={`no-underline font-semibold text-base ${isActive('/staffportal') ? 'text-white bg-blue-900/70 px-3 py-1 rounded-md shadow-inner' : 'text-gray-100 hover:text-white'}`} >Dashboard</Link>
                  </li>
                )}
                
                {/* Reports link only for regular staff (not managing partners or admins) */}
                {!isPartner && !isAdmin && (
                  <li>
                    <Link to="/staffportal/reports" className={`no-underline font-semibold text-base ${isActive('/staffportal/reports') ? 'text-white bg-blue-900/70 px-3 py-1 rounded-md shadow-inner' : 'text-gray-100 hover:text-white'}`} >Reports</Link>
                  </li>
                )}
              </>
            )}
          </ul>
          
          {/* Right section with user profile */}
          <div className="flex items-center">
            {!isAuthenticated && isLoginPage && (  <h3 className=" text-white font-bold mr-4 hidden sm:block">STAFF PORTAL</h3>)}
            { isAuthenticated && isStaffPage && (
              <h3 className="text-sm text-white font-bold mr-4 hidden sm:block">STAFF PORTAL</h3>
            )}
            
            {isAuthenticated && currentUser && (
              <div className="relative hidden sm:block" ref={profileMenuRef}>
                <button 
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 text-white transition-all duration-200 shadow-sm border border-blue-300/30"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-9 h-9 rounded-full bg-[#052659] flex items-center justify-center text-white font-semibold shadow-inner border-2 border-blue-300">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="text-white text-sm font-semibold">{currentUser.name}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`text-white transition-transform duration-300 ${profileMenuOpen ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                
                {/* Profile dropdown */}
                <div 
                  className={`absolute right-0 mt-3 w-60 bg-white rounded-lg shadow-2xl overflow-hidden z-50 transition-all duration-300 transform origin-top-right border border-gray-200
                    ${profileMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
                >
                  <div className="py-4 px-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#052659] flex items-center justify-center text-white font-bold shadow-md border-2 border-blue-200">
                        {currentUser.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{currentUser.name}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{isAdmin ? 'Administrator' : isPartner ? 'Managing Partner' : 'Staff'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                      onClick={() => {
                        setEditProfileModalOpen(true);
                        setProfileMenuOpen(false);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
                        <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
                      </svg>
                      Edit Profile
                    </button>
                    <hr className="border-gray-200 my-1" />
                    
                    {/* Dashboard link - show appropriate dashboard based on role */}
                    {isAdmin ? (
                      <Link 
                        to="/staffportal/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        Admin Dashboard
                      </Link>
                    ) : isPartner ? (
                      <Link 
                        to="/staffportal/partners"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="9" y1="9" x2="15" y2="9"></line>
                          <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                        Partner Dashboard
                      </Link>
                    ) : (
                      <Link 
                        to="/staffportal"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                          <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        Dashboard
                      </Link>
                    )}
                    
                    {/* Only show reports link for regular staff (not managing partners or admins) */}
                    {!isPartner && !isAdmin && (
                      <>
                        <Link 
                          to="/staffportal/reports" 
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                          Reports
                        </Link>
                        <hr className="border-gray-200 my-1" />
                      </>
                    )}
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-gray-100 text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button
              className="sm:hidden block text-white p-2 focus:outline-none  hover:bg-blue-700 rounded-md transition-colors duration-200"
              onClick={() => setMenuOpen(m => !m)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </nav>
        
        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden fixed top-[60px] left-0 right-0 bg-[#052659] border-t-2 border-blue-700 shadow-xl overflow-hidden z-40">
            <div className="max-h-[calc(100vh-72px)] overflow-y-auto">
              <ul className="flex flex-col p-4">
                {isAuthenticated && (
                  <>
                    {/* Show dashboard link based on role */}
                    {isAdmin ? (
                      <li className="my-2">
                        <Link 
                          to="/staffportal/admin" 
                          className={`no-underline font-bold text-lg block py-3 px-4 rounded-md ${isActive('/staffportal/admin') ? 'bg-blue-700 text-white shadow-md' : 'text-white hover:bg-blue-700 transition-colors'}`} 
                          aria-current={isActive('/staffportal/admin') ? 'page' : undefined} 
                          onClick={() => setMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            Admin Dashboard
                          </div>
                        </Link>
                      </li>
                    ) : isPartner ? (
                      <li className="my-2">
                        <Link 
                          to="/staffportal/partners" 
                          className={`no-underline font-bold text-lg block py-3 px-4 rounded-md ${isActive('/staffportal/partners') ? 'bg-blue-700 text-white shadow-md' : 'text-white hover:bg-blue-700 transition-colors'}`}
                          aria-current={isActive('/staffportal/partners') ? 'page' : undefined} 
                          onClick={() => setMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="9" y1="9" x2="15" y2="9"></line>
                              <line x1="9" y1="15" x2="15" y2="15"></line>
                            </svg>
                            Partner Dashboard
                          </div>
                        </Link>
                      </li>
                    ) : (
                      <li className="my-2">
                        <Link 
                          to="/staffportal" 
                          className={`no-underline font-bold text-lg block py-3 px-4 rounded-md ${isActive('/staffportal') ? 'bg-blue-700 text-white shadow-md' : 'text-white hover:bg-blue-700 transition-colors'}`}
                          onClick={() => setMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                              <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                            Dashboard
                          </div>
                        </Link>
                      </li>
                    )}
                    
                    {/* Only regular staff can see reports (not managing partners or admins) */}
                    {!isPartner && !isAdmin && (
                      <li className="my-2">
                        <Link 
                          to="/staffportal/reports" 
                          className={`no-underline font-bold text-lg block py-3 px-4 rounded-md ${isActive('/staffportal/reports') ? 'bg-blue-700 text-white shadow-md' : 'text-white hover:bg-blue-700 transition-colors'}`}
                          onClick={() => setMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            Reports
                          </div>
                        </Link>
                      </li>
                    )}
                  </>
                )}
              </ul>
              
              {isAuthenticated && currentUser && (
                <div className="p-4 border-t border-blue-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#052659] flex items-center justify-center text-white font-bold">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold">{currentUser.name}</div>
                      <div className="text-xs text-blue-200">{isAdmin ? 'Administrator' : isPartner ? 'Managing Partner' : 'Staff'}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button 
                      onClick={() => { setEditProfileModalOpen(true); setMenuOpen(false); }}
                      className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded text-md font-semibold w-full flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
                        <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
                      </svg>
                      Edit Profile
                    </button>
                    <button 
                      onClick={() => { logout(); setMenuOpen(false); }} 
                      className="bg-[#052659] hover:bg-blue-900 text-white px-4 py-2 rounded text-md font-semibold w-full flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      
      {/* Main content */}
      <main className={`${isLoginPage && 'bg-[url(./assets/logo1.jpg)] bg-no-repeat  bg-contain bg-center'} container  mx-auto py-24  px-4 sm:px-6 `}>

        <Outlet />
      </main>

      {/* Footer */}
      {!isLoginPage && isAuthenticated && (
        <footer className=" mt-auto  bg-[#0647a6] shadow-lg ">
          <div className="container mx-auto py-5 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-4">
              <div className="flex flex-col items-center sm:items-start">
                <Link to="/" className="flex items-center mb-3 transition-transform hover:scale-105">
                  <img src={logo2} alt="Ahmed-Abdul&co" className="w-[60px] h-auto rounded-md shadow-sm"/>
                  <span className="ml-2 text-white font-bold text-lg">Ahmed Abdul & Co</span>
                </Link>
                <p className="text-center sm:text-left text-white text-sm">
                  Professional accounting services since 1995
                </p>
              </div>
              
              <div className="flex flex-col items-center sm:items-start">
                <h3 className="text-white font-bold mb-2 text-lg">Quick Links</h3>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Show appropriate dashboard link based on role */}
                  {isAdmin ? (
                    <Link to="/staffportal/admin" className="no-underline text-blue-100 hover:text-white hover:underline transition-colors">Admin Dashboard</Link>
                  ) : isPartner ? (
                    <Link to="/staffportal/partners" className="no-underline text-blue-100 hover:text-white hover:underline transition-colors">Partner Dashboard</Link>
                  ) : (
                    <Link to="/staffportal" className="no-underline text-blue-100 hover:text-white hover:underline transition-colors">Staff Dashboard</Link>
                  )}
                  
                  {/* Only regular staff can access reports */}
                  {!isPartner && !isAdmin && (
                    <Link to="/staffportal/reports" className="no-underline text-blue-100 hover:text-white hover:underline transition-colors">Reports</Link>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-center sm:items-start">
                <h3 className="text-white font-bold mb-2 text-lg">Contact</h3>
                <div className="flex items-center text-blue-100 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span>info@ahmedabdul.com</span>
                </div>
                <div className="flex items-center text-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span>+234 123 4567 890</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-blue-900 pt-4 mt-2 text-center">
              <p className="text-center text-white text-sm font-medium">
                &copy; {new Date().getFullYear()} Ahmed Abdul & Co. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      )}
      {/* bg-gradient-to-r from-[#052659] to-[#0a5fde] */}
      
      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={editProfileModalOpen} 
        onClose={() => setEditProfileModalOpen(false)} 
      />
    </>
  );
};

export default StaffPortal;