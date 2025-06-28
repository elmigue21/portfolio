import { motion } from "framer-motion";
import { useState, useRef, useLayoutEffect } from "react";
import { getStackExtension } from "@/app/helpers/getStackExtension";
import Image from "next/image";

// const techBubbles = [
//   { src: "reactjs", alt: "React" },
//   { src: "nextjs", alt: "Next.js" },
//   { src: "nodejs", alt: "Node.js" },
//   { src: "reactjs.", alt: "React" },
//   { src: "nextjs", alt: "Next.js" },
//   { src: "nodejs", alt: "Node.js" },
// ];

export default function BubbleWrapper({
  children,stacks
}: {
  children: React.ReactNode, stacks:string[]
}) {
  const [hovered, setHovered] = useState(false);
  const [bubbleSize, setBubbleSize] = useState(0);
  const probeRef = useRef<HTMLDivElement>(null);
  const stackValues = getStackExtension(stacks);


  useLayoutEffect(() => {
    if (probeRef.current) {
      setBubbleSize(probeRef.current.offsetHeight);
    }
  }, []);

  const GAP = 12;
  const TARGET_Y = -(bubbleSize + GAP);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Wrapped children */}
      {children}
      {/* Bubbles */}
      {/* <div className="flex items-center justify-center"> */}
      
      {stackValues.map((bubble, i) => {
        const total = stackValues.length;
        const middle = Math.floor(total / 2);
        // const offset = (i - (techBubbles.length - 1) / 2) * 60;

        return (
          <motion.div
            key={i}
            ref={i === 0 ? probeRef : undefined}
            className="absolute top-1/2 left-1/2 w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500 bg-white shadow-md pointer-events-none"
            initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
            animate={
              hovered
                ? {
                    opacity: 1,
                    scale: 2,
                    x: (i - middle) * 70,
                    y: TARGET_Y,
                    transition: {
                      // delay: i * 0.1,
                      duration: 0.4,
                      ease: "easeOut",
                    },
                  }
                : {
                    opacity: 0,
                    scale: 0,
                    x: "-50%",
                    y: "-50%",
                    transition: {
                      duration: 0.3,
                      ease: "easeIn",
                    },
                  }
            }
          >

              <Image
                src={`/images/techstack/${bubble.stack}.${bubble.extension}`}
                alt={bubble.alt}
                fill
                className="object-contain"
                // sizes="(max-width: 640px) 6rem, (max-width: 768px) 8rem, 10rem"
              />
          </motion.div>
        );
      })}
      {/* </div> */}
    </div>
  );
}
