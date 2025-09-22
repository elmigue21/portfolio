import Image from 'next/image'
import React from 'react'
import {motion} from 'framer-motion'
import { useState } from 'react';

type SpinUrlProps = {
  image: string;
  link: string;
  text: string;
};

function SpinUrl({ image, link,text }: SpinUrlProps) {
  const MotionImage = motion(Image);
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      className={`relative w-60 h-60 rounded-full text-white flex items-center justify-center whitespace-nowrap p-2 aspect-square ${
        hovered ? "" : "overflow-hidden"
      }`}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
      // animate={hovered ? {rotate : 360} : {rotate : 0}}
    >
      <MotionImage
        src={image}
        fill
        alt="qweqweqwe"
        className="object-contain rounded-full bg-white"
        animate={{
            rotate: hovered ? 360 : 0,
            opacity: hovered ? 0 : 1,
        }}
        transition={{
          rotate: { duration: 1, ease: "easeInOut" },
          opacity: { duration: 1, ease: "easeInOut" }, // slower opacity
        }}
      />
      <motion.a
        className={`hover:cursor-pointer whitespace-nowrap active:text-white active:font-bold ${link ? "text-blue-400 underline":""}`}
        href={link || undefined}
        animate={
          hovered ? { rotate: 360, opacity: 1 } : { rotate: 0, opacity: 0 }
        }
        transition={{
          duration: 0.5, // how long the animation lasts
          delay: hovered ? 0.2 : 0, // delay only on hover in
          ease: "easeInOut",
        }}
      >
        {text}
      </motion.a>
    </motion.div>
  );
}

export default SpinUrl