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
      <SEO 
        title="NepQue - Save Money with the Best Coupons & Promo Codes"
        description="Find verified coupons, discount codes, and deals from top stores and brands. Save money on your online shopping with exclusive offers at NepQue."
        keywords="coupons, promo codes, discount codes, deals, online shopping, save money, vouchers, offers, NepQue"
        ogType="website"
        canonicalUrl="/"
      />
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
