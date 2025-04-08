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
import { useUser } from "@/hooks/user-context";

export default function CoverageMap({
  apiKey = "43446600-2296-4713-9c16-4baf8af7f5fd",
}) {
  const [activeTab, setActiveTab] = useState<"offices" | "coverage">("offices");
  const [show4g, setShow4g] = useState(true);
  const [show3g, setShow3g] = useState(true);
  const [show2g, setShow2g] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBalloonOpen, setIsBalloonOpen] = useState(false);
  const [offices, setOffices] = useState([]);
  const [comments, setComments] = useState([]);
  const [cells, setCells] = useState([]);
  const [newComment, setNewComment] = useState({
    text: "",
    rating: 5,
    officeId: null,
  });
  const [selectedOffice, setSelectedOffice] = useState(null);
  const mapRef = useRef(null);
  const [mapBounds, setMapBounds] = useState(null);

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
      const dx = (radius / 111000) * Math.cos(angle); // 1° lat ~ 111km
      const dy =
        (radius / (111000 * Math.cos(lat * (Math.PI / 180)))) * Math.sin(angle); // longitude compensation
      coords.push([lat + dx, lon + dy]);
    }

    return coords;
  };

  const getUnifiedCoverageArea = (centers, radius) => {
    let allPoints = [];
    centers.forEach((center) => {
      const polygon = generatePolygonCoords(center, radius);
      allPoints.push(...polygon);
    });

    const convexHull = getConvexHull(allPoints);
    return [convexHull];
  };
  const coverageCenters = [
    [56.345, 43.85], // северо-запад
    [56.33, 44.0],
    [56.31, 44.15], // северо-восток
    [56.25, 44.25], // восток
    [56.18, 44.28],
    [56.11, 44.23], // юго-восток
    [56.07, 44.1], // юг
    [56.06, 43.95], // юго-запад
    [56.1, 43.8],
    [56.18, 43.75], // запад
    [56.26, 43.77],
  ];

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
    axi.get("/map/all_office").then((response) => {
      console.log(response.data);
      setOffices([...response.data]);
    });
  }, []);

  useEffect(() => {
    if (!mapBounds || !mapBounds[0] || !mapBounds[1]) {
      console.error("mapBounds is not properly initialized");
      return;
    }
    axi
      .post("/map/all_cells", {
        left_top: mapBounds[0],
        right_top: mapBounds[1],
      })
      .then((response) => {
        setCells([...response.data]);
        console.log(response.data);
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
      console.error("Error fetching comments:", error.response?.data);
    }
  };

  const getMapBounds = (mapRef: React.RefObject<any>) => {
    if (!mapRef.current) return null;

    const map = mapRef.current;
    const bounds = map.getBounds();

    if (!bounds) return null;

    return [
      [bounds[0][0], bounds[0][1]], // Юго-западная точка (southWest)
      [bounds[1][0], bounds[1][1]], // Северо-восточная точка (northEast)
    ];
  };

  const handleBoundsChange = () => {
    const bounds = getMapBounds(mapRef);
    console.log(bounds);
    setMapBounds(bounds);
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
      <div border-radius: 20px; style="width: 350px; height: 150px; display:flex; flex-direction:column; background:white;">
        <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">
        <h1>Адрес офиса</h1>
        ${
          office.address
        }</div>
        <div style="display: flex; flex-direction: column; margin-bottom: 8px;">
          <h1 style="font-size: 14px; color: black">Режим работы:</h1>
          <span style="font-size: 14px; color: #B0B0B0">${
            office.working_hours || "9:00 - 18:00"
          }</span>
        </div>
        <button onclick="window.dispatchEvent(new CustomEvent('showComments', { detail: ${
          office.id
        } }))" 
          style="margin-top: auto; background: #3fcbff; border: none; padding: 8px 16px; border-radius: 4px; color: white; cursor: pointer; align-self: flex-start;">
          ${office.reting}
        </button>
      </div>
    `;
  };

  function setShowCommentForm(arg0: boolean): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="flex h-[calc(100vh-68px)]">
      <div className="w-[444px] bg-white flex-col shadow-[4px_0_10px_0_rgba(0,0,0,0.3)] relative z-10 overflow-scroll">
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
          <div className="filter-search relative bg-[#ffffff] p-4">
            <div className="flex items-center relative">
              <span
                className="my-position-icon absolute left-3 cursor-pointer z-10"
                title="Определить мое местоположение"
              />
              <div className="relative flex-grow">
                <input
                  id="addressQuery"
                  className="bg-white text-gray-800 w-full pl-10 pr-10 py-3 
                  border-2 border-[#000000] 
                  focus:outline-none focus:border-2 focus:border-black
                  placeholder:text-gray-400 rounded-[10px]"
                  type="text"
                  placeholder="город, адрес или метро"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                />
                <Image 
                  src="/images/icons/Icon.svg" 
                  alt="Search" 
                  width={20} 
                  height={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                />
              </div>
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
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

        <div className="flex-1 bg-black text-white p-4 flex flex-col" style={{ height: 'calc(100vh - 68px - 32px)' }}>
          <div className="flex-1 overflow-y-auto">
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
                        <span className={`text-2xl ${index === 0 ? "text-[#d50069]" : "text-white"}`}>
                          📍
                        </span>
                        <div>
                        <p className="font-bold text-base">${office.address}</p>
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
            
            {selectedOffice && (
              <div className="p-4 bg-black shadow-lg rounded-lg mt-4 relative">
                <button 
                  onClick={() => setSelectedOffice(null)}
                  className="absolute top-2 right-2 text-white hover:text-gray-500"
                  aria-label="Закрыть отзывы"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <h2 className="text-xl font-semibold mb-4 text-white">Комментарии</h2>
                {!setShowCommentForm && (
                  <button
                    onClick={() => setShowCommentForm(true)}
                    className="mb-4 bg-[#3fcbff] text-white px-4 py-2 rounded-md hover:bg-[#35b5e6]"
                  >
                    Оставить отзыв
                  </button>
                )}
                  <div className="max-h-[50vh] overflow-y-auto">
                    <div className="space-y-4">
                      {comments.length > 0 ? (
                        comments.map(comment => (
                          <div key={comment.id} className="border-b border-gray-700 pb-4">
                            <div className="flex items-center gap-3">
                              <div>
                                <h3 className="font-medium text-white">
                                  {comment.author.user.username}
                                </h3>
                                <StarRating 
                                  rating={comment.rating} 
                                  starColor="#3fcbff"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <p className="text-white mt-2 ml-11">{comment.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">Пока нет отзывов. Будьте первым!</p>
                      )}
                    </div>
                  </div>
                {setShowCommentForm && (
                  <form onSubmit={handleSubmitComment} className="mt-6">
                    <div className="mb-4">
                      <label className="block text-white mb-2">Ваш комментарий</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-white"
                        rows={3}
                        value={newComment.text}
                        onChange={(e) =>
                          setNewComment({ ...newComment, text: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-white mb-2">Ваша оценка</label>
                      <AddStarRating 
                        value={newComment.rating}
                        onChange={(rating) =>
                          setNewComment({ ...newComment, rating })
                        }
                      />
                    </div>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setShowCommentForm(false)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                      >
                        Отмена
                      </button>
                      <button
                        type="submit"
                        className="bg-[#3fcbff] text-white px-4 py-2 rounded-md hover:bg-[#35b5e6]"
                      >
                        Отправить отзыв
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 h-[calc(100vh-68px)] z-0">
        <YMaps query={{ apikey: apiKey }}>
          <Map
           
            instanceRef={(ref) => {
              if (ref && !mapRef.current) {
                mapRef.current = ref;
                const bounds = ref.getBounds();
                if (bounds) {
                  setMapBounds(bounds);
                }
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
                    balloonShadow: true,
                    balloonAutoPan: true,
                    balloonCloseButton: true,
                    balloonPanelMaxMapArea: 0,
                  }}
                  onClick={handlePlacemarkClick}
                  modules={["geoObject.addon.balloon", "geoObject.addon.hint"]}
                />
              ))}
            </Clusterer>

            {cells.map((cell) => {
              console.log(cell);
              return (
                <Placemark
                  key={cell.id}
                  geometry={[cell.latitude, cell.longitude]}
                  properties={{
                    balloonContent: `
                      <div class="custom-balloon">
                        <h3>${cell.name}</h3>
                        <p>Адрес: ${cell.address}</p>
                        <div class="stats">
                          <span>Мощность: ${cell.power} dBm</span>
                          <span>Пользователи: ${cell.users}</span>
                        </div>
                      </div>
                    `,
                    balloonContentHeader: `Ячейка ${cell.id}`,
                  }}
                  options={{
                    balloonLayout: "default#imageWithContent",
                    balloonCloseButton: true,
                    balloonAutoPan: true,
                  }}
                  modules={["geoObject.addon.balloon"]}
                />
              );
            })}

            <Polygon
              geometry={getUnifiedCoverageArea(coverageCenters, 4000)}
              options={{
                fillColor: "#FF349559",
                strokeColor: "#FF3495",
              }}
            />
          </Map>
        </YMaps>
      </div>
    </div>
  );
}
