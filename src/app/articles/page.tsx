import ArticlePage from "@/Components/Articles/ArticlePage/ArticlePage";
import ArticlesListContainer from "@/Components/Articles/ArticlesList/ArticlesListContainer";
import FooterContainer from "@/Components/Footer/FooterContainer";
import MobileBottomNavigation from "@/Components/Header/MobileHeader/MobileBottomNavigation";
import MoblieHeaderTopTab from "@/Components/Header/MobileHeader/MoblieHeaderTopTab";
import WideHeaderContainer from "@/Components/Header/WideHeader/WideHeaderContainer";

import React from "react";

export default function page() {
  return (
    <>
      <WideHeaderContainer />
      <MoblieHeaderTopTab />
       <ArticlesListContainer count={0} ispage={true}/>
      <FooterContainer />
      <MobileBottomNavigation />
    </>
  );
}
