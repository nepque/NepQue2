import HeroSearch from "@/components/home/HeroSearch";
import FeaturedCoupons from "@/components/home/FeaturedCoupons";
import Categories from "@/components/home/Categories";
import PopularStores from "@/components/home/PopularStores";
import Newsletter from "@/components/home/Newsletter";
import HowItWorks from "@/components/home/HowItWorks";
import SEO from "@/components/common/SEO";

const HomePage = () => {
  return (
    <main>
      <HeroSearch />
      <FeaturedCoupons />
      <Categories />
      <PopularStores />
      <Newsletter />
      <HowItWorks />
    </main>
  );
};

export default HomePage;
