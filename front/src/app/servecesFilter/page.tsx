"use client";
import React from "react";

interface ServicesProps {
  services: string[];
  onServiceToggle: (service: string) => void;
  setServices : () => void
}

const Services: React.FC<ServicesProps> = ({ services, onServiceToggle, setServices }) => {
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
  function handleCheckService(e, service){
    if (e.target.checked){
      console.log('да')
      setServices([...services,service])
      
    }
    else{
      setServices(services.filter((v)=> v!== service))
      console.log("нет")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {AllServices.map((service, index) => (
        <div key={index} className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={services.includes(service)}
            onChange={(e) => handleCheckService(e,service)}
            className="w-4 h-4 accent-[#d50069] mr-2 rounded flex-shrink-0 mt-0.5"
          />
          <p className="text-white">{service}</p>
        </div>
      ))}
    </div>
  );
};

export default Services;