"use client";

import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import Image from "next/image";

const images = [
  { stack: "nextjs.png", alt: "Next.js logo", tooltip: "Next.js" },
  { stack: "nodejs.png", alt: "Node.js logo", tooltip: "Node.js" },
  { stack: "reactjs.png", alt: "React logo", tooltip: "React" },
  { stack: "expressjs.png", alt: "Express.js logo", tooltip: "Express.js" },
  { stack: "github.jpg", alt: "GitHub logo", tooltip: "GitHub" },
  { stack: "git.png", alt: "Git logo", tooltip: "Git" },
  { stack: "typescript.jpg", alt: "TypeScript logo", tooltip: "TypeScript" },
  { stack: "tailwind.jpg", alt: "Tailwind CSS logo", tooltip: "Tailwind CSS" },
  { stack: "supabase.jpg", alt: "Supabase logo", tooltip: "Supabase" },
  { stack: "firebase.png", alt: "Firebase logo", tooltip: "Firebase" },
  { stack: "mongodb.png", alt: "MongoDB logo", tooltip: "MongoDB" },
  { stack: "mysql.png", alt: "MySQL logo", tooltip: "MySQL" },
];
// function getStackFilenames(images :any , keywords: any) {
//   return keywords
//     .map((keyword: any) => {
//       const match = images.find(
//         (img : any) => img.stack.split(".")[0].toLowerCase() === keyword.toLowerCase()
//       );
//       return match ? match.stack : null;
//     })
//     .filter(Boolean);
// }

export default function InfiniteCarousel() {
  // AutoScroll runs as soon as the carousel is ready (playOnInit = true by default)
  const [emblaRef] = useEmblaCarousel(
    { loop: true }, // any Embla core options here
    [
      AutoScroll({
        speed: 2, // pixels per frame (default 2)
        startDelay: 0, // ms before it kicks in
        stopOnInteraction: false, // keep rolling after drags/taps
        stopOnMouseEnter: true, // keep rolling on hover
      }),
    ]
  );

  return (
    <div className="overflow-hidden w-full select-none" ref={emblaRef}>
      <div className="flex">
        {[...images, ...images, ...images].map((image, i) => (
          <div key={i} className="flex-[0_0_auto] w-64 h-40 relative bg-white border-2 hover:scale-105">
            {/* {image.stack} */}
            <Image
              src={`/images/techstack/${image.stack}`}
              alt=""
              fill
              className="object-contain opacity-50 hover:opacity-100 hover:animate-pulse transition-transform duration-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
