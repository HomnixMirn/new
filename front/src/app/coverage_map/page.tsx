"use client";
import React, { useState, useEffect } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import axi from "@/utils/api";

export default function CoverageMap({ apiKey = "ваш_ключ_яндекс_карт" }) {
  const [activeTab, setActiveTab] = useState<"offices" | "coverage">("offices");
  const [show4g, setShow4g] = useState(true);
  const [show3g, setShow3g] = useState(true);
  const [show2g, setShow2g] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBalloonOpen, setIsBalloonOpen] = useState(false);
  const [offices, setOffices] = useState([]);

  const handlePlacemarkClick = () => {
    setIsBalloonOpen(true);
  };

  useEffect(() => {
    axi.get("/map/all_office").then((response) => {
      console.log(response.data);
      setOffices([...response.data]);
    });
  }, []);

  const createBalloonContent = (office) => {
    return `
      <div style="width: 350px; height: 130px; border-radius: 8px; display: flex; flex-direction: column; padding: 16px; box-sizing: border-box; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
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
        <button style="margin-top: auto; background: #3fcbff; border: none; padding: 8px 16px; border-radius: 4px; color: white; cursor: pointer; align-self: flex-start;">
          Подробнее
        </button>
      </div>
    `;
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
        {(
          <div>
            <h1>Коментарии</h1>
            <div>
                
              <div>

              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 h-[calc(100vh-68px)] z-0">
        <YMaps query={{ apikey: apiKey }}>
          <Map
            defaultState={{
              center: [56.19, 44.0],
              zoom: 10,
            }}
            width="100%"
            height="100%"
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
                  balloonOffset: [0, -40],
                  balloonAutoPan: true,
                  balloonCloseButton: true,
                  balloonPanelMaxMapArea: 0,
                }}
                onClick={handlePlacemarkClick}
                modules={["geoObject.addon.balloon", "geoObject.addon.hint"]}
              />
            ))}
          </Map>
        </YMaps>
      </div>
    </div>
  );
}
