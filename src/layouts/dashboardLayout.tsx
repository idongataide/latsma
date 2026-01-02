import React, { useState } from "react";
import { Outlet, NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  IoIosNotificationsOutline, 
  IoIosArrowForward, 
  IoIosHome, 
  IoIosCalendar, 
  IoIosPerson,
  IoIosLogOut 
} from "react-icons/io";
import { useOnboardingStore } from "../global/store";
import Images from "@/components/images";
import { useGetNotification } from "@/hooks/useAdmin";
import NotificationsSidebar from "@/components/NotificationsSidebar";

const DashboardLayout: React.FC = () => {
  const { data: notifications } = useGetNotification();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const datas = useOnboardingStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const handleLogout = () => {
      useOnboardingStore.persist.clearStorage(); 
      localStorage.clear(); 
      sessionStorage.clear(); 
      useOnboardingStore.setState({ 
        token: null, 
        isAuthorized: false, 
        firstName: "", 
        lastName: "" 
      });
    navigate("/login");
  };

  const navData = [
    {
      id: 1,
      title: "Home",
      URL: "home",
      icon: <IoIosHome className="text-2xl" />,
    },
    {
      id: 3,
      title: "Bookings",
      URL: "bookings",
      icon: <IoIosCalendar className="text-2xl" />,
    },
    {
      id: 8,
      title: "Account",
      URL: "account",
      icon: <IoIosPerson className="text-2xl" />,
    },
  ];

  const handleStart = pathname.split("/")[1] === "" ? true : false;

  return (
    <main className="overflow-hidden bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[999] bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 md:px-8 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={Images.logodark} className="h-[40px]" alt="resque logo" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navData.map((item) => (
              <NavLink
                to={`/${item.URL}`}
                key={item.id}
                className={({ isActive }) =>
                  `text-base font-medium transition-colors ${
                    isActive || (handleStart && item.URL === "home")
                      ? "text-[#E86229] border-b-2 border-[#E86229] pb-1"
                      : "text-[#344054] hover:text-[#E86229]"
                  }`
                }
              >
                {item.title}
              </NavLink>
            ))}
          </nav>

          {/* Right Side Icons and Profile */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Notification Icon */}
            <div className="relative">
              <IoIosNotificationsOutline
                onClick={toggleNotifications}
                className="text-[24px] text-gray-500 cursor-pointer hover:text-[#E86229] transition-colors"
              />
              {notifications && notifications.length > 0 && (
                <span
                  onClick={toggleNotifications}
                  className="absolute -top-1 -right-1 h-5 w-5 text-[11px] inline-flex items-center justify-center px-1.5 py-0.5 text-xs leading-none text-[#fff] bg-[#FF6C2D] rounded-full cursor-pointer"
                >
                  {notifications.length}
                </span>
              )}
            </div>

            {/* Desktop Profile Section */}
            <Link
              to="/account"
              className="hidden md:flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img
                alt="avatar"
                src={datas?.avatar || Images?.avatar}
                className="w-8 h-8 object-contain rounded-full"
              />
              <span className="text-sm text-[#344054] font-medium">
                {datas?.email || "yemi.c@gmail.com"}
              </span>
              <IoIosArrowForward className="text-[16px] text-gray-500" />
            </Link>
            
            {/* Desktop Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-[#E86229] transition-colors cursor-pointer"
              title="Logout"
            >
              <IoIosLogOut className="text-[18px]" />
              <span className="hidden lg:inline">Logout</span>
            </button>
            
            {/* Mobile Profile Icon */}
            <Link
              to="/account"
              className="md:hidden flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img
                alt="avatar"
                src={datas?.avatar || Images?.avatar}
                className="w-8 h-8 object-contain rounded-full"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 min-h-screen bg-[#fff] pb-16 md:pb-0">
        <section className={pathname === "/" || pathname === "/home" ? "p-0" : "md:px-6 p-0 py-6"}>
          <Outlet />
        </section>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-[999] bg-white border-t border-gray-200 md:hidden">
        <div className="flex items-center justify-around py-3">
          {navData.map((item) => (
            <NavLink
              to={`/${item.URL}`}
              key={item.id}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center transition-colors ${
                  isActive || (handleStart && item.URL === "home")
                    ? "text-[#E86229]"
                    : "text-gray-500"
                }`
              }
            >
              <div className="text-2xl">
                {item.icon}
              </div>
              <span className="text-xs mt-1 font-medium">
                {item.title}
              </span>
            </NavLink>
          ))}
          
          {/* Mobile Logout Button */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center text-gray-500 hover:text-[#E86229] transition-colors cursor-pointer"
            title="Logout"
          >
            <IoIosLogOut className="text-2xl" />
            <span className="text-xs mt-1 font-medium">
              Logout
            </span>
          </button>
        </div>
      </div>

      <NotificationsSidebar
        isOpen={isNotificationsOpen}
        onClose={toggleNotifications}
        notifications={notifications || []}
      />
    </main>
  );
};

export default DashboardLayout;