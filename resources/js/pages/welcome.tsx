import Header from "./LandingPage/Header";
import HeroSection from "./LandingPage/HeroSection";
import StatsSection from "./LandingPage/StatsSection";
import ProgramSection from "./LandingPage/ProgramSection";
import RegistNow from "./LandingPage/RegistNow";
import FooterSection from "./LandingPage/FooterSection";
import ButtonTop from "./LandingPage/ButtonTop";
import TentangProgam from "./LandingPage/TentangProgam";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <StatsSection />
      <ProgramSection />
      <TentangProgam />
      <RegistNow />
      <FooterSection />
      <ButtonTop />
    </div>
  );
};

export default LandingPage;
