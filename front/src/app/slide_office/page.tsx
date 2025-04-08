"use client";
import Image from "next/image";
import React from "react";

export default function Offices() {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Офисы T2</h2>
        <button className="text-sm flex items-center gap-1">
          Услуги
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 h-[400px] custom-scrollbar">
        {[...Array(15)].map((_, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-start gap-3">
              <Image
                src="/images/Icons/point.svg"
                alt="point"
                width={30}
                height={30}
              />
              <div>
                <div className="font-bold">ул. Бекантура, 1</div>
                <div className="text-sm text-gray-400">
                  пн-пт 8:00-18:00 сб-вс 10:00-18:00
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
              <div>199</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


