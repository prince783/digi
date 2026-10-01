"use client";

import BasicDetails from "../steps/BasicDetails";
import Contact from "../steps/contact";
import SocialLinks from "../steps/SocialLink";
import Services from "../steps/BussinessDetail";
import Gallery from "../steps/Gallery";
import ActionSetting from "../steps/ActionSetting";
import Publish from "../steps/Publish";

export default function StepContent({ step }: { step: number }) {
  switch (step) {
    case 2: return <Contact />;
    case 3: return <SocialLinks />;
    case 4: return <Services />;
    case 5: return <Gallery />;
    case 6: return <ActionSetting />;
    case 7: return <Publish />;
    default: return <BasicDetails />;
  }
}