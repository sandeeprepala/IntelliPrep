import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';  
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Footer from './components/Footer';
import ResourcesPage from './components/ResourcesPage';
import ResumeJD from './components/ResumeJD';
import MockInterviews from './components/MockInterviews';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import InterviewPage from './components/InterviewPage';
import MockTest from './components/MockTest';
import ViewPreviousAnalysis from './components/ViewPreviousAnalysis';
import ViewPreviousAnalysisById from './components/ViewPreviousAnalysisById';
import RoadmapGenerator from './components/RoadmapGenerator';
import RoadmapsList from './components/RoadmapsList';
import RoadmapDetail from './components/RoadmapDetail';
import './App.css';

function App() {
  return (
    <Router>
      <Toaster position="top-center" />  {/* ✅ Only once */}
      <div className="app-container">
        <Navbar />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/interview-prep" element={<ResourcesPage />} />
            <Route path="/resume-review" element={<ResumeJD />} />
            <Route path="/interviews" element={<MockInterviews />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/mock-interviews/:company/:role" element={<InterviewPage />} />
            <Route path="/mock-test/:company/:role" element={<MockTest />} />
            <Route path="/previous-analysis" element={<ViewPreviousAnalysis />} />
            <Route path="/previous-analysis/:sessionId" element={<ViewPreviousAnalysisById />} />
            <Route path='/roadmapGenerator' element={<RoadmapGenerator/>}/>
            <Route path='/roadmaps' element={<RoadmapsList/>}/>
            <Route path='/roadmaps/:id' element={<RoadmapDetail/>}/>

          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;