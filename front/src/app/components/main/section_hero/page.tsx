import React from "react";
import SolidButton from "../../buttons/solid_button.tsx/page";
import HollowButton from "../../buttons/hollow_button.tsx/page";

export default function SectionHero() {
  return (
    <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4">
      <div className="mx-auto text-center">
        <div className="flex flex-row justify-center gap-4">
          <SolidButton onClick={() => alert("vlad")} label="Начать обмен" />
          <HollowButton
            onClick={() => alert("vitalya")}
            label="Как это работает?"
          />
        </div>
      </div>
    </section>
  );
}
