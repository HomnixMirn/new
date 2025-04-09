"use client";
import React from "react";

interface ServicesProps {
  services: string[];
  onServiceToggle: (service: string) => void;
}

const Services: React.FC<ServicesProps> = ({ services, onServiceToggle }) => {
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
      {AllServices.map((service, index) => (
        <div key={index} className="flex gap-5 items-center">
          <input
            type="checkbox"
            checked={services.includes(service)}
            onChange={() => onServiceToggle(service)}
            className="w-5 h-5 accent-[#d50069] rounded"
          />
          <p className="text-white">{service}</p>
        </div>
      ))}
    </div>
  );
};

export default Services;