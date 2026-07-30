import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts and route guards load with the shell — every route needs them, so
// splitting them would only add a round trip.
import Layout from "../layout/Layout";
import ScrollToTop from "../components/ScrollToTop";
import RequireAuth from "../components/auth/RequireAuth";
import RouteFallback from "../components/shared/RouteFallback";

// Everything below is code-split. The whole site used to ship as one ~593 kB
// bundle that had to parse before the first pixel; now a visitor downloads the
// shell plus the page they asked for, and the rest arrives on navigation.
const Home = lazy(() => import("../pages/Home"));
const Categories = lazy(() => import("../pages/Categories"));
const Products = lazy(() => import("../pages/Products"));
const ProductDetail = lazy(() => import("../pages/ProductDetail"));
const Cart = lazy(() => import("../pages/Cart"));
const Checkout = lazy(() => import("../pages/Checkout"));
const PaymentCallback = lazy(() => import("../pages/PaymentCallback"));
const OrderReceived = lazy(() => import("../pages/OrderReceived"));
const CustomWig = lazy(() => import("../pages/CustomWig"));
const Consultation = lazy(() => import("../pages/Consultation"));
const Skincare = lazy(() => import("../pages/Skincare"));

const AccountLayout = lazy(() => import("../pages/Account/AccountLayout"));
const AccountOverview = lazy(() => import("../pages/Account/Overview"));
const Orders = lazy(() => import("../pages/Account/Orders"));
const OrderDetail = lazy(() => import("../pages/Account/TrackOrder"));
const CustomHair = lazy(() => import("../pages/Account/CustomHair"));
const CustomHairNewRequest = lazy(
  () => import("../pages/Account/CustomHair/NewRequest"),
);
const SkincareConsultations = lazy(() => import("../pages/Account/Skincare"));
const AddressBook = lazy(() => import("../pages/Account/AddressBook"));
const NewAddress = lazy(() => import("../pages/Account/AddressBook/NewAddress"));
const Settings = lazy(() => import("../pages/Account/Settings"));
const BasicDetails = lazy(() => import("../pages/Account/Settings/BasicDetails"));
const ChangeEmail = lazy(() => import("../pages/Account/Settings/ChangeEmail"));
const AccountChangePassword = lazy(
  () => import("../pages/Account/Settings/ChangePassword"),
);

// Auth Pages
const Register = lazy(() => import("../pages/Auth/Register"));
const Login = lazy(() => import("../pages/Auth/Login"));
const ConfirmEmail = lazy(() => import("../pages/Auth/ConfirmEmail"));
const GetStarted = lazy(() => import("../pages/Auth/GetStarted"));
const CreatePassword = lazy(() => import("../pages/Auth/CreatePassword"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"));
const VerifyForgotPassword = lazy(
  () => import("../pages/Auth/VerifyForgotPassword"),
);
const ChangePassword = lazy(() => import("../pages/Auth/ChangePassword"));
const GoogleComplete = lazy(() => import("../pages/Auth/GoogleComplete"));

function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* One boundary around the whole tree: chunk swaps show the shared
          fallback instead of each route inventing its own. */}
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Main Site Branch (Shares MainLayout navbar) */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/products" element={<Products />} />
            {/* Products are addressed by slug — that's the key `GET
                /products/{slug}` takes. */}
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            {/* Paystack returns here; the page verifies the reference
                server-side before anything is treated as paid. */}
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="/custom-wig" element={<CustomWig />} />
            <Route path="/consultation" element={<Consultation />} />
            <Route path="/skincare" element={<Skincare />} />
            <Route path="/skincare-clinic" element={<Skincare />} />

            {/* Every account screen needs a session — they all read `user` from
                AuthContext and call the account API. Checkout and the order
                receipt sit here too: /checkout, /cart and /orders are all
                token-only on the API, so there's no guest path to support. */}
            <Route element={<RequireAuth />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route
                path="/order-received/:orderNumber"
                element={<OrderReceived />}
              />
              <Route path="/account" element={<AccountLayout />}>
                <Route index element={<AccountOverview />} />
                <Route path="overview" element={<AccountOverview />} />
                <Route path="orders" element={<Orders />} />
                {/* One detail screen for every order state — it reads the
                    order and picks its variant from `status`. */}
                <Route path="orders/:orderNumber" element={<OrderDetail />} />
                <Route path="custom-hair" element={<CustomHair />} />
                <Route
                  path="custom-hair/new"
                  element={<CustomHairNewRequest />}
                />
                <Route
                  path="skincare-consultations"
                  element={<SkincareConsultations />}
                />
                <Route path="address-book" element={<AddressBook />} />
                {/* One form, two modes — the edit route prefills from the saved
                    address and PATCHes it. */}
                <Route path="address-book/new" element={<NewAddress />} />
                <Route
                  path="address-book/:addressId/edit"
                  element={<NewAddress />}
                />
                <Route path="settings" element={<Settings />} />
                <Route
                  path="settings/basic-details"
                  element={<BasicDetails />}
                />
                <Route path="settings/change-email" element={<ChangeEmail />} />
                <Route
                  path="settings/change-password"
                  element={<AccountChangePassword />}
                />
              </Route>
            </Route>
          </Route>

          {/* Auth pages (standalone, no shared layout) */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/create-password" element={<CreatePassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/verify-forgot-password"
            element={<VerifyForgotPassword />}
          />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/complete-google-profile" element={<GoogleComplete />} />

          {/* Catch-all 404 Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
