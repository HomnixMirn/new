"use client";
import React, { createContext, useContext, useState } from "react";
import axi from "@/utils/api";
import { API_URL } from "@/index";

interface GEOType {
  latitude : GLfloat;
  longitude : GLfloat;

}

interface GEOContextType {
  GEO: GEOType[];
}

const GEOContext =
  createContext<GEOContextType>(
    {} as GEOContextType
  );

export const GEOProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
    const [GEO, setGEO] = useState([] as GEOType[]);

    React.useEffect(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setGEO({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },

          (error) => {
            console.error("Error getting location:", error);
            
          }
        );
        console.log(GEO)
      }, []);
   

  return (
    <GEOContext.Provider
      value={{GEO}}
    >
      {children}
    </GEOContext.Provider>
  );
};

export const useGEO = () => {
  const context = useContext(GEOContext);
  if (!context) {
    throw new Error(
      "useGEO must be used within a GEOProvider"
    );
  }
  return context;
};
