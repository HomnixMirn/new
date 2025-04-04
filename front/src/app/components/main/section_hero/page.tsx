"use client";
import Image from "next/image";
import SolidButton from "@components/buttons/solid_button/page";
import HollowButton from "@components/buttons/hollow_button/page";
import { useNotificationManager } from "@/hooks/notification-context";

export default function SectionHero() {
  const { addNotification } = useNotificationManager();

  return (
    <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-12 px-4 sm:py-16">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <div className="lg:w-1/2 text-center lg:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">SKILLSWAP</span> — обменивайся услугами
            и получай знания без денег!
          </h1>

          <p className="text-lg md:text-xl mb-8">
            Предоставляй свои услуги через{" "}
            <span className="font-semibold">SKILLSWAP</span> и получай взамен
            курсы, обучение и помощь в любых направлениях. Без денег, по системе
            "услуга за услугу".
          </p>

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-8">
            <SolidButton
              onClick={() => {
                addNotification({
                  title: "info",
                  description: "Услуга предложена",
                  createdAt : new Date(),
                  id : 0,
                  status: "102",
                })
              }}
              label="Предложить услугу"
            />
            <HollowButton
              onClick={() => console.log("my dick")}
              label="Найти услугу"
            />
          </div>

          <div className="flex flex-wrap justify-center lg:justify-start gap-6">
            <div className="flex items-center">
              <span className="text-xl font-bold mr-2">1k+</span>
              <span>Мастеров</span>
            </div>
            <div className="flex items-center">
              <span className="text-xl font-bold mr-2">50+</span>
              <span>Направлений</span>
            </div>
            <div className="flex items-center">
              <span className="text-xl font-bold mr-2">5k+</span>
              <span>Обменов</span>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 mt-8 lg:mt-0 order-2 lg:order-none">
          <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden shadow-2xl">
            <Image
              src="/image/heroImage.jpg"
              alt="Обмен услугами"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
