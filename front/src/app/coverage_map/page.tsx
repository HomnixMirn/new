"use client";
import React, { useState, useEffect, useRef } from "react";
import { YMaps, Map, Placemark, Clusterer } from "@pbe/react-yandex-maps";
import axi from "@/utils/api";
import Image from "next/image";
import Offices from "../slide_office/page";
import CoverageRoaming from "../slide_cover/page";

export default function CoverageMap({
  apiKey = "43446600-2296-4713-9c16-4baf8af7f5fd",
}) {
  const [cells, setCells] = useState([]);// надо будет пофиксить
  const [activeTab, setActiveTab] = useState<"offices" | "coverage">("offices");
  const [show4g, setShow4g] = useState(true);
  const [show3g, setShow3g] = useState(true);
  const [show2g, setShow2g] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBalloonOpen, setIsBalloonOpen] = useState(false);
  const [offices, setOffices] = useState([]);
  const [comments, setComments] = useState([]);
  const [cells, setCells] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [services , setServices] = useState([])
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
    if (services !== []){
      const query = services.map((service) => `${service}`).join(",");
      axi.get("/map/all_office?services="+query).then((response) => {
        console.log(response.data);
        setOffices([...response.data]);
      });
    }
    else{
    axi.get("/map/all_office").then((response) => {
      console.log(response.data);
      setOffices([...response.data]);
    });}
  }, [services]);

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

  const Services = () =>{
    
    const AllServices =[
      "Подключают eSIM",
      "Подключают услуги «Ростелекома»",
      "Продают устройства по акции «Обмен минут на смартфоны и гаджеты»",
      "Подключают домашний интернет от t2",
      "Принимают платежи наличными на кассе",
      "Продают смартфоны в trade-in",
      "Обслуживают корпоративных клиентов",
      "Помогают с заменой SIM-карты другого региона"
    ]

    function servicesUpdateHandle(servic){
      if (services.includes(servic)){
        const index = services.indexOf(servic);
        services.splice(index, 1);
        console.log(services)
      }
      else {
        setServices([...services, servic])
      }
    }
    return(
      <div className="flex flex-col gap-5">
        
        
            {AllServices.map((service) =>(
              <div className="flex gap-5">
                <input type="checkbox" checked={services.includes(service)} onClick={() => servicesUpdateHandle(service)} name=""  id="" />
                <p className="">{ service}</p>
              </div>
            ))}
          
        
  
  
      </div>
    )
  }
  function Offices() {
    const handleApplyServices = (selectedServices: Record<string, boolean>) => {
      console.log("Применены фильтры:", selectedServices);
      // Здесь будет логика фильтрации офисов
    };
  
    return (
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Офисы T2</h2>
          <h2 className="text-xl font-bold" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>Услуги</h2>
          
          {/* onApply={handleApplyServices}  */}
        </div>
        <div className="flex-1 overflow-y-auto mt-2 space-y-8 pr-2 h-[400px] custom-scrollbar">
        {isDropdownOpen ? <Services/>:<>
        
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
          ))} </>   
        }
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
                strokeWidth: 2,
                strokeOpacity: 0.5,
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
