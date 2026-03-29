import { useAuth } from '../../context/AuthContext';
import { FiBell, FiLogOut, FiUser } from 'react-icons/fi';

export default function Navbar() {
    const { user, logout, currentCircle } = useAuth();

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🏥</span>
                    <div>
                        <h1 className="text-xl font-bold text-blue-600">CareCircle</h1>
                        {currentCircle && (
                            <p className="text-xs text-gray-500">{currentCircle.name}</p>
                        )}
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-gray-500 hover:text-blue-600">
                        <FiBell size={20} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiUser size={16} className="text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
                    >
                        <FiLogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}