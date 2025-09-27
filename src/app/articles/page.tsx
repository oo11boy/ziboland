import WideHeaderContainer from "@/Components/Header/WideHeader/WideHeaderContainer";
import MoblieHeaderTopTab from "@/Components/Header/MobileHeader/MoblieHeaderTopTab";
import ArticlesListContainer from "@/Components/Articles/ArticlesList/ArticlesListContainer";
import FooterContainer from "@/Components/Footer/FooterContainer";
import MobileBottomNavigation from "@/Components/Header/MobileHeader/MobileBottomNavigation";

export default function ArticlesPage() {
  return (
    <>
      <WideHeaderContainer />
      <MoblieHeaderTopTab />
      <ArticlesListContainer count={0} ispage={true} />
      <FooterContainer />
      <MobileBottomNavigation />
    </>
  );
}
