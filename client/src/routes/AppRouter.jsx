import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { SubscriptionGate } from "../components/SubscriptionGate";
import { MemberGate } from "../components/MemberGate";
import { Home } from "../pages/public/Home";
import { Pricing } from "../pages/public/Pricing";
import { About } from "../pages/public/About";
import { Contact } from "../pages/public/Contact";
import { Privacy, Refund, Terms } from "../pages/public/LegalPages";
import { GymWebsite } from "../pages/public/GymWebsite";
import { CheckIn } from "../pages/CheckIn";
import { ForgotPassword, Login, Register, ResetPassword } from "../pages/auth/AuthPages";
import { PlaceholderPage } from "../pages/dashboard/PlaceholderPage";

// Dashboard pages are lazy-loaded — they pull in the charts library and aren't
// needed until a user signs in, so they're split out of the initial bundle.
const named = (factory, name) => lazy(() => factory().then((m) => ({ default: m[name] })));
const admin = () => import("../pages/dashboard/AdminPages");
const owner = () => import("../pages/dashboard/OwnerPages");
const trainer = () => import("../pages/dashboard/TrainerPages");
const member = () => import("../pages/dashboard/MemberPages");

const AdminDashboard = named(admin, "AdminDashboard");
const AdminGyms = named(admin, "AdminGyms");
const AdminRevenue = named(admin, "AdminRevenue");
const AdminSubscriptions = named(admin, "AdminSubscriptions");
const AdminUsers = named(admin, "AdminUsers");
const Settings = named(admin, "Settings");

const OwnerDashboard = named(owner, "OwnerDashboard");
const GymProfile = named(owner, "GymProfile");
const MembershipPlans = named(owner, "MembershipPlans");
const Trainers = named(owner, "Trainers");
const Members = named(owner, "Members");
const Renewals = named(owner, "Renewals");
const Payments = named(owner, "Payments");
const OwnerAttendance = named(owner, "OwnerAttendance");
const DietPlans = named(owner, "DietPlans");
const WorkoutPlans = named(owner, "WorkoutPlans");
const Analytics = named(owner, "Analytics");

const TrainerDashboard = named(trainer, "TrainerDashboard");
const AssignedMembers = named(trainer, "AssignedMembers");
const TrainerDietPlans = named(trainer, "TrainerDietPlans");
const TrainerWorkoutPlans = named(trainer, "TrainerWorkoutPlans");

const MemberDashboard = named(member, "MemberDashboard");
const MemberDietPlan = named(member, "MemberDietPlan");
const MemberPayments = named(member, "MemberPayments");
const MemberWorkoutPlan = named(member, "MemberWorkoutPlan");
const MembershipPage = named(member, "MembershipPage");

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/pricing", element: <Pricing /> },
      { path: "/about", element: <About /> },
      { path: "/contact", element: <Contact /> },
      { path: "/terms", element: <Terms /> },
      { path: "/privacy", element: <Privacy /> },
      { path: "/refund", element: <Refund /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> }
    ]
  },
  // The gym's public website + door check-in stand alone — no FitManager chrome.
  { path: "/gym/:slug", element: <GymWebsite /> },
  { path: "/gym/:slug/checkin", element: <CheckIn /> },
  {
    element: <ProtectedRoute roles={["platform_admin"]} />,
    children: [{
      path: "/admin",
      element: <DashboardLayout role="platform_admin" />,
      children: [
        { index: true, element: <AdminDashboard /> },
        { path: "gyms", element: <AdminGyms /> },
        { path: "subscriptions", element: <AdminSubscriptions /> },
        { path: "revenue", element: <AdminRevenue /> },
        { path: "users", element: <AdminUsers /> },
        { path: "settings", element: <Settings title="Platform Settings" /> }
      ]
    }]
  },
  {
    element: <ProtectedRoute roles={["gym_owner"]} />,
    children: [{
      element: <SubscriptionGate />,
      children: [{
        path: "/owner",
        element: <DashboardLayout role="gym_owner" />,
        children: [
          { index: true, element: <OwnerDashboard /> },
          { path: "profile", element: <GymProfile /> },
          { path: "plans", element: <MembershipPlans /> },
          { path: "trainers", element: <Trainers /> },
          { path: "members", element: <Members /> },
          { path: "renewals", element: <Renewals /> },
          { path: "payments", element: <Payments /> },
          { path: "attendance", element: <OwnerAttendance /> },
          { path: "diet-plans", element: <DietPlans /> },
          { path: "workout-plans", element: <WorkoutPlans /> },
          { path: "analytics", element: <Analytics /> },
          { path: "settings", element: <Settings title="Gym Settings" /> }
        ]
      }]
    }]
  },
  {
    element: <ProtectedRoute roles={["trainer"]} />,
    children: [{
      path: "/trainer",
      element: <DashboardLayout role="trainer" />,
      children: [
        { index: true, element: <TrainerDashboard /> },
        { path: "members", element: <AssignedMembers /> },
        { path: "diet-plans", element: <TrainerDietPlans /> },
        { path: "workout-plans", element: <TrainerWorkoutPlans /> },
        { path: "settings", element: <Settings title="Settings" /> }
      ]
    }]
  },
  {
    element: <ProtectedRoute roles={["member"]} />,
    children: [{
      element: <MemberGate />,
      children: [{
        path: "/member",
        element: <DashboardLayout role="member" />,
        children: [
          { index: true, element: <MemberDashboard /> },
          { path: "membership", element: <MembershipPage /> },
          { path: "payments", element: <MemberPayments /> },
          { path: "workout-plan", element: <MemberWorkoutPlan /> },
          { path: "diet-plan", element: <MemberDietPlan /> },
          { path: "settings", element: <Settings title="Settings" /> }
        ]
      }]
    }]
  },
  { path: "/dashboard", element: <Navigate to="/owner" replace /> },
  { path: "*", element: <PlaceholderPage title="Page Not Found" /> }
]);
