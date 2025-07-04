'use client'
import Image from "next/image";
// import {Avatar} from '@/components/ui/avatar'
import {motion} from 'framer-motion'
import {Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useEffect, useState /* ,useRef */} from "react";
import InfiniteCarousel from "@/components/InfiniteCarousel";
import { Skeleton } from "@/components/ui/skeleton";
// import BubbleHoverButton from "@/components/BubbleWrapper";
import BubbleWrapper from "@/components/BubbleWrapper";
export default function Home() {

  const fullText = "Welcome to my Portfolio!"
  const [welcome,setWelcome] = useState("")
  const [index, setIndex] = useState(0);
  const projects = [
    {
      name: "Dempa",
      src: "/dempa.png",
      desc: "",
      srcAlt: "dempa logo",
      techStacks: ["nextjs", "supabase", "reactjs",'expressjs','nodejs','git','github','tailwindcss'],
    },
    {
      name: "Ypiresia Jireh",
      src: "/yj.png",
      desc: "",
      srcAlt: "yj logo",
      techStacks: ["nextjs", "mongodb", "reactjs",'tailwindcss'],
    },
    {
      name: "The Sideshop",
      src: "/sideshop.png",
      desc: "",
      srcAlt: "sideshop logo",
      techStacks: ["nextjs", "mysql", "reactjs"],
    },
    {
      name: "Bloo's Tales",
      src: "/bloo.png",
      desc: "",
      srcAlt: "bloo",
      techStacks: ["csharp"],
    },
    {
      name: "Stratify",
      src: "/bpi.png",
      desc: "",
      srcAlt: "stratify",
      techStacks: ["nextjs", "mongodb", "reactjs"],
    },
    {
      name: "Likagi",
      src: "/likagi.png",
      desc: "",
      srcAlt: "likagi",
      techStacks: ["vue"],
    },
    {
      name: "Kaboom",
      src: "/kaboom.png",
      desc: "",
      srcAlt: "kaboom",
      techStacks: ["javascript"],
    },
  ];

  const orgs = [
    { name: "Adamson Computer Science Society",role:"Logistics Director", src: "acomss.jpg" },
    { name: "Amazon Web Services Cloud Club Philippines", role:"Technology Department Frontend Developer",src: "awscc.jpg" },
  ];


  useEffect(() => {
    if (index < fullText.length) {
      console.log("index:", index, "length:", welcome.length);
      const timeout = setTimeout(() => {
        setWelcome((prev) => prev + fullText[index] + "");
        setIndex(index + 1);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [index, fullText, welcome.length]);

  return (
    <div className="bg-slate-900 flex items-center justify-center h-full flex-col">
      <Avatar className="w-24 sm:w-40 md:w-80 xl:w-80 m-5 aspect-square flex items-center justify-center">
        <AvatarImage
          src="/images/self.jpg"
          className="rounded-full"
        ></AvatarImage>
        <AvatarFallback className="w-full h-full p-0 flex items-center justify-center">
          <Skeleton className="w-full h-full rounded-full bg-white" />
        </AvatarFallback>
      </Avatar>
      <h1 className="2xl:text-9xl text-lalezar text-white">
        {welcome.substring(0, index)}
        {index < fullText.length && (
          <motion.span
            className="inline-block w-[0.6ch] text-white text-center"
            animate={{ opacity: [0, 1] }}
            transition={{
              duration: 0.2, // lower = faster blink
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            _
          </motion.span>
        )}
      </h1>
      <h1 className="text-white font-lalezar  text-3xl sm:text-5xl 2xl:text-9xl text-center">
        MIGUEL JOHN CAACBAY
      </h1>
      <h2 className="text-white font-lalezar text-2xl sm:text-4xl 2xl:text-8xl text-center">
        FULL STACK DEVELOPER
      </h2>
      {/* <BubbleHoverButton /> */}
      <div className="w-full bg-sky-800 py-2 my-2">
        <h3 className=" text-white 2xl:text-3xl font-lalezar">
          TECHNOLOGIES AND FRAMEWORKS
        </h3>
        {/* <h1 style={{ fontFamily: "Lalezar, cursive" }}>Does this work?</h1> */}
      </div>
      <InfiniteCarousel />

      <div className="w-full bg-sky-800 py-2 my-2">
        <h3 className=" text-white 2xl:text-3xl font-lalezar">PROJECTS</h3>
        {/* <h1 style={{ fontFamily: "Lalezar, cursive" }}>Does this work?</h1> */}
      </div>

      <div className="flex flex-wrap w-full gap-4 items-center justify-center m-5">
        {projects.map((project, index) => {
          return (
            <BubbleWrapper key={index} stacks={project.techStacks}>
              <div className="flex bg-white border-9 border-sky-800 rounded-2xl h-40 w-full sm:w-3/4 md:w-[500px] overflow-hidden hover:cursor-pointer hover:scale-105 transition-all hover:text-sky-500 hover:border-2 duration-300">
                <motion.div
                  className="relative min-h w-20 md:w-32 md:h-32 flex items-center justify-center h-full my-auto rounded-full overflow-hidden m-2"
                  initial={{ x: -100 }}
                  animate={{ x: 0 }}
                  transition={{
                    duration: 1.2,
                    ease: "easeOut",
                  }}
                >
                  <Image
                    src={`/images/projects${project.src}`}
                    alt={project.srcAlt}
                    fill
                    className="object-contain"
                  />
                </motion.div>

                <div className="flex items-center justify-center flex-1 border-2 border-sky-800 m-2 rounded-2xl font-lalezar">
                  <h2 className="2xl:text-5xl">{project.name}</h2>
                </div>
              </div>
            </BubbleWrapper>
          );
        })}
      </div>

      <div className="w-full bg-sky-800 py-2 my-2">
        <h3 className=" text-white 2xl:text-3xl font-lalezar">
          ORGANIZATIONAL EXPERIENCE
        </h3>
      </div>
      <div className="flex">
        {orgs.map((org, index) => {
          return (
            <div
              className="bg-white w-[40vw] h-40 border-8 gap-3 m-5 flex items-center border-sky-800"
              key={index}
            >
              <motion.div className="relative h-32 w-32 rounded-full overflow-hidden">
                <Image
                  src={`/images/orgs/${org.src}`}
                  alt="asdasd"
                  fill
                  className="object-cover"
                />
              </motion.div>
              <span className="flex-1">
                <h3 className="font-lalezar text-5xl">{org.name}</h3>
                <h4 className="">{org.role}</h4>
              </span>
            </div>
          );
        })}
      </div>
      <div className="w-full bg-sky-800 py-2 my-2">
        <h3 className=" text-white 2xl:text-3xl font-lalezar">LINKS & CONTACTS</h3>
        {/* <h1 style={{ fontFamily: "Lalezar, cursive" }}>Does this work?</h1> */}
      </div>

      
    </div>
  );
}
