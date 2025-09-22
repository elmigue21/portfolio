"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Input } from "./ui/input";
import { IoIosCloseCircle } from "react-icons/io";
import ReactMarkdown from "react-markdown";
import { Avatar } from "./ui/avatar";
import { TiMessages } from "react-icons/ti";
import Image from "next/image";
import { useAnimation } from "framer-motion";
import { IoSend } from "react-icons/io5";
interface Message {
  message: string;
  isUser: boolean;
  id: number;
}

const ChatScreen = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  // const [messageCount , setMessageCount] = useState(0);

 const chatRef = useRef(null);
  // const scrollToBottom = () => {
  //   if (chatRef.current) {
  //     chatRef.current.scrollTop = chatRef.current.scrollHeight;
  //   }
  // };

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const [inputVal, setInputVal] = useState("");

  const appendToLastMessage = (chunk: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;

      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        message: updated[updated.length - 1].message + chunk,
      };
      return updated;
    });
  };

  const updateLastMessage = (newMessage: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev; // no messages yet
      return [
        ...prev.slice(0, -1), // keep everything except last
        { ...prev[prev.length - 1], message: newMessage }, // replace last
      ];
    });
  };

  const handleSubmit = async () => {
    setStreaming(true);
    addMessage({ message: inputVal, isUser: true, id: messages.length });

    try {
      const response = await fetch("http://localhost:8000/ask", {
        method: "POST", // or GET depending on your server
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: inputVal }),
      });
      setInputVal("");
      if (!response.body) {
        console.error("Readable stream not supported in this browser");
        return;
      }
      const resId = messages.length;

      addMessage({ message: "", isUser: false, id: resId });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      //  let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        if (chunk.trim().startsWith("{") && chunk.includes('"error"')) {
          const parsed = JSON.parse(chunk);
          throw new Error(parsed.error || "Unknown server error");
        }

        //  result += chunk;
        appendToLastMessage(chunk);
        console.log("Streamed chunk:", chunk); // <- here’s your partial AI output
      }
      setStreaming(false);
      // scrollToBottom();
    } catch (e) {
      console.error(e);
      //  addMessage({
      //    message: `[Error] ${
      //      e instanceof Error ? e.message : "Unknown error occurred."
      //    }`,
      //    isUser: false,
      //    id: messages.length,
      //  });
      updateLastMessage("Something went wrong. Please try again later.");

      setStreaming(false);
    }
  };

  const controls = useAnimation();
  const [isHover, setIsHover] = useState(false);

  useEffect(() => {
    console.log("pop up");
    // Start with pop-up
    controls.start({
      scale: 1,
      x: -200,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    });

    // After 10s, go back to initial
    const timer = setTimeout(() => {
      controls.start({
        scale: 0.5,
        opacity: 0,
        x: 0,
        transition: { duration: 0.5 },
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [controls, isHover]);

  useEffect(() => {
    const fetchData = async () => {
      setStreaming(true);

      try {
        const response = await fetch("http://localhost:8000/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: "Write an initial welcome to the user",
          }),
        });

        setInputVal("");

        if (!response.body) {
          console.error("Readable stream not supported in this browser");
          return;
        }

        const resId = messages.length;
        addMessage({ message: "", isUser: false, id: resId });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          if (chunk.trim().startsWith("{") && chunk.includes('"error"')) {
            const parsed = JSON.parse(chunk);
            throw new Error(parsed.error || "Unknown server error");
          }

          appendToLastMessage(chunk);
          // scrollToBottom();
          console.log("Streamed chunk:", chunk);
        }
      } catch (e) {
        console.error(e);
        updateLastMessage("Something went wrong. Please try again later.");
      } finally {
        setStreaming(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {!isOpen && (
        <motion.div
          onHoverStart={() => setIsHover(true)}
          onHoverEnd={() => setIsHover(false)}
          className="bg-blue-500 w-24 h-24 hover:text-white hover:scale-95 rounded-full fixed bottom-5 right-5 z-99 hover:cursor-pointer flex items-center justify-center"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <TiMessages className="scale-300" />
          <motion.div
            // initial={{x:0,scaleX:0,scaleY:0}}
            initial={{ scale: 0, opacity: 0 }}
            animate={controls}
            className="absolute bg-blue-500 rounded-t-full rounded-bl-full text-2xl p-5 text-nowrap"
          >
            Wanna ask anything?
          </motion.div>
        </motion.div>
      )}
      <motion.div
        // className="z-99 relative"
        className={` bottom-0 bg-slate-800 z-99 relative right-0 w-full h-full shadow-lg overflow-hidden ${
          isOpen ? "rounded" : "rounded-xl"
        }`}
        initial={{
          scale: 0.3, // small size
          x: "100%", // off-screen to right
          y: "100%", // off-screen to bottom
          opacity: 0,
        }}
        animate={
          isOpen
            ? {
                scale: 0.8,
                x: 0,
                y: 0,
                opacity: 1,
                transition: {
                  type: "spring",
                  stiffness: 60,
                  damping: 15,
                },
              }
            : {
                scale: 0.3,
                x: "100%",
                y: "100%",
                opacity: 0,
                transition: {
                  type: "spring",
                  stiffness: 80,
                  damping: 15,
                },
              }
        }
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          width: "100%",
          height: "100%",
          background: "white",
          boxShadow: "0 0 20px rgba(0,0,0,0.3)",
          borderRadius: isOpen ? "0px" : "16px",
          overflow: "hidden",
        }}
      >
        <IoIosCloseCircle
          onClick={() => setIsOpen(!isOpen)}
          className="hover:text-red-500 absolute top-5 right-5 text-2xl hover:cursor-pointer hover:scale-110 active:text-red-700 active:scale-120 text-red-400"
        />
        <div className="p-10 flex flex-col h-full bg-slate-800 scroll-hidden border-none">
          <div
            ref={chatRef}
            className="flex-1 space-y-2 overflow-y-scroll p-5 scroll-hidden border-none m-5"
          >
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 shadow-lg py-2 rounded-lg text-white max-w-3/4 flex space-x-5 ${
                    message.isUser ? "bg-slate-500" : "bg-slate-700"
                  }`}
                >
                  {!message.isUser && (
                    <Avatar className="flex items-center justify-center relative w-20 h-20">
                      <Image src="/images/self.jpg" alt="" fill />
                    </Avatar>
                  )}
                  <span className="flex-1">
                    <ReactMarkdown>{message.message}</ReactMarkdown>
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center">
            <Input
              suppressHydrationWarning
              className="m-5 border-white focus-visible:ring-2 focus-visible:ring-amber-50 focus-visible:ring-offset-0 text-white"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <button
              className={`bg-blue-500 border-2 active:scale-105 border-white w-12 h-12 flex items-center justify-center rounded-full ${
                streaming || inputVal.length == 0
                  ? "opacity-50"
                  : "hover:cursor-pointer hover:scale-95 hover:text-white"
              }`}
              onClick={handleSubmit}
              disabled={streaming || inputVal.length == 0}
            >
              <IoSend />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ChatScreen;
