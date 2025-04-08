"use client";
import React, { useState, useEffect, useRef } from "react";
import { YMaps, Map, Placemark, Clusterer } from "@pbe/react-yandex-maps";
import axi from "@/utils/api";
<<<<<<< HEAD
import Image from "next/image";
import Link from "next/link";
=======
import StarRating from "../components/star_rating/star_rating";
>>>>>>> 0abda341c73ee984229c35ea867235076e7e5564

export default function CoverageMap({
  apiKey = "43446600-2296-4713-9c16-4baf8af7f5fd",
}) {
  const [activeTab, setActiveTab] = useState<"offices" | "coverage">("offices");
  const [searchQuery, setSearchQuery] = useState("");
  const [isBalloonOpen, setIsBalloonOpen] = useState(false);
  const [offices, setOffices] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    text: "",
    rating: 5,
    officeId: null,
  });
  const [selectedOffice, setSelectedOffice] = useState(null);
  const mapRef = useRef(null);

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
          duration: 500,
        })
        .then(() => {
          mapRef.current.setZoom(currentZoom + 1, {
            duration: 500,
          });
        });
    }
  };

  useEffect(() => {
    axi.get("/map/all_office").then((response) => {
      console.log(response.data);
      setOffices([...response.data]);
    });
  }, []);

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
      console.error("Error fetching comments:", error);
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
    const createBalloonContent = (office) => {
      const dayTranslation = {
        MONDAY: "Пн",
        TUESDAY: "Вт",
        WEDNESDAY: "Ср",
        THURSDAY: "Чт",
        FRIDAY: "Пт",
        SATURDAY: "Сб",
        SUNDAY: "Вс",
      };
    
      const groupSchedules = (schedules) => {
        const grouped = [];
    
        schedules.forEach((schedule) => {
          const existingGroup = grouped.find(
            (group) =>
              group.openTime === schedule.openTime &&
              group.closeTime === schedule.closeTime
          );
    
          if (existingGroup) {
            existingGroup.days.push(dayTranslation[schedule.day]);
          } else {
            grouped.push({
              days: [dayTranslation[schedule.day]],
              openTime: schedule.openTime,
              closeTime: schedule.closeTime,
            });
          }
        });
    
        return grouped;
      };
    
      const groupedSchedules = groupSchedules(office.daySchedules);
    
      const workHours = groupedSchedules
        .map((group) => {
          const daysRange =
            group.days.length > 1
              ? `${group.days[0]}-${group.days[group.days.length - 1]}`
              : group.days[0];
    
          return `${daysRange} ${group.openTime} - ${group.closeTime}`;
        })
        .join("\n");
    
      // Если office.rating не является числом, установите значение по умолчанию
      const rating = office.rating || 0; // Если рейтинг не указан, ставим 0
    
      return (
        <div
          style={{
            width: "350px",
            height: "200px",
            borderRadius: "8px",
            padding: "16px",
            backgroundColor: "white",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div style={{ fontSize: "14px" }}>Адрес офиса</div>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>
            {office.address}
          </div>
          <div style={{ marginTop: "10px" }}>
            <div style={{ fontSize: "14px", color: "black" }}>Режим работы</div>
            <div style={{ fontSize: "14px", color: "#B0B0B0" }}>
              {workHours || "Неуказан"}
            </div>
          </div>
    
          <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
            <div style={{ fontSize: "14px", marginRight: "10px" }}>Рейтинг:</div>
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* Компонент звезд */}
              <div style={{ marginRight: "5px" }}>
                <StarRating rating={rating} starColor="#FFD700" />{" "}
                {/* Используем компонент StarRating */}
              </div>
              {/* Числовой рейтинг */}
              <div style={{ fontSize: "14px" }}>{rating}</div>
            </div>
          </div>
    
          <button
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("showComments", { detail: office.id })
              )
            }
            style={{
              marginTop: "auto",
              background: "#3fcbff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              color: "white",
              cursor: "pointer",
            }}
          >
            Показать комментарии
          </button>
        </div>
      );
    };
    

  return (
    <div className="flex h-[calc(100vh-68px)] overflow-hidden">
      <div className="w-1/3 bg-white flex flex-col shadow-[4px_0_10px_0_rgba(0,0,0,0.3)] relative z-10">
      <div className="flex flex-col p-4 h-1/3">
        <div className="flex space-x-25 text-xl font-medium justify-center">
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
            onClick={() => setActiveTab("roaming")}
            className={`pb-1 border-b-2 transition-colors duration-200 ${
              activeTab === "roaming"
                ? "border-[#E6007E] text-black"
                : "border-transparent text-black hover:text-[#E6007E]"
            }`}
          >
            Роуминг
          </button>
        </div>

        <div className="mt-4 relative flex justify-center">
          <input
            type="text"
            placeholder="Что хочешь найти?"
            className="w-3/4 border border-gray-300 rounded-md p-2 pl-4 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#d50069]"
          />
          <div className="absolute right-[15%] top-1/2 transform -translate-y-1/2 pointer-events-none">
            <Image 
              src='/images/Icons/Icon.svg'
              alt="Поиск"
              width={20}
              height={20}
              className="text-gray-500"
            />
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-800 space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              // checked={showOffices}
              onChange={() => setShowOffices(!showOffices)}
              className="accent-[#d50069] mr-2"
            />
            Показывать офисы T2
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              // checked={showBusinesses}
              onChange={() => setShowBusinesses(!showBusinesses)}
              className="accent-[#d50069] mr-2"
            />
            Показывать бизнесы с T2
          </label>
        </div>
      </div>
        {activeTab === "offices" ? (
          <div className="filter-results-container with-desktop-vertical-scrollbar"></div>
        ) : (
          <div className="coverage-filter"></div>
        )}

      <div className="flex-1 bg-black text-white p-4 overflow-auto">
        {activeTab === "coverage" ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Офисы T2</h2>
              <button className="text-sm flex items-center gap-1">
                Услуги
                <span className="text-xl">🧾</span>
              </button>
            </div>

            <ul className="space-y-4">
              {[...Array(7)].map((_, index) => (
                <li key={index} className="flex justify-between items-center">
                  <div className="flex items-start gap-3">
                    <span
                      className={`text-2xl ${
                        index === 0 ? "text-[#d50069]" : "text-white"
                      }`}
                    >
                      📍
                    </span>
                    <div>
                      <p className="font-bold">ул. Бекантура, 1</p>
                      <p className="text-sm text-gray-400">
                        пн-пт 8:00-18:00 сб-вс 10:00-18:00
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    💬 199
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex justify-center">
              <button className="text-sm flex items-center gap-2 text-white">
                <span className="text-xl">⚙️</span> Фильтр
              </button>
            </div>
          </>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4">Роуминг</h2>
            <p className="text-sm text-gray-400">
              Здесь может быть список стран, тарифов или другие данные о роуминге.
            </p>
          </div>
        )}
      </div>
      </div>

      <div className="flex-1 h-[calc(100vh-68px)] z-0">
        <YMaps query={{ apikey: apiKey }}>
          <Map
            instanceRef={mapRef}
            defaultState={{
              center: [56.19, 44.0],
              zoom: 10,
            }}
            width="100%"
            height="100%"
          >
            <Clusterer
              options={{
                preset: "islands#blackClusterIcons",
                groupByCoordinates: false,
                clusterDisableClickZoom: true,
                clusterOpenBalloonOnClick: false,
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
                    iconImageHref: "/images/pointerIcon.svg",
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
          </Map>
        </YMaps>
      </div>
    </div>
  );
}
