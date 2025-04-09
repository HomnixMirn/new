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
  const [newComment, setNewComment] = useState({
    text: "",
    rating: 5,
    officeId: null,
  });
  const [selectedOffice, setSelectedOffice] = useState(null);
  const mapRef = useRef(null);
  const [mapBounds, setMapBounds] = useState([]);

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
    if (services !== []) {
      const query = services.map((service) => `${service}`).join(",");
      axi.get("/map/all_office?services=" + query).then((response) => {
        console.log(response.data);
        setOffices([...response.data]);
      });
    } else {
      axi.get("/map/all_office").then((response) => {
        console.log(response.data);
        setOffices([...response.data]);
      });
    }
  }, [services]);

  useEffect(() => {
    const data = {
      left_bottom: mapBounds[0],
      right_top: mapBounds[1],
    };
    axi.post("/map/all_cells", data).then((response) => {
      setCells(response.data);
      console.log(response.data);
    });
  }, [mapBounds]);

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
      [bounds[0][0], bounds[0][1]], // Юго-западная точка (southWest)
      [bounds[1][0], bounds[1][1]], // Северо-восточная точка (northEast)
    ];
  };

  const handleBoundsChange = () => {
    const bounds = getMapBounds(mapRef);
    console.log("Current bounds:", bounds[0], bounds[1]);
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

  function setShowCommentForm(arg0: boolean): void {
    throw new Error("Function not implemented.");
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

    function servicesUpdateHandle(servic) {
      if (services.includes(servic)) {
        const index = services.indexOf(servic);
        services.splice(index, 1);
        console.log(services);
      } else {
        setServices([...services, servic]);
      }
    }
    return (
      <div className="flex flex-col gap-5">
        {AllServices.map((service) => (
          <div className="flex gap-5">
            <input
              type="checkbox"
              checked={services.includes(service)}
              onClick={() => servicesUpdateHandle(service)}
              name=""
              id=""
            />
            <p className="">{service}</p>
          </div>
        ))}
      </div>
    );
  };
  function Offices() {
    const handleApplyServices = (selectedServices: Record<string, boolean>) => {
      console.log("Применены фильтры:", selectedServices);
          
    };

    return (
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Офисы T2</h2>
          <h2
            className="text-xl font-bold"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Услуги
          </h2>

          {/* onApply={handleApplyServices}  */}
        </div>
        <div className="flex-1 overflow-y-auto mt-2 space-y-8 pr-2 h-[400px] custom-scrollbar">
          {isDropdownOpen ? (
            <Services />
          ) : (
            <>
              {offices.map((office, index) => (
                <div
                  key={office.id}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-start gap-3">
                    <Image
                      src="/images/Icons/point.svg"
                      alt="point"
                      width={25}
                      height={25}
                    />
                    <div>
                      <div className="font-bold">{office.address}</div>
                      <div className="text-sm text-gray-400">
                        {office.souring}
                      </div>
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
              ))}{" "}
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
                className="text-gray-500"
              />
            </div>
          </div>

            <div className="mt-6 text-sm text-gray-800 space-y-2">
              <label className="flex items-center w-2/3 justify-center">
                <input
                  type="checkbox"
                  // checked={showOffices}
                  onChange={() => setShowTower(!showOffices)}
                  className="w-5 h-5 accent-[#d50069] mr-2 rounded"
                />
                Отобразить вышки на карте
              </label>
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

            {cells.map((cell, index) => {
              const polygonCoords = generatePolygonCoords(
                [cell.latitude, cell.longitude],
                4000
              );

              return (
                <Polygon
                  key={`polygon-${cell.id}`}
                  geometry={[polygonCoords]}
                  options={{
                    fillColor: "#FF3495",
                    fillOpacity: 0.3,
                    strokeColor: "#FF3495",
                    strokeWidth: 0,
                    zIndex: 1000,
                  }}
                />
              );
            })}
          </Map>
        </YMaps>
      </div>
    </div>
  );
}
