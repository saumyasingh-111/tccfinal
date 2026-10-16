import React from "react";
import { Coffee, Cake, Wheat, Croissant, Heart } from "lucide-react";

interface ValuePropItem {
  icon: React.ReactNode;
  label: string;
}

export const ValuePropsBar: React.FC = () => {
  const items: ValuePropItem[] = [
    {
      icon: <Croissant className="w-5 h-5 text-[#0F3A23] stroke-[1.5]" />,
      label: "Freshly Baked Everyday",
    },
    {
      icon: <Coffee className="w-5 h-5 text-[#0F3A23] stroke-[1.5]" />,
      label: "Specialty Coffee",
    },
    {
      icon: <Cake className="w-5 h-5 text-[#0F3A23] stroke-[1.5]" />,
      label: "Cakes for Every Occasion",
    },
    {
      icon: <Wheat className="w-5 h-5 text-[#0F3A23] stroke-[1.5]" />,
      label: "Quality Ingredients",
    },
    {
      icon: <Heart className="w-5 h-5 text-[#0F3A23] stroke-[1.5]" />,
      label: "A Cosy Space for Everyone",
    },
  ];

  return (
    <section className="bg-[#FAF6F0] border-y border-[#E2D9CC] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#E2D9CC]/80">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center text-center p-3 sm:px-4 py-4 md:py-1 ${
                idx === 4 ? "col-span-2 md:col-span-1" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#E8DFD1]/50 flex items-center justify-center mb-2.5 transition-transform hover:scale-110">
                {item.icon}
              </div>
              <span className="font-serif text-sm sm:text-base text-[#162820] font-bold leading-snug">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
