import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import OnboardingLayout from "../layouts/OnboardingLayout";
import Login from "../pages/auth/login/login";
import AuthPath from "../pages/auth/authPath";
import LoadingScreen from "../pages/dashboard/common/LoadingScreen";
import MainRouter from "./mainRouter";
import BPDListing from "@/pages/dashboard/screens/setup/BPD/BPDListing";
import BookingScreen from "@/pages/dashboard/screens/home/bookingScreen";
import PaymentLayout from "@/pages/payment/PaymentLayout";
import DeleteAccount from "@/pages/dashboard/screens/account/DeleteAccount";
import AccountSupport from "@/pages/dashboard/screens/account/Support";



const TransactionsLayout = lazy(() =>
  import("../pages/dashboard/screens/transactions/transactiosLayout")
);
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
const OperationsLayout = lazy(() => 
  import("../pages/dashboard/screens/operations/operationsLayout")
);
const AddOperatorLayout = lazy(() => 
  import("@/pages/dashboard/screens/operations/addOperatorsLayout")
);
const RoadRescue = lazy(() => 
  import("@/pages/dashboard/screens/operations/roadRescue/roadRescue")
);  
const TeamsLayout = lazy(() => 
  import("@/pages/dashboard/screens/teams/teamsLayout")
);    
const AddTeams = lazy(() => 
  import("@/pages/dashboard/screens/teams/addTeams")
);    
const CustomersLayout = lazy(() => 
  import("@/pages/dashboard/screens/customers/customersLayout")
);  

const RevenueLayout = lazy(() => 
  import("@/pages/dashboard/screens/revenue/RevenueLayout")
);   

const SetupCategories = lazy(() => 
  import("@/pages/dashboard/screens/setup/SetupCategories")
);    
const GeneralCostLayout = lazy(() => 
  import("@/pages/dashboard/screens/setup/generalCostPoints/generalLayout")
);    
const StakeHolderLayout = lazy(() =>
  import("@/pages/dashboard/screens/setup/stakeHolder/stakeHolderLayout")
);
const ServiceCost = lazy(() =>
  import("@/pages/dashboard/screens/setup/serviceCost/ServiceCost")
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
        path: "/transactions",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <TransactionsLayout />
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
        path: "/operators",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <OperationsLayout />
          </Suspense>
        ),
      },
      {
        path: "/operators/add",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <AddOperatorLayout />
          </Suspense>
        ),
      },
      {
        path: "/operators/roadrescue/:id",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <RoadRescue />
          </Suspense>
        ),
      },
      {
        path: "/revenue",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <RevenueLayout />
          </Suspense>
        ),
      },
      {
        path: "/teams",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <TeamsLayout />
          </Suspense>
        ),
      },
      {
        path: "/setup",
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <SetupCategories />
              </Suspense>
            ),
          },
          {
            path: "general-cost-points",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <GeneralCostLayout />
              </Suspense>
            ),
          },
          {
            path: "stakeholder-disbursement",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <StakeHolderLayout />
              </Suspense>
            ),
          },
          {
            path: "services-cost",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ServiceCost />
              </Suspense>
            ),
          },
          {
            path: "business-process-documentation",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <BPDListing />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "/teams/add",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <AddTeams />
          </Suspense>
            ),
      },
      {
        path: "/customers",
        element:(
          <Suspense fallback={<LoadingScreen/>}>
            <CustomersLayout/>
          </Suspense>
        ),
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

