export default function Navbar({ user, role, onLogout, onNavigate }) {
  const handleNavigation = (view) => {
    if (onNavigate) {
      onNavigate(view);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => handleNavigation('home')}>
              <span className="text-xl sm:text-2xl font-bold text-[#2e7d32]">EduBridge Africa</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
