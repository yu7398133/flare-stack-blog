import "./styles/index.css";
import type { ThemeComponents } from "@/features/theme/contract/components";
import { Toaster } from "./components/toaster";
import { config } from "./config";
import { AuthLayout } from "./layouts/auth-layout";
import { PublicLayout } from "./layouts/public-layout";
import { UserLayout } from "./layouts/user-layout";
import { AboutPage } from "./pages/about";
import { ForgotPasswordPage } from "./pages/auth/forgot-password";
import { LoginPage } from "./pages/auth/login";
import { RegisterPage } from "./pages/auth/register";
import { ResetPasswordPage } from "./pages/auth/reset-password";
import { VerifyEmailPage } from "./pages/auth/verify-email";
import { FriendLinksPage, FriendLinksPageSkeleton } from "./pages/friend-links";
import { HomePage, HomePageSkeleton } from "./pages/home";
import { MomentsPage, MomentsPageSkeleton } from "./pages/moments";
import { PhotoWallPage, PhotoWallPageSkeleton } from "./pages/photo-wall";
import { PostPage, PostPageSkeleton } from "./pages/post";
import { PostsPage, PostsPageSkeleton } from "./pages/posts";
import { ProjectsPage, ProjectsPageSkeleton } from "./pages/projects";
import { SearchPage } from "./pages/search";
import { SubmitFriendLinkPage } from "./pages/submit-friend-link";
import { TimelinePage, TimelinePageSkeleton } from "./pages/timeline";
import { ProfilePage } from "./pages/user/profile";
import { getFuwariThemeStyle } from "./theme-style";

/**
 * Theme: fuwari — implements the full ThemeComponents contract.
 * TypeScript will error at compile time if any required component is missing.
 */
export default {
  config,
  getDocumentStyle: getFuwariThemeStyle,
  HomePage,
  HomePageSkeleton,
  PostsPage,
  PostsPageSkeleton,
  PostPage,
  PostPageSkeleton,
  PublicLayout,
  AuthLayout,
  UserLayout,
  FriendLinksPage,
  FriendLinksPageSkeleton,
  SearchPage,
  SubmitFriendLinkPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
  ProfilePage,
  PhotoWallPage,
  PhotoWallPageSkeleton,
  MomentsPage,
  MomentsPageSkeleton,
  ProjectsPage,
  ProjectsPageSkeleton,
  AboutPage,
  TimelinePage,
  TimelinePageSkeleton,
  Toaster,
} satisfies ThemeComponents;
