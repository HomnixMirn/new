"use client";
import React, { useState, useEffect, useRef } from "react";
import { YMaps, Map, Placemark, Clusterer } from "@pbe/react-yandex-maps";
import axi from "@/utils/api";
import Image from "next/image";
import Link from "next/link";
import AddStarRating from "../components/star_rating/add_star_rating";
import StarRating from "../components/star_rating/star_rating";
import { API_URL } from "@/index";

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
  const [cells , setCells] = useState([])
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

  useEffect(()=> {
    axi.get('/map/all_cells').then((response) => {
      setCells([...response.data])
      console.log(response.data)
    })
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
              ></button>
            )}
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
            <div></div>
          )}

          {selectedOffice && (
            <div className="p-4 bg-white shadow-lg rounded-lg mt-4 relative">
              <button
                onClick={() => setSelectedOffice(null)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                aria-label="Закрыть отзывы"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <h2 className="text-xl font-semibold mb-4">Комментарии</h2>

              {!setShowCommentForm && (
                <button
                  onClick={() => setShowCommentForm(true)}
                  className="mb-4 bg-[#3fcbff] text-white px-4 py-2 rounded-md hover:bg-[#35b5e6]"
                >
                  Оставить отзыв
                </button>
              )}
              <div className="max-h-[60vh] overflow-y-auto pr-2">
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="border-b border-gray-200 pb-4"
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">
                            {comment.author.username}
                          </h3>
                          <StarRating
                            rating={comment.rating}
                            starColor="#000000"
                          />
                        </div>
                        <p className="text-gray-600 mt-1">{comment.text}</p>
                        <p className="text-sm text-gray-400 mt-2">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">
                      Пока нет отзывов. Будьте первым!
                    </p>
                  )}
                </div>
                {setShowCommentForm && (
                  <form onSubmit={handleSubmitComment} className="mt-6">
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">
                        Ваш комментарий
                      </label>
                      <textarea
                        className="w-full bg-black px-3 py-2 border border-gray-300 rounded-md text-white"
                        rows={3}
                        value={newComment.text}
                        onChange={(e) =>
                          setNewComment({ ...newComment, text: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">
                        Ваша оценка
                      </label>
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

            {cells.map((cell) => {
              console.log(cell)
              return (
                <Placemark
                  key={cell.id}
                  geometry={[cell.latitude, cell.longitude]}
                  properties={{
                    balloonContent: createBalloonContent(cell),
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
                  
                  modules={["geoObject.addon.balloon", "geoObject.addon.hint"]}
                />
              )
            }
              
            )
            }
          </Map>
        </YMaps>
      </div>
    </div>
  );
}
