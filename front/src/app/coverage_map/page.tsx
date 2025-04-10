"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  YMaps,
  Map,
  Placemark,
  Clusterer,
  Polygon,
} from "@pbe/react-yandex-maps";
import axi from "@/utils/api";
import Image from "next/image";
import Services from "../servecesFilter/page";
import Link from "next/link";
import AddStarRating from "../components/star_rating/add_star_rating";
import StarRating from "../components/star_rating/star_rating";
import * as turf from "@turf/turf";
import { useNotificationManager } from "@/hooks/notification-context";

export default function CoverageMap({
  apiKey = "43446600-2296-4713-9c16-4baf8af7f5fd",
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isBalloonOpen, setIsBalloonOpen] = useState(false);
  const [offices, setOffices] = useState([]);
  const [cells, setCells] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [mergedCoverage, setMergedCoverage] = useState<any>(null);
  const [search, setSearch] = useState("");

  // comment please dont delete
  const [activeTab, setActiveTab] = useState<"offices" | "coverage">("offices");
  const [showComments, setShowComments] = useState(false);
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
  const [comments, setComments] = useState([]);

  const [newComment, setNewComment] = useState({
    text: "",
    rating: 5,
    officeId: null,
  });
  // comment please dont delete

  const [selectedOffice, setSelectedOffice] = useState(null);
  const mapRef = useRef(null);
  const [mapBounds, setMapBounds] = useState([]);
  const [showTower, setShowTower] = useState(false);

  const [showOffices, setShowOffices] = useState(true);
  const [isShowNetwork, setIsShowNetwork] = useState(false);

  const [filters, setFilters] = useState({
    worksAfter20: false,
    worksOnWeekends: false,
    worksNow: false,
  });

  const [initialCenter, setInitialCenter] = useState([56.19, 44.0]);
  const [initialZoom, setInitialZoom] = useState(10);
  const isCenteredRef = useRef(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const watchIdRef = useRef<number | null>(null);
  const { addNotification } = useNotificationManager();

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
    const loadOffices = async () => {
      try {
        let query = "";
        if (filters.worksNow) {
          const time = new Date();
          query += `filters=${time.getHours()}&`;
        }
        if (search !== "") {
          query += `search=${search}&`;
        }
        if (services !== []) {
          query +=
            "services=" + services.map((service) => `${service}`).join(",");
        }

        const response = await axi.get(`/map/all_office?${query}`);
        setOffices([...response.data]);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Ошибка при загрузке офисов";
      }
    };

    loadOffices();
  }, [services, filters, search]);

  useEffect(() => {
    if (isShowNetwork) {
      const loadCells = async () => {
        try {
          const data = {
            left_bottom: mapBounds[0],
            right_top: mapBounds[1],
          };
          const response = await axi.post("/map/all_cells", data);

          if (!response.data || response.data.length === 0) {
            return;
          }

          const cellss = response.data;
          setCells(cellss);
          generateMergedCoverage([...cellss]);
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Ошибка при загрузке зон покрытия";
        }
      };

      if (mapBounds.length > 0) {
        loadCells();
      }
    }
    if (!isShowNetwork) {
      setMergedCoverage([]);
      setCells([]);
    }
  }, [mapBounds, isShowNetwork]);

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

  //comment please dont delete
  useEffect(() => {
    const handleShowComments = (e: CustomEvent) => {
      setActiveTab("comments");
      setShowComments(true);
      setSelectedOfficeId(e.detail);
      fetchComments(e.detail);
    };

    window.addEventListener(
      "showComments",
      handleShowComments as EventListener
    );

    return () => {
      window.removeEventListener(
        "showComments",
        handleShowComments as EventListener
      );
    };
  }, []);

  const handleBackToOffices = () => {
    setActiveTab("offices");
    setShowComments(false);
    setSelectedOfficeId(null);
  };
  //comment please dont delete

  const fetchComments = async (officeId) => {
    try {
      const response = await axi.get(`/map/get_comments?id=${officeId}`);
      setComments(response.data);
      setSelectedOffice(officeId);
      setNewComment((prev) => ({ ...prev, officeId }));
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Ошибка при загрузке комментариев";
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
      const errorMessage =
        error.response?.data?.message || "Ошибка при отправке комментария";
    }
  };

  const createBalloonContent = (office) => {
    // Получаем средний рейтинг из данных офиса (должен приходить с бэкенда)
    const averageRating = office.rating || 0; // Предполагаем, что бэкенд возвращает это поле

    // Функция для отрисовки звезд рейтинга
    const renderStars = (rating: number) => {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      let starsHtml = "";

      // Полные звезды
      for (let i = 0; i < fullStars; i++) {
        starsHtml += '<span style="color: gold; font-size: 16px;">★</span>';
      }

      // Половина звезды
      if (hasHalfStar) {
        starsHtml += '<span style="color: gold; font-size: 16px;">½</span>';
      }

      // Пустые звезды
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
      for (let i = 0; i < emptyStars; i++) {
        starsHtml +=
          '<span style="color: lightgray; font-size: 16px;">★</span>';
      }

      return starsHtml;
    };

    return `
      <div style="width: 350px; height: 150px; border-radius: 16px; display: flex; flex-direction: column; padding: 16px; box-sizing: border-box; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
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
        <div style="margin-top: auto; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center;">
            <div style="font-size: 16px; margin-right: 8px;">
              ${renderStars(averageRating)}
            </div>
            <span style="font-size: 14px; color: #666;">
              ${averageRating.toFixed(1)}/5
            </span>
          </div>
          <button onclick="window.dispatchEvent(new CustomEvent('showComments', { detail: ${
            office.id
          } }))" 
            style="background: #3fcbff; border: none; padding: 6px 12px; border-radius: 4px; color: white; cursor: pointer; font-size: 12px;">
            <div style="font-size: 16px; margin-right: 8px;">
              ${renderStars(averageRating)}
            </div>
            <span style="font-size: 14px; color: #666;">
              ${averageRating.toFixed(1)}/5
            </span>
          </button>
        </div>
      </div>
    `;
  };

  function handleCheckService(e, service) {
    if (e.target.checked) {
      console.log("да");
      setServices([...services, service]);
    } else {
      setServices(services.filter((v) => v !== service));
      console.log("нет");
    }
  }

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

        if (filters.worksNow) {
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

    const handleOfficeClick = useCallback((lat: number, lon: number) => {
      if (mapRef.current) {
        mapRef.current
          .panTo([lat, lon], {
            flying: true,
            duration: 400,
          })
          .then(() => {
            mapRef.current.setZoom(15, {
              duration: 400,
            });
          });
      }
    }, []);

    const handleApplyServices = (selectedServices: Record<string, boolean>) => {
      console.log("Применены фильтры:", selectedServices);
    };

    return (
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Офисы T2</h2>
          <div
            className="text-base cursor-pointer hover:text-[#E6007E]"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Услуги
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mt-2 space-y-8 pr-2 h-[400px] custom-scrollbar">
          {isDropdownOpen ? (
            <Services
              services={services}
              onServiceToggle={servicesUpdateHandle}
              setServices={setServices}
            />
          ) : (
            <>
              {offices.map((office, index) => (
                <div
                  key={office.id}
                  className="flex justify-between items-stretch gap-4 cursor-pointer"
                  onClick={() =>
                    handleOfficeClick(office.latitude, office.longitude)
                  }
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Image
                      src="/images/Icons/point.svg"
                      alt="point"
                      width={25}
                      height={25}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <div className="min-w-0 self-center">
                      <div className="font-bold break-words">
                        {office.address}
                      </div>
                      <div className="text-sm text-gray-400 truncate">
                        {office.souring}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-white flex-shrink-0">
                    <Image
                      src="/images/Icons/com.svg"
                      alt="com"
                      width={20}
                      height={20}
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

  useEffect(() => {
    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setUserLocation([latitude, longitude]);

      if (!isCenteredRef.current && mapRef.current) {
        mapRef.current.panTo([latitude, longitude], { flying: true });
        isCenteredRef.current = true;
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error("Ошибка геолокации:", error);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="flex h-[calc(100vh-68px)] overflow-hidden">
      <div className="w-1/4 bg-white flex flex-col shadow-[4px_0_10px_0_rgba(0,0,0,0.3)] relative z-10">
        {/* Блок с табами - скрывается при showComments */}
        {!showComments && (
          <div className="flex flex-col p-4">
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

            {/* Поиск и фильтры */}
            <div className="mt-4 relative flex justify-center">
              <input
                type="text"
                placeholder="Что хочешь найти?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-5/6 border border-gray-300 rounded-md p-2 pl-4 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#d50069]"
              />
              <div className="absolute right-[13%] top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Image
                  src="/images/Icons/Icon.svg"
                  alt="Поиск"
                  width={20}
                  height={20}
                />
              </div>
            </div>

            <div className="mt-3 text-sm text-black ml-8 space-y-3">
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
                      checked={isShowNetwork}
                      onChange={() => setIsShowNetwork(!isShowNetwork)}
                      className="w-5 h-5 accent-[#d50069] mr-2 rounded flex-shrink-0 mt-0.5"
                    />
                    Показать покрытие 4G
                  </label>
                </>
              ) : (
                <>
                  <label className="flex items-center w-2/3">
                    <input
                      type="checkbox"
                      checked={services.includes("Работают после 20:00")}
                      onChange={(e) =>
                        handleCheckService(e, "Работают после 20:00")
                      }
                      className="w-5 h-5 accent-[#d50069] mr-2 rounded flex-shrink-0 mt-0.5"
                    />
                    Работают после 20:00
                  </label>
                  <label className="flex items-center w-2/3">
                    <input
                      type="checkbox"
                      checked={services.includes("Работают по выходным")}
                      onChange={(e) =>
                        handleCheckService(e, "Работают по выходным")
                      }
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
        )}

        {/* Основной контент - офисы или комментарии */}
        <div
          className={`flex-1 ${showComments ? "bg-white" : "bg-black"} text-${
            showComments ? "black" : "white"
          } py-4 px-10 overflow-y-auto custom-scrollbar`}
        >
          {showComments ? (
            /* Блок комментариев */
            <div className="h-full">
              <div className="flex items-center mb-4 justify-between">
                <h2 className="text-xl font-bold">Комментарии</h2>
                <button
                  onClick={() => setShowComments(false)}
                  className="text-black hover:text-[#E6007E] text-2xl mr-2"
                >
                  ➔
                </button>
              </div>
              {/* ... форма комментариев ... */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">
                  Добавить комментарий
                </h3>
                <form onSubmit={handleSubmitComment}>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded mb-2"
                    rows={3}
                    value={newComment.text}
                    onChange={(e) =>
                      setNewComment({ ...newComment, text: e.target.value })
                    }
                    placeholder="Ваш комментарий"
                  />
                  <div className="flex items-center mb-4">
                    <span className="mr-2">Оценка:</span>
                    <AddStarRating
                      value={newComment.rating}
                      onChange={(rating) => {
                        setNewComment((prev) => ({
                          ...prev,
                          rating: rating || 0,
                        }));
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#3fcbff] text-white px-4 py-2 rounded"
                  >
                    Отправить
                  </button>
                </form>
              </div>
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="mb-4 p-3 border-b border-gray-200"
                  >
                    <div className="flex items-center mb-2">
                      <StarRating rating={comment.rating} />
                    </div>
                    <p className="text-gray-800">{comment.text}</p>
                    <p>{comment.author.user.username}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Нет комментариев</p>
              )}
            </div>
          ) : (
            <Offices />
          )}
        </div>
      </div>
      {/* commend please dont delet*/}

      <div className="flex-1 h-[calc(100vh-68px)] z-0">
        <YMaps query={{ apikey: apiKey }}>
          <Map
            instanceRef={(ref) => {
              if (ref) mapRef.current = ref;
            }}
            defaultState={{
              center: initialCenter,
              zoom: initialZoom,
            }}
            width="100%"
            height="100%"
            onBoundsChange={handleBoundsChange}
          >
            {userLocation && (
              <Placemark
                geometry={userLocation}
                options={{
                  iconLayout: "default#image",
                  iconImageHref: "/images/Icons/Raul.svg",
                  iconImageSize: [40, 40],
                  iconImageOffset: [-20, -40],
                  zIndex: 100000,
                }}
              />
            )}
            <Clusterer
              options={{
                preset: "islands#blackClusterIcons",
                groupByCoordinates: false,
                clusterDisableClickZoom: true,
                clusterOpenBalloonOnClick: false,
                zIndex: 10,
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

            {console.log(showTower)}
            {console.log(cells)}

            {console.log(showTower && mapRef?.current.getZoom())}

            {showTower &&
              mapRef?.current.getZoom() >= 13 &&
              cells.map((cell) => (
                <Placemark
                  key={cell.id}
                  geometry={[cell.latitude, cell.longitude]}
                  options={{
                    iconLayout: "default#image",
                    iconImageHref: "/images/Icons/tvTower.svg",
                    iconImageSize: [40, 40],
                    iconImageOffset: [-20, -40],
                    balloonShadow: true,
                    balloonOffset: [0, 0],
                    balloonAutoPan: true,
                    balloonCloseButton: true,
                    balloonPanelMaxMapArea: 0,
                  }}
                />
              ))}
          </Map>
        </YMaps>
      </div>
    </div>
  );
}
