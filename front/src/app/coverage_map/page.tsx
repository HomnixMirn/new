"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  YMaps,
  Map,
  Placemark,
  Clusterer,
  Circle,
  Polygon,
} from "@pbe/react-yandex-maps";
import axi from "@/utils/api";
import Image from "next/image";
import Link from "next/link";
import AddStarRating from "../components/star_rating/add_star_rating";
import StarRating from "../components/star_rating/star_rating";
import * as turf from "@turf/turf";

export default function CoverageMap({
  apiKey = "43446600-2296-4713-9c16-4baf8af7f5fd",
}) {
  const [activeTab, setActiveTab] = useState<"offices" | "coverage">("offices");
  const [searchQuery, setSearchQuery] = useState("");
  const [isBalloonOpen, setIsBalloonOpen] = useState(false);
  const [offices, setOffices] = useState([]);
  const [comments, setComments] = useState([]);
  const [cells, setCells] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [mergedCoverage, setMergedCoverage] = useState<any>(null);
  const [newComment, setNewComment] = useState({
    text: "",
    rating: 5,
    officeId: null,
  });
  const [selectedOffice, setSelectedOffice] = useState(null);
  const mapRef = useRef(null);
  const [mapBounds, setMapBounds] = useState([]);
  const [showTower, setShowTower] = useState(false);
  const [showOffices, setShowOffices] = useState(true);

  const [filters, setFilters] = useState({
    worksAfter20: false,
    worksOnWeekends: false,
    worksNow: false,
  });

  const handleFilterChange = (filterName) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: !prevFilters[filterName],
    }));
    
  };

  

  function servicesUpdateHandle(servic) {
    if (services.includes(servic)) {
      const index = services.indexOf(servic);
      services.splice(index, 1);
      console.log(services);
    } else {
      setServices([...services, servic]);
    }
  }

  const getConvexHull = (points) => {
    const sorted = points.sort((a, b) =>
      a[1] === b[1] ? a[0] - b[0] : a[1] - b[1]
    );

    const cross = (o, a, b) =>
      (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

    const lower = [];
    for (let p of sorted) {
      while (
        lower.length >= 2 &&
        cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
      ) {
        lower.pop();
      }
      lower.push(p);
    }

    const upper = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
      let p = sorted[i];
      while (
        upper.length >= 2 &&
        cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
      ) {
        upper.pop();
      }
      upper.push(p);
    }

    upper.pop();
    lower.pop();
    return [...lower, ...upper];
  };

  const generatePolygonCoords = (center, radius, sides = 12) => {
    const [lat, lon] = center;
    const coords = [];

    for (let i = 0; i < sides; i++) {
      const angle = (2 * Math.PI * i) / sides;
      const dx = (radius / 111000) * Math.cos(angle);
      const dy =
        (radius / (111000 * Math.cos(lat * (Math.PI / 180)))) * Math.sin(angle);
      coords.push([lat + dx, lon + dy]);
    }

    return coords;
  };

  const handlePlacemarkClick = (e) => {
    e.stopPropagation();
    setIsBalloonOpen(true);
  };

  const handleClusterClick = (e) => {
    const coords = e.get("target").geometry.getCoordinates();
    const currentZoom = mapRef.current?.getZoom();

    if (mapRef.current) {
      mapRef.current
        .panTo(coords, {
          flying: true,
          duration: 400,
        })
        .then(() => {
          mapRef.current.setZoom(currentZoom + 1, {
            duration: 300,
          });
        });
    }
  };

  
  useEffect(() => {
    let query =''
    if (filters.worksNow){
      const time = new Date(); 
      query += `filters=${time.getHours()}&`
    }
    if (services !== []){
      query += 'services=' + services.map((service) => `${service}`).join(",");
      axi.get("/map/all_office?"+query).then((response) => {
        console.log(response.data);
        setOffices([...response.data]);
      });
    }
    else{
    axi.get("/map/all_office"+query).then((response) => {
      console.log(response.data);
      setOffices([...response.data]);
    });}
  }, [services, filters]);

  useEffect(() => {
    const data = {
      left_bottom: mapBounds[0],
      right_top: mapBounds[1],
    };
    axi.post("/map/all_cells", data).then((response) => {
      if (!response.data || response.data.length === 0) {
        return;
      }
      const cells = response.data;
      generateMergedCoverage([...cells]);
    });
  }, [mapBounds]);

  const generateMergedCoverage = (cells) => {
    if (cells.length === 0) {
      setMergedCoverage(null);
      return;
    }

    try {
      const polygons = cells.map((cell) => {
        const center = [cell.longitude, cell.latitude];
        return turf.circle(center, 4000, { steps: 64, units: "meters" });
      });

      const combined = turf.combine(turf.featureCollection(polygons));
      const merged = combined.features[0];

      if (!merged) return;

      const processCoordinates = (coords) => {
        return coords.map((ring) => ring.map(([lng, lat]) => [lat, lng]));
      };

      let processedCoords;
      const coordinates = turf.getCoords(merged);

      if (merged.geometry.type === "MultiPolygon") {
        processedCoords = coordinates.map((polygon) =>
          processCoordinates(polygon)
        );
      } else {
        processedCoords = [processCoordinates(coordinates)];
      }
      console.log(processedCoords);
      setMergedCoverage(processedCoords);
    } catch (error) {
      console.error("Error merging coverage:", error);
    }
  };

  useEffect(() => {
    const handleShowComments = (e) => {
      fetchComments(e.detail);
    };

    window.addEventListener("showComments", handleShowComments);

    return () => {
      window.removeEventListener("showComments", handleShowComments);
    };
  }, []);

  const fetchComments = async (officeId) => {
    try {
      const response = await axi.get(`/map/get_comments?id=${officeId}`);
      setComments(response.data);
      setSelectedOffice(officeId);
      setNewComment((prev) => ({ ...prev, officeId }));
    } catch (error) {
      console.error("Error fetching comments:", error.response?.data);
    }
  };

  const getMapBounds = (mapRef: React.RefObject<any>) => {
    if (!mapRef.current) return null;
    const map = mapRef.current;
    console.log(map);
    const bounds = map.getBounds();

    if (!bounds) return null;

    return [
      [bounds[0][0], bounds[0][1]],
      [bounds[1][0], bounds[1][1]],
    ];
  };

  const handleBoundsChange = () => {
    const bounds = getMapBounds(mapRef);
    console.log(bounds);
    if (bounds) {
      setMapBounds(bounds);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    try {
      await axi.post("/map/add_comment", {
        id: newComment.officeId,
        text: newComment.text,
        rating: newComment.rating,
      });
      await fetchComments(newComment.officeId);
      setNewComment({
        text: "",
        rating: 5,
        officeId: newComment.officeId,
      });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const createBalloonContent = (office) => {
    return `
      <div style="width: 350px; height: 130px; border-radius: 16px; display: flex; flex-direction: column; padding: 16px; box-sizing: border-box; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
        <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">${
          office.address
        }</div>
        <div style="display: flex; margin-bottom: 8px;">
          <span style="font-size: 14px; color: #666;">Часы работы:</span>
          <span style="font-size: 14px; margin-left: 8px;">${
            office.working_hours || "9:00 - 18:00"
          }</span>
        </div>
        <div style="display: flex; margin-bottom: 8px;">
          <span style="font-size: 14px; color: #666;">Телефон:</span>
          <span style="font-size: 14px; margin-left: 8px;">${
            office.phone || "+7 (XXX) XXX-XX-XX"
          }</span>
        </div>
        <button onclick="window.dispatchEvent(new CustomEvent('showComments', { detail: ${
          office.id
        } }))" 
          style="margin-top: auto; background: #3fcbff; border: none; padding: 8px 16px; border-radius: 4px; color: white; cursor: pointer; align-self: flex-start;">
          Показать комментарии
        </button>
      </div>
    `;
  };
  function handleCheckService(e, service){
    if (e.target.checked){
      console.log('да')
      setServices([...services,service])
      
    }
    else{
      setServices(services.filter((v)=> v!== service))
      console.log("нет")
    }
  }

  const Services = () => {
    const AllServices = [
      "Подключают eSIM",
      "Подключают услуги «Ростелекома»",
      "Продают устройства по акции «Обмен минут на смартфоны и гаджеты»",
      "Подключают домашний интернет от t2",
      "Принимают платежи наличными на кассе",
      "Продают смартфоны в trade-in",
      "Обслуживают корпоративных клиентов",
      "Помогают с заменой SIM-карты другого региона",
    ];

     

    
    return (
      <div className="flex flex-col gap-5">
        {AllServices.map((service) => (
          <div className="flex gap-5">
            <input
              type="checkbox"
              
              checked={services.includes(service)}
              // onClick={() => servicesUpdateHandle(service)}
              name=""
              id={service}
              onChange={(e) => {
                console.log(e)
                handleCheckService(e,service)
                
              }}
            />
            <p className="">{service}</p>
          </div>
        ))}
      </div>
    );
  };

  function Offices() {
    const filterOffices = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0 - Sunday, 1 - Monday, etc.
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();

      return offices.filter((office) => {
        // Search filter
        if (
          searchQuery &&
          !office.address.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Get working hours (default to 9:00-18:00 if not provided)
        const workingHours =
          office.working_hours || Array(7).fill("9:00-18:00");

        // Works after 20:00 filter
        if (filters.worksAfter20) {
          const hasLateHours = workingHours.some((hours) => {
            if (!hours || hours === "closed") return false;
            const [_, closeTime] = hours.split("-");
            if (!closeTime) return false;
            const [closeHour, closeMinute] = closeTime.split(":").map(Number);
            return closeHour >= 20;
          });
          if (!hasLateHours) return false;
        }

        // Works on weekends filter
        if (filters.worksOnWeekends) {
          const weekendDays = [0, 6]; // 0 - Sunday, 6 - Saturday
          const isOpenWeekend = weekendDays.some((day) => {
            const hours = workingHours[day];
            return hours && hours !== "closed";
          });
          if (!isOpenWeekend) return false;
        }

        // Works now filter
        if (filters.worksNow) {
          // Convert JavaScript day (0-6, Sun-Sat) to our array index (0-6, Mon-Sun)
          const adjustedDay = currentDay === 0 ? 6 : currentDay - 1;
          const todayHours = workingHours[adjustedDay];

          if (!todayHours || todayHours === "closed") return false;

          const [openTime, closeTime] = todayHours.split("-");
          if (!openTime || !closeTime) return false;

          const [openHour, openMinute] = openTime.split(":").map(Number);
          const [closeHour, closeMinute] = closeTime.split(":").map(Number);

          const currentTotalMinutes = currentHour * 60 + currentMinutes;
          const openTotalMinutes = openHour * 60 + (openMinute || 0);
          const closeTotalMinutes = closeHour * 60 + (closeMinute || 0);

          if (
            currentTotalMinutes < openTotalMinutes ||
            currentTotalMinutes > closeTotalMinutes
          ) {
            return false;
          }
        }

        return true;
      });
    };

    const handleApplyServices = (selectedServices: Record<string, boolean>) => {
      console.log("Применены фильтры:", selectedServices);
    };

    return (
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
          {/* Modal Serveces */}
          <h2 className="text-xl font-bold">Офисы T2</h2>
          <h2
            className="text-xl font-bold cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Услуги
          </h2>
        </div>

        {/*  */}
        

    <div className="flex-1 overflow-y-auto mt-2 space-y-8 pr-2 h-[400px] custom-scrollbar">
      {isDropdownOpen ? (
        <Services />
      ) : (
        <>
          {offices.map((office, index) => (
                <div key={office.id} className="flex justify-between items-center">
                  <div className="flex items-start gap-3">
                    <Image
                      src="/images/Icons/point.svg"
                      alt="point"
                      width={25}
                      height={25}
                    />
                    <div>
                      <div className="font-bold">{office.address}</div>
                      <div className="text-sm text-gray-400">{office.souring}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-white">
                    <Image
                      src="/images/Icons/com.svg"
                      alt="com"
                      width={25}
                      height={25}
                    />
                    <div>{office.manyComments}</div>
                  </div>
                </div>
              ))}
        </>
      )}
    </div>
  </div>
);
            
  }

  return (
    <div className="flex h-[calc(100vh-68px)] overflow-hidden">
      <div className="w-1/4 bg-white flex flex-col shadow-[4px_0_10px_0_rgba(0,0,0,0.3)] relative z-10">
        <div className="flex flex-col p-4 h-1/3">
          <div className="flex space-x-20 text-xl font-medium justify-center">
            <button
              onClick={() => setActiveTab("coverage")}
              className={`pb-1 border-b-2 transition-colors duration-200 ${
                activeTab === "coverage"
                  ? "border-[#E6007E] text-black"
                  : "border-transparent text-black hover:text-[#E6007E]"
              }`}
            >
              Карта покрытия
            </button>
            <button
              onClick={() => setActiveTab("offices")}
              className={`pb-1 border-b-2 transition-colors duration-200 ${
                activeTab === "offices"
                  ? "border-[#E6007E] text-black"
                  : "border-transparent text-black hover:text-[#E6007E]"
              }`}
            >
              Офисы
            </button>
          </div>

          <div className="mt-6 relative flex justify-center">
            <input
              type="text"
              placeholder="Что хочешь найти?"
              className="w-5/6 border border-gray-300 rounded-md p-2 pl-4 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#d50069]"
            />
            <div className="absolute right-[13%] top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Image
                src="/images/Icons/Icon.svg"
                alt="Поиск"
                width={20}
                height={20}
                className=""
              />
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-800 ml-8 space-y-3">
            {activeTab === "coverage" ? (
              <>
                <label className="flex items-center w-2/3">
                  <input
                    type="checkbox"
                    checked={showTower}
                    onChange={() => setShowTower(!showTower)}
                    className="w-5 h-5 accent-[#d50069] mr-2 rounded flex-shrink-0 mt-0.5"
                  />
                  Показать вышки на карте
                </label>
                <label className="flex items-center w-2/3">
                  <input
                    type="checkbox"
                    // checked={showRatings}
                    onChange={() => setShowRatings(!showRatings)}
                    className="w-5 h-5 accent-[#d50069] mr-2 rounded flex-shrink-0 mt-0.5"
                  />
                  Показать оценки связи от клиентов
                </label>
              </>
            ) : (
              <>
                <label className="flex items-center w-2/3">
                  <input
                    type="checkbox"
                    checked={services.includes("Работают после 20:00")}
                    onChange={(e) => {
                      console.log(e)
                      handleCheckService(e,"Работают после 20:00")
                      
                    }}
                    className="w-5 h-5 accent-[#d50069] mr-2 rounded flex-shrink-0 mt-0.5"
                  />
                  Работают после 20:00
                </label>
                <label className="flex items-center w-2/3">
                  <input
                    type="checkbox"
                    checked={services.includes("Работают по выходным")}
                    onChange={(e) => {
                      console.log(e)
                      handleCheckService(e,"Работают по выходным")
                      
                    }}
                    className="w-5 h-5 accent-[#d50069] mr-2 rounded flex-shrink-0 mt-0.5"
                  />
                  Работают по выходным
                </label>
                <label className="flex items-center w-2/3">
                  <input
                    type="checkbox"
                    checked={filters.worksNow}
                    onChange={() => handleFilterChange("worksNow")}
                    className="w-5 h-5 accent-[#d50069] mr-2 rounded flex-shrink-0 mt-0.5"
                  />
                  Сейчас работают
                </label>
              </>
            )}
          </div>
        </div>
        <div className="flex-1 bg-black text-white py-4 px-10 overflow-y-auto custom-scrollbar">
          {activeTab === "offices" && <Offices />}
          {/* {activeTab === "coverage" && <CoverageRoaming />} */}
        </div>
      </div>
      <div className="flex-1 h-[calc(100vh-68px)] z-0">
        <YMaps query={{ apikey: apiKey }}>
          <Map
            instanceRef={(ref) => {
              console.log(ref);
              if (ref) {
                mapRef.current = ref;
              }
            }}
            defaultState={{
              center: [56.19, 44.0],
              zoom: 10,
            }}
            width="100%"
            height="100%"
            onBoundsChange={handleBoundsChange}
          >
            <Clusterer
              options={{
                preset: "islands#blackClusterIcons",
                groupByCoordinates: false,
                clusterDisableClickZoom: true,
                clusterOpenBalloonOnClick: false,
                zIndex: 1000,
                iconColor: "#000000",
                iconSize: [40, 40],
              }}
              onClick={handleClusterClick}
            >
              {offices.map((office) => (
                <Placemark
                  key={office.id}
                  geometry={[office.latitude, office.longitude]}
                  properties={{
                    balloonContent: createBalloonContent(office),
                  }}
                  options={{
                    iconLayout: "default#image",
                    iconImageHref: "/images/Icons/pointerIcon.svg",
                    iconImageSize: [40, 40],
                    iconImageOffset: [-20, -40],
                    balloonShadow: true,
                    balloonOffset: [0, 0],
                    balloonAutoPan: true,
                    balloonCloseButton: true,
                    balloonPanelMaxMapArea: 0,
                  }}
                  onClick={handlePlacemarkClick}
                  modules={["geoObject.addon.balloon", "geoObject.addon.hint"]}
                />
              ))}
            </Clusterer>

            {mergedCoverage?.map((polygonCoords, index) => (
              <Polygon
                key={index}
                geometry={polygonCoords}
                options={{
                  fillColor: "#3fcbff",
                  fillOpacity: 0.15,
                  strokeColor: "#3fcbff",
                  strokeWidth: 1,
                  strokeOpacity: 0.6,
                  outline: false,
                }}
              />
            ))}
          </Map>
        </YMaps>
      </div>
    </div>
  );
}
