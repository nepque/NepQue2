import StaticPageLayout from "@/components/layout/StaticPageLayout";

const AboutPage = () => {
  return (
    <StaticPageLayout
      title="About Us"
      description="Learn more about NepQue, your one-stop destination for finding the best coupons and deals online."
      keywords="about NepQue, coupon site, about us, coupon platform, deal finder"
    >
      <div className="prose prose-lg max-w-none">
        <h2>Our Mission</h2>
        <p>
          At NepQue, our mission is simple: to help you save money on every purchase. We believe that everyone deserves access 
          to the best deals and discounts available, without spending hours searching across the internet.
        </p>
        
        <h2>Who We Are</h2>
        <p>
          Founded in 2023, NepQue started as a small project with a big vision - to create the most user-friendly 
          and comprehensive coupon platform on the web. Our team of dedicated deal hunters works tirelessly to find, 
          verify, and share the most valuable coupons and promotions from thousands of popular stores.
        </p>
        
        <h2>What Makes Us Different</h2>
        <p>
          Unlike other coupon sites, we focus on quality over quantity. Each coupon on NepQue is verified by our team 
          before being published. We also emphasize user experience, making it easy to find, filter, and use the coupons 
          that matter most to you.
        </p>
        
        <h2>Our Values</h2>
        <ul>
          <li><strong>Transparency</strong> - We clearly mark which deals are verified and which are user-submitted.</li>
          <li><strong>Community</strong> - We believe in the power of our user community to share great deals.</li>
          <li><strong>Accessibility</strong> - We design our platform to be intuitive and accessible to everyone.</li>
          <li><strong>Integrity</strong> - We only share real, working deals that provide genuine value.</li>
        </ul>
        
        <h2>Join Our Community</h2>
        <p>
          NepQue is more than just a coupon site—it's a community of savvy shoppers. We encourage users to share deals 
          they find, rate the ones they've used, and help others save money. Join us in our mission to make online shopping 
          more affordable for everyone.
        </p>
        
        <h2>Contact Us</h2>
        <p>
          Have questions, suggestions, or feedback? We'd love to hear from you! Visit our <a href="/contact" className="text-blue-600 hover:text-blue-800">Contact Us</a> page 
          to get in touch with our team.
        </p>
      </div>
    </StaticPageLayout>
  );
};

export default AboutPage;