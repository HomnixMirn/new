"use client";
import React from "react";
import Image from "next/image";
import SolidButton from "@/app/components/buttons/solid_button/page";

export default function Profile() {
  return (
    <div className="bg-white flex flex-col h-screen">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-[14vh]"></div>
      <div className="flex-1 p-6">
        <div className="flex flex-row items-center gap-6 ml-6">
          {/* Аватар */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg flex-shrink-0">
            <Image
              src="/path-to-your-image.jpg"
              alt="Profile"
              width={100}
              height={100}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="flex-grow ">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">John Doe</h1>
            <p className="text-gray-600">john.doe@example.com</p>
          </div>

          <div className="flex-shrink-0">
            <SolidButton
              onClick={() => {
                addNotification({
                  title: "Информация",
                  description: "Профиль отредактирован",
                  createdAt: new Date(),
                  id: 0,
                  status: 500,
                });
              }}
              label="Edit "
              color="gradient"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
