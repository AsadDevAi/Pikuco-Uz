import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { SignIn, SignUp, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

import Layout from './components/layout/Layout';

import HomePage from './pages/home/HomePage';
import TestsPage from './pages/tests/TestsPage';
import TestDetailPage from './pages/tests/TestDetailPage';
import CreateTestPage from './pages/tests/CreateTestPage';
import PostsPage from './pages/posts/PostsPage';
import PostDetailPage from './pages/posts/PostDetailPage';
import CreatePostPage from './pages/posts/CreatePostPage';
import TopPage from './pages/top/TopPage';
import ProfilePage from './pages/profile/ProfilePage';
import SquadsPage from './pages/squads/SquadsPage';

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/tests" element={<TestsPage />} />
            <Route path="/tests/:id" element={<TestDetailPage />} />
            <Route
              path="/create-test"
              element={
                <RequireAuth>
                  <CreateTestPage />
                </RequireAuth>
              }
            />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route
              path="/create-post"
              element={
                <RequireAuth>
                  <CreatePostPage />
                </RequireAuth>
              }
            />
            <Route path="/top" element={<TopPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/squads" element={<SquadsPage />} />
            <Route path="/squads/:id" element={<SquadsPage />} />
          </Route>

          <Route 
            path="/login/*" 
            element={
              <div className="min-h-screen flex items-center justify-center p-6 bg-base">
                <SignIn routing="path" path="/login" signUpUrl="/register" />
              </div>
            } 
          />
          <Route 
            path="/register/*" 
            element={
              <div className="min-h-screen flex items-center justify-center p-6 bg-base">
                <SignUp routing="path" path="/register" signInUrl="/login" />
              </div>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
