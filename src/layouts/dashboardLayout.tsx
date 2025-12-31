import React, { useState } from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import { IoIosNotificationsOutline, IoIosArrowForward } from "react-icons/io";
import { FaRegQuestionCircle } from "react-icons/fa";
import { useOnboardingStore } from "../global/store";
import Images from "@/components/images";
import { useGetNotification } from "@/hooks/useAdmin";
import NotificationsSidebar from "@/components/NotificationsSidebar";

const DashboardLayout: React.FC = () => {
  const { data: notifications } = useGetNotification();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const datas = useOnboardingStore();
  const { pathname } = useLocation();

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const navData = [
    {
      id: 1,
      title: "Home",
      URL: "home",
    },
    {
      id: 3,
      title: "Bookings",
      URL: "bookings",
    },
    {
      id: 8,
      title: "Account",
      URL: "account",
    },
  ];

  const handleStart = pathname.split("/")[1] === "" ? true : false;

  return (
    <main className="overflow-hidden bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[999] bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-8 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={Images.logodark} className="h-[40px]" alt="resque logo" />
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-8">
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
          <div className="flex items-center gap-6">
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

            {/* Info Icon */}
            <FaRegQuestionCircle className="text-[20px] text-gray-500 cursor-pointer hover:text-[#E86229] transition-colors" />

            {/* Profile Section */}
            <Link
              to="/account"
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img
                alt="avatar"
                src={datas?.avatar || Images?.avatar}
                className="w-8 h-8 object-contain rounded-full"
              />
              <span className="text-sm text-[#344054] font-medium hidden md:block">
                {datas?.email || "yemi.c@gmail.com"}
              </span>
              <IoIosArrowForward className="text-[16px] text-gray-500 hidden md:block" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 min-h-screen bg-[#fff]">
        <section className={pathname === "/" || pathname === "/home" ? "p-0" : "px-6 py-6"}>
          <Outlet />
        </section>
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
