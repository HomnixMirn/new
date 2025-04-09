"use client";
import React, { useState, useRef, useEffect } from "react";

interface ServicesDropdownProps {
  onApply: (selectedServices: Record<string, boolean>) => void;
  buttonClassName?: string;
  dropdownClassName?: string;
}

const serviceOptions = [
  { id: "homeInternet", label: "Подключают домашний интернет от t2" },
  { id: "exchangeOffer", label: "Продают устройства по акции «Обмен минут на смартфоны и гаджеты»" },
  { id: "eSIM", label: "Подключают eSIM" },
  { id: "simReplacement", label: "Помогают с заменой SIM-карты другого региона" },
  { id: "corporate", label: "Обслуживают корпоративных клиентов" },
  { id: "rostelecom", label: "Подключают услуги «Ростелекома»" },
  { id: "tradeIn", label: "Продают смартфоны в trade-in" },
  { id: "cashPayments", label: "Принимают платежи наличными на кассе" }
];

export function ServicesDropdown({ 
  onApply, 
  buttonClassName = "text-base font-bold hover:text-[#FF3495]",
  dropdownClassName = "w-80"
}: ServicesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>(
    serviceOptions.reduce((acc, opt) => ({ ...acc, [opt.id]: false }), {})
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне компонента
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleService = (id: string) => {
    setSelectedServices(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApply = () => {
    onApply(selectedServices);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 ${buttonClassName}`}
      >
        Услуги
        <ChevronIcon isOpen={isOpen} />
      </button>

      {isOpen && (
        <div className={`absolute mt-2 -right-2 bg-white rounded-md shadow-lg z-10 border border-gray-200 p-4 ${dropdownClassName}`}>
          <h3 className="font-bold mb-3 text-black">Поиск офиса по услугам</h3>
          
          <input 
            type="text" 
            placeholder="Адрес, город или метро"
            className="w-full border border-gray-300 rounded-md p-2 pr-4 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#d50069]"
            />
          
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {serviceOptions.map(option => (
              <label key={option.id} className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedServices[option.id]}
                  onChange={() => toggleService(option.id)}
                  className="mt-1 w-4 h-4 text-[#FF3495] rounded border-gray-300 focus:ring-[#FF3495]"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          
          <div className="flex justify-between mt-2">
            <button 
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-sm bg-black rounded-md hover:bg-white hover:text-black"
            >
              Отмена
            </button>
            <button 
              onClick={handleApply}
              className="px-3 py-1 text-sm bg-[#FF3495] text-white rounded-md hover:bg-white hover:text-[#FF3495]"
            >
              Применить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}