"use client";
import React, { createContext, useContext, useState } from "react";
import axi from "@/utils/api";
import { API_URL } from "@/index";

interface UserType {
  email: string;
  id: number;
  is_active: boolean;
  name: string;
  avatar?: string; // добавляем поле для аватарки
}

interface UserContextType {
  user: UserType | null;
  fetchUser: () => Promise<void>;
  updateUser: (newData: Partial<UserType>) => void;
  cleanupUser: () => void;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);

  React.useEffect(() => {
    fetchUser();
    console.log("вызвано обновление юзера");
  }, []);

  

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const response = await axi.get(API_URL + "account/info", { 
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status !== 200) localStorage.removeItem("token");
      setUser(response.data);
    } catch (error) {
      console.error("Authorization error:", error);
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const updateUser = (newData: Partial<UserType>) => {
    if (user) {
      setUser({ ...user, ...newData });
    }
  };

  const cleanupUser = () => {
    setUser(null);
  };

  
    
  

  return (
    <UserContext.Provider value={{ user, fetchUser, updateUser , cleanupUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};