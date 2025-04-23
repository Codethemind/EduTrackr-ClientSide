// src/components/admin/Header.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const NotificationBadge = ({ count, icon }) => {
  return (
    <div className="relative cursor-pointer">
      <i className={`ti ti-${icon} text-xl text-gray-500`} />
      {count > 0 && (
        <div className="absolute -top-1 -right-1 flex items-center justify-center text-xs text-white bg-red-500 rounded-full h-5 w-5">
          {count}
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const [admin, setAdmin] = useState({ name: "", role: "", avatar: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const response = await axios.get("/api/admins/");
       
        setAdmin({
          name: response.data.username || "Unknown Admin",
          role: response.data.role || "Administrator",
          avatar: response.data.avatar || "", // if you have avatar field
        });
      } catch (error) {
        console.error("Failed to fetch admin details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDetails();
  }, []);

  const fallbackAvatar = "https://ui-avatars.com/api/?name=" + encodeURIComponent(admin.name || "Admin") + "&background=0D8ABC&color=fff";

  if (loading) {
    return (
      <header className="flex justify-between items-center px-8 bg-white shadow-sm h-16 ml-5">
        <div>Loading...</div>
      </header>
    );
  }

  return (
    <header className="flex justify-between items-center px-8 bg-white shadow-sm h-16 ml-5">
      <div className="relative">
        <i className="ti ti-search absolute left-4 top-2.5 text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="pr-4 pl-10 text-sm bg-white border border-gray-200 h-9 rounded-full text-neutral-500 w-72"
        />
      </div>
      <div className="flex gap-6 items-center">
        <NotificationBadge count={3} icon="bell" />
        <NotificationBadge count={5} icon="mail" />
        <div className="flex gap-4 items-center">
          <img
            src={admin.avatar || fallbackAvatar}
            alt="Admin Avatar"
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackAvatar;
            }}
          />
          <div className="flex flex-col">
            <div className="text-sm font-bold text-neutral-800">{admin.name}</div>
            <div className="text-sm text-gray-500">{admin.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
