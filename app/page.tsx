'use client'
import HeroHook from "@/components/HeroHook";
import TechStack from "@/components/TechStack";
import ExtraCurricular from "@/components/ExtraCurricular";
import WorkExperience from "@/components/WorkExperience";
import ProjectsShowcase from "@/components/projects3d/ProjectsShowcase";
import Education from "@/components/Education";
import Contacts from "@/components/Contacts";
import Navbar from "@/components/Navbar";
import ChatScreen from "@/components/ChatScreen";

export default function Home() {
  return (
    <>
    <Navbar />
    {/* overflow-x-clip (not hidden) so sticky sections like Tech Stack can pin */}
    <div id="top" className="bg-(--page) flex items-center justify-center h-full flex-col w-full overflow-x-clip">
      <ChatScreen />
      <HeroHook />
      <TechStack />
      <ProjectsShowcase />
      <WorkExperience />
      <Education />
      <ExtraCurricular />
      <Contacts />
    </div>
    </>
  );
}
