import React from "react";
import Navbar from "../components/HomePage/navbar";
import Hero from "../components/HomePage/hero";
import Content from "../components/HomePage/content-usage";
import Characteristics from "../components/HomePage/characteristics";
import Faq from "../components/HomePage/faq";
import Footer from "../components/HomePage/footer";

const Home: React.FC = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Content />
      <Characteristics />
      <Faq />
      <Footer />
    </>
  );
};

export default Home;
