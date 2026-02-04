import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { useAuthStore } from './stores/authStore';

import Navbar from './components/Navbar';
import GuestOnly from './components/GuestOnly';
import RequireAuth from './components/RequireAuth';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkDetails from './pages/WorkDetails';

function App() {
  const me = useAuthStore((s) => s.me);

  useEffect(() => {
    me();
  }, [me]);

  return (
    <BrowserRouter>
      <div className='min-h-screen'>
        <Navbar />

        <main className='mx-auto max-w-6xl px-4 py-6'>
          <Routes>
            <Route path='/' element={<Home />} />

            <Route
              path='/login'
              element={
                <GuestOnly>
                  <Login />
                </GuestOnly>
              }
            />

            <Route
              path='/register'
              element={
                <GuestOnly>
                  <Register />
                </GuestOnly>
              }
            />

            <Route
              path='/works/:id'
              element={
                <RequireAuth>
                  <WorkDetails />
                </RequireAuth>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;