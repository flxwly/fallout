import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {Toaster} from 'react-hot-toast';
import {AuthProvider} from './contexts/AuthContext';
import {GameProvider} from './contexts/GameContext';
import {Navigation} from './components/Navigation';
import {HomePage} from './pages/HomePage';
import {LoginPage} from './pages/LoginPage';
import {RegisterPage} from './pages/RegisterPage';
import {GamePage} from './pages/GamePage';
import {LevelPage} from './pages/LevelPage';
import {ProfilePage} from './pages/ProfilePage';
import {AdminPage} from './pages/AdminPage';
import {ProtectedRoute} from './components/ProtectedRoute';


function App() {

    return (
        <div className="bg-gray-100">
            <div className="bg-green-500 h-16">
                <h1 className="text-center text-white text-3xl font-bold">Demo Version! (Aus praktischen )</h1>
            </div>
            <AuthProvider>
                <GameProvider>
                    <Router>
                        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
                            <Navigation/>
                            <main className="container mx-auto px-4 py-8">
                                <Routes>
                                    <Route path="/" element={<HomePage/>}/>
                                    <Route path="/login" element={<LoginPage/>}/>
                                    <Route path="/register" element={<RegisterPage/>}/>
                                    <Route
                                        path="/game"
                                        element={
                                        <ProtectedRoute permissionLevel={0}>
                                            <GamePage/>
                                        </ProtectedRoute>}/>
                                    <Route
                                        path="/level/:id"
                                        element={
                                        <ProtectedRoute permissionLevel={0}>
                                            <LevelPage/>
                                        </ProtectedRoute>}/>
                                    <Route
                                        path="/profile"
                                        element={
                                        <ProtectedRoute permissionLevel={0}>
                                            <ProfilePage/>
                                        </ProtectedRoute>}/>
                                    <Route
                                        path="/admin/*"
                                        element={
                                        <ProtectedRoute permissionLevel={1}>
                                            <AdminPage/>
                                        </ProtectedRoute>}/>
                                </Routes>
                            </main>
                            <Toaster position="top-right"/>
                        </div>
                    </Router>
                </GameProvider>
            </AuthProvider>

        </div>
    );
}

export default App;