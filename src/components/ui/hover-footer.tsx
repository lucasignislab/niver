"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const TextHoverEffect = ({
  text,
  duration,
  className,
}: {
  text: string;
  duration?: number;
  automatic?: boolean;
  className?: string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      });
    }
  }, [cursor]);

  return (
    <div
      className={cn("w-full h-full select-none uppercase cursor-pointer group", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
    >
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 800 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
          cx="50%"
          cy="50%"
          r="35%"
        >
          <stop offset="0%" stopColor="#FFB800" />
          <stop offset="25%" stopColor="#FFD54A" />
          <stop offset="50%" stopColor="#FFE082" />
          <stop offset="75%" stopColor="#E5A600" />
          <stop offset="100%" stopColor="#FFB800" />
        </linearGradient>

        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="28%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMask">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#revealMask)"
          />
        </mask>
      </defs>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="1.6"
        className="fill-transparent font-['Montserrat'] text-[6rem] md:text-[7rem] lg:text-[8rem] font-bold tracking-normal"
        stroke="#FFB80066"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{ opacity: 1 }}
      >
        {text}
      </text>
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="2"
        className="fill-transparent font-['Montserrat'] text-[6rem] md:text-[7rem] lg:text-[8rem] font-bold tracking-normal opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        stroke="#FFB800"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{
          strokeDashoffset: 0,
          strokeDasharray: 1000,
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
        }}
        style={{ opacity: hovered ? 1 : 0 }}
      >
        {text}
      </motion.text>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="2"
        className="fill-transparent font-['Montserrat'] text-[6rem] md:text-[7rem] lg:text-[8rem] font-bold tracking-normal opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{
          opacity: hovered ? 1 : 0,
          filter: hovered ? "drop-shadow(0 0 10px #FFB800) drop-shadow(0 0 28px #FFB800)" : "none",
        }}
      >
        {text}
      </text>
    </svg>
    </div>
  );
};


export const FooterBackgroundGradient = () => {
  return (
    <div
      className="absolute inset-0 z-0 bg-black"
      style={{
        background: "#000000",
        pointerEvents: "none",
      }}
    />
  );
};
