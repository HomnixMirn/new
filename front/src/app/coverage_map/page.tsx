"use client";
import React, { useState } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";

export default function CoverageMap({ apiKey = "ваш_ключ_яндекс_карт" }) {
  const [activeTab, setActiveTab] = useState<"offices" | "coverage">("offices");
  const [show4g, setShow4g] = useState(true);
  const [show3g, setShow3g] = useState(true);
  const [show2g, setShow2g] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
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

        {/* Tab Content */}
        {activeTab === "offices" ? (
          <div className="filter-results-container with-desktop-vertical-scrollbar">
            <div className="results-general">
              <div className="single-check">
                <input id="id20" className="checkbox" type="checkbox" />
                <label htmlFor="id20" className="checkbox-label">
                  Только работающие сейчас
                </label>
              </div>
              <div className="multi-check">
                <div className="slide-holder">
                  <a className="opener opener-small">
                    Подобрать офис по видам услуг
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="coverage-filter">
            <div className="h4 text-lg font-semibold mb-4">Виды сетей</div>
            <ul className="form-list space-y-4">
              <li className="4g flex items-start">
                <input
                  id="show4g"
                  className="checkbox mt-1"
                  type="checkbox"
                  checked={show4g}
                  onChange={(e) => setShow4g(e.target.checked)}
                />
                <label htmlFor="show4g" className="checkbox-label ml-2">
                  <span className="network font-medium text-blue-600">4G</span>
                  <div className="description text-sm text-gray-600 mt-1">
                    Очень быстрый интернет, видео в высоком качестве.
                  </div>
                </label>
              </li>
              <li className="3g flex items-start mt-4">
                <input
                  id="show3g"
                  className="checkbox mt-1"
                  type="checkbox"
                  checked={show3g}
                  onChange={(e) => setShow3g(e.target.checked)}
                />
                <label htmlFor="show3g" className="checkbox-label ml-2">
                  <span className="network font-medium text-green-600">3G</span>
                  <div className="description text-sm text-gray-600 mt-1">
                    Разговоры и интернет без ограничений, музыка и видео.
                  </div>
                </label>
              </li>
              <li className="2g flex items-start mt-4">
                <input
                  id="show2g"
                  className="checkbox mt-1"
                  type="checkbox"
                  checked={show2g}
                  onChange={(e) => setShow2g(e.target.checked)}
                />
                <label htmlFor="show2g" className="checkbox-label ml-2">
                  <span className="network font-medium text-yellow-600">
                    2G
                  </span>
                  <div className="description text-sm text-gray-600 mt-1">
                    Телефонная связь, интернет для новостей и социальных сетей.
                  </div>
                </label>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Карта */}
      <div className="flex-1 z-0">
        <YMaps query={{ apikey: apiKey }}>
          <Map
            defaultState={{
              center: [56.19, 44.0],
              zoom: 10,
            }}
            width="100%"
            height="100%"
          >
            <Placemark
              geometry={[56.19, 44.0]}
              properties={{
                balloonContent: "Москва, Красная площадь",
              }}
              options={{
                iconLayout: "default#image",
                iconImageHref: "/images/pointer.svg", // Укажите путь к вашему изображению
                iconImageSize: [40, 40], // Размеры изображения
                iconImageOffset: [-20, -40], // Смещение, чтобы центр изображения совпадал с точкой
              }}
            />
          </Map>
        </YMaps>
      </div>
    </div>
  );
}
