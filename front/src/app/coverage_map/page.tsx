"use client";
import React, { useState, useEffect, useRef } from "react";
import { YMaps, Map, Placemark, Clusterer } from "@pbe/react-yandex-maps";
import axi from "@/utils/api";
import StarRating from "../components/star_rating/star_rating";

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
      <div className="w-[444px] bg-white flex-col shadow-[4px_0_10px_0_rgba(0,0,0,0.3)] relative z-10">
        <ul className="filter-tabs flex">
          <li className="flex-1">
            <button
              onClick={() => setActiveTab("offices")}
              className={`w-full h-[9vh] px-4 py-2 transition-colors ${
                activeTab === "offices"
                  ? "bg-[#3fcbff] text-black font-semibold"
                  : "bg-gray-100 text-black font-semibold hover:bg-gray-200"
              }`}
            >
              Офисы продаж
            </button>
          </li>
          <li className="flex-1">
            <button
              onClick={() => setActiveTab("coverage")}
              className={`w-full h-[9vh] px-4 py-2 transition-colors ${
                activeTab === "coverage"
                  ? "bg-[#3fcbff] text-black font-semibold"
                  : "bg-gray-100 text-black font-semibold hover:bg-gray-200"
              }`}
            >
              Карта покрытия
            </button>
          </li>
        </ul>
        <div className="filter-search relative bg-[#3fcbff] p-4 ">
          <div className="flex items-center relative">
            <span
              className="my-position-icon absolute left-3 cursor-pointer"
              title="Определить мое местоположение"
            />
            <input
              id="addressQuery"
              className="bg-white text-gray-800 w-full pl-10 pr-12 py-3 
            border-2 border-[#448EA9] 
            focus:outline-none focus:border-2 focus:border-black
            placeholder:text-gray-400"
              type="text"
              placeholder="город, адрес или метро"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            {searchQuery && (
              <button
                className="clear absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
                onClick={() => setSearchQuery("")}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {activeTab === "offices" ? (
          <div className="filter-results-container with-desktop-vertical-scrollbar"></div>
        ) : (
          <div className="coverage-filter"></div>
        )}

        {selectedOffice && (
          <div className="p-4 bg-white shadow-lg rounded-lg mt-4">
            <h2 className="text-xl font-semibold mb-4">Комментарии</h2>

            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Ваш комментарий
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={newComment.text}
                  onChange={(e) =>
                    setNewComment({ ...newComment, text: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Рейтинг</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newComment.rating}
                  onChange={(e) =>
                    setNewComment({
                      ...newComment,
                      rating: parseInt(e.target.value),
                    })
                  }
                >
                  {[5, 4, 3, 2, 1].map((num) => (
                    <option key={num} value={num}>
                      {num} звезд{num !== 1 ? "ы" : "а"}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-[#3fcbff] text-white px-4 py-2 rounded-md hover:bg-[#35b5e6]"
              >
                Отправить
              </button>
            </form>

            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-b border-gray-200 pb-4"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{comment.author.username}</h3>
                      <div className="text-yellow-500">
                        {"★".repeat(comment.rating)}
                        {"☆".repeat(5 - comment.rating)}
                      </div>
                    </div>
                    <p className="text-gray-600 mt-1">{comment.text}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  Пока нет комментариев. Будьте первым!
                </p>
              )}
            </div>
          </div>
        )}
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
