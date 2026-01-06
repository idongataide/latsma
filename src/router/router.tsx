import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import OnboardingLayout from "../layouts/OnboardingLayout";
import Login from "../pages/auth/login/login";
import AuthPath from "../pages/auth/authPath";
import LoadingScreen from "../pages/dashboard/common/LoadingScreen";
import MainRouter from "./mainRouter";
import BookingScreen from "@/pages/dashboard/screens/home/bookingScreen";
import PaymentLayout from "@/pages/payment/PaymentLayout";
import DeleteAccount from "@/pages/dashboard/screens/account/DeleteAccount";
import AccountSupport from "@/pages/dashboard/screens/account/Support";




const PaymentSearch = lazy(() => 
  import('@/pages/payment/search')
);
const PaymentBanner = lazy(() => 
  import('@/pages/payment/PaymentBanner')
);

const Landing = lazy(() =>
  import("@/pages/dashboard/screens/home/landing")
);
const BookingLayout = lazy(() =>
  import("../pages/dashboard/screens/bookings/bookingLayout")
);
const BookingDetails = lazy(() =>
  import("../pages/dashboard/screens/bookings/bookingDetails")
);


// Account components
const AccountLayout = lazy(() => import("@/pages/dashboard/screens/account/AccountLayout"));
const Profile = lazy(() => import("@/pages/dashboard/screens/account/Profile"));
const ChangePassword = lazy(() => import("@/pages/dashboard/screens/account/ChangePassword"));
const Passcode = lazy(() => import("@/pages/dashboard/screens/account/Passcode"));

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <MainRouter />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Landing />
          </Suspense>
        ),
      },
      {
        path: "/home",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Landing />
          </Suspense>
        ),
      },
      {
        path: "/home/booking",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <BookingScreen />
          </Suspense>
        ),
      },      
      {
        path: "/bookings",
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <BookingLayout />
              </Suspense>
            ),
          },
          {
            path: ":id",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <BookingDetails />
              </Suspense>
            ),
          },
        ],
      },
      
      {
        path: "/account",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <AccountLayout />
          </Suspense>
        ),
        children: [
          { index: true, element: <Profile /> }, // Default route for /account
          { path: 'change-password', element: <ChangePassword /> },
          { path: 'delete-account', element: <DeleteAccount /> },
          { path: 'support', element: <AccountSupport /> },
          { path: 'passcode', element: <Passcode /> },
        ],
      },
      {
        path: "*",
        element: <div>Work in Progress</div>,
      },
    ],
  },

  {
    path: "/login",
    element: <OnboardingLayout />,
    children: [
      { index: true, element: <Login />},
      { path: "forgot-password", element: <AuthPath /> },

    ],
  },
  {
    path: "/payment",
    element: <PaymentLayout />,
    children: [
      {
        // This renders the banner on /payment
        index: true, // or path: "" for empty path
        element: <PaymentBanner />
      },
      {
        path: "search",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <PaymentSearch />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <>Invalid Route</>,
  },
]);

