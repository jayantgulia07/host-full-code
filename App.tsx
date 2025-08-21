import './App.css';
import Sidebar, { SidebarItem } from './components/Sidebar';
import { Home as HomeIcon, LayoutDashboard } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const loadRemoteService = async () => {
      try {





        
        // Dynamically import the remote service
        const remote = await import('remoteApp/services');

        // Example usage
        const result = await remote.askQuestionAPI('Hello from Host App', [], 'session-1');

        console.log('Remote service response:', result);
      } catch (error) {
        console.error('Failed to load remote service:', error);
      }
    };

    loadRemoteService();
  }, []);

  return (
    <Router>
      <div className="flex">
        <Sidebar>
          <Link to="/"><SidebarItem icon={<HomeIcon size={20} />} text="Home" /></Link>
          <Link to="/dashboard"><SidebarItem icon={<LayoutDashboard size={20} />} text="Chat" /></Link>
        </Sidebar>

        <main className="flex-1 relative overflow-hidden text-[white]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
