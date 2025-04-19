// src/components/admin/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NavItem = ({ icon, label, isActive = false, onClick }) => (
  <div
    className={`group flex items-center gap-4 p-3 rounded-xl transition-colors cursor-pointer ${
      isActive
        ? "bg-blue-50 border-l-4 border-blue-600 text-blue-600"
        : "text-gray-600 hover:bg-gray-100"
    }`}
    onClick={onClick}
  >
    <i className={`ti ti-${icon} text-xl ${isActive ? "text-blue-600" : "text-gray-500"}`} />
    <span className={`font-medium ${isActive ? "text-blue-600" : "text-gray-700"}`}>
      {label}
    </span>
  </div>
);

const NavSection = ({ title, items }) => (
  <div className="mb-6">
    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
      {title}
    </h3>
    <div className="space-y-1">
      {items.map((item, index) => (
        <NavItem key={index} {...item} />
      ))}
    </div>
  </div>
);

const Sidebar = ({ activePage: propActivePage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active page from URL if not provided via props
  const [activePage, setActivePage] = useState(propActivePage);
  
  useEffect(() => {
    // Update activePage when props change
    if (propActivePage) {
      setActivePage(propActivePage);
    } else {
      // Extract the active page from the current URL path
      const path = location.pathname.split('/').pop();
      setActivePage(path);
    }
  }, [location.pathname, propActivePage]);
  
  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(`/admin/${path}`);
  };

  const navSections = [
    {
      title: "Main",
      items: [
        { 
          icon: "layout-dashboard", 
          label: "Dashboard", 
          isActive: activePage === "dashboard",
          onClick: () => handleNavigation("dashboard")
        },
        { 
          icon: "users", 
          label: "Users", 
          isActive: activePage === "users",
          onClick: () => handleNavigation("users")
        },
        { 
          icon: "building", 
          label: "Departments", 
          isActive: activePage === "departments",
          onClick: () => handleNavigation("departments")
        },
        { 
          icon: "book", 
          label: "Courses", 
          isActive: activePage === "courses",
          onClick: () => handleNavigation("courses")
        },
      ]
    },
    // ... rest of your sections remain the same
    {
      title: "Management",
      items: [
        { 
          icon: "section", 
          label: "Sections", 
          isActive: activePage === "sections",
          onClick: () => handleNavigation("sections")
        },
        { 
          icon: "clipboard", 
          label: "Assignments", 
          isActive: activePage === "assignments",
          onClick: () => handleNavigation("assignments")
        },
        { 
          icon: "files", 
          label: "Resources", 
          isActive: activePage === "resources",
          onClick: () => handleNavigation("resources")
        },
        { 
          icon: "bell", 
          label: "Announcements", 
          isActive: activePage === "announcements",
          onClick: () => handleNavigation("announcements")
        },
      ]
    },
    {
      title: "System",
      items: [
        { 
          icon: "settings", 
          label: "Settings", 
          isActive: activePage === "settings",
          onClick: () => handleNavigation("settings")
        },
        { 
          icon: "logout", 
          label: "Logout", 
          onClick: handleLogout 
        },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white h-screen shadow-xl fixed overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img
            src="/eduportal-logo.png"
            alt="EduPortal"
            className="w-9 h-9"
          />
          <h1 className="text-xl font-bold text-gray-900">EduPortal</h1>
        </div>
      </div>
      <nav className="p-4">
        {navSections.map((section, index) => (
          <NavSection
            key={index}
            title={section.title}
            items={section.items}
          />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;