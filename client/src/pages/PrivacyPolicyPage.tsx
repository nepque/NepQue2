import StaticPageLayout from "@/components/layout/StaticPageLayout";

const PrivacyPolicyPage = () => {
  const lastUpdated = "May 01, 2025";

  return (
    <StaticPageLayout
      title="Privacy Policy"
      description="Read about NepQue's privacy policy regarding data collection, usage, cookies, and your privacy rights."
      keywords="privacy policy, data protection, cookie policy, privacy rights, NepQue privacy"
    >
      <div className="prose prose-lg max-w-none">
        <p className="text-sm text-gray-500">Last Updated: {lastUpdated}</p>

        <h2>Introduction</h2>
        <p>
          At NepQue ("we," "our," or "us"), we respect your privacy and are committed to protecting your personal data. 
          This privacy policy explains how we collect, use, and protect information when you use our website at 
          www.nepque.com (the "Site").
        </p>
        <p>
          We encourage you to read this policy carefully to understand our practices regarding your personal data. By 
          using our Site, you acknowledge that you have read and understood this privacy policy.
        </p>

        <h2>Information We Collect</h2>
        <p>We may collect several types of information from and about users of our Site, including:</p>
        <ul>
          <li>
            <strong>Personal Information</strong>: This includes information that can identify you, such as your name, email 
            address, and profile picture when you create an account or submit a coupon.
          </li>
          <li>
            <strong>Usage Data</strong>: Information about how you use our Site, including which coupons you view, save, or use, 
            your browsing patterns, and the pages you visit.
          </li>
          <li>
            <strong>Technical Data</strong>: Information about your device and internet connection, including your IP address, 
            browser type and version, operating system, and other technical characteristics.
          </li>
          <li>
            <strong>Cookies and Similar Technologies</strong>: We use cookies and similar tracking technologies to track activity 
            on our Site and to enhance your experience. See our Cookie Policy section for more details.
          </li>
        </ul>

        <h2>How We Collect Information</h2>
        <p>We collect information through various methods:</p>
        <ul>
          <li>
            <strong>Direct Interactions</strong>: Information you provide when creating an account, submitting a coupon, filling out 
            forms, or contacting us.
          </li>
          <li>
            <strong>Automated Technologies</strong>: As you navigate through our Site, we may automatically collect technical data 
            about your equipment, browsing actions, and patterns.
          </li>
          <li>
            <strong>Third Parties</strong>: We may receive personal information about you from various third parties, such as 
            analytics providers, advertising networks, and social media platforms when you choose to log in using social media accounts.
          </li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect for various purposes, including:</p>
        <ul>
          <li>To provide, maintain, and improve our Site and services</li>
          <li>To personalize your experience and deliver content relevant to your interests</li>
          <li>To process and verify coupon submissions</li>
          <li>To communicate with you about your account, updates to our Site, or new features</li>
          <li>To administer promotions, surveys, or other Site features</li>
          <li>To analyze usage patterns and improve our Site's functionality</li>
          <li>To detect, prevent, and address technical issues or fraudulent activities</li>
          <li>To comply with legal obligations</li>
        </ul>

        <h2>Data Sharing and Disclosure</h2>
        <p>We may share your personal information in the following situations:</p>
        <ul>
          <li>
            <strong>Service Providers</strong>: We may share your information with third-party service providers who perform services 
            for us or on our behalf, such as data analysis, email delivery, hosting services, customer service, and marketing assistance.
          </li>
          <li>
            <strong>Business Transfers</strong>: If we are involved in a merger, acquisition, or sale of all or a portion of our assets, 
            your information may be transferred as part of that transaction.
          </li>
          <li>
            <strong>Legal Requirements</strong>: We may disclose your information if required to do so by law or in response to valid 
            requests by public authorities (e.g., a court or government agency).
          </li>
          <li>
            <strong>With Your Consent</strong>: We may share your information with third parties when you have given us your consent to do so.
          </li>
        </ul>

        <h2>Cookie Policy</h2>
        <p>
          Cookies are small text files stored on your device when you visit websites. We use cookies and similar technologies to 
          enhance your experience on our Site, analyze usage patterns, and deliver personalized content.
        </p>
        <p>Types of cookies we use:</p>
        <ul>
          <li>
            <strong>Essential Cookies</strong>: Necessary for the Site to function properly. They enable basic functions like page 
            navigation and access to secure areas of the Site.
          </li>
          <li>
            <strong>Analytical/Performance Cookies</strong>: Allow us to recognize and count the number of visitors and see how visitors 
            move around our Site. This helps us improve how our Site works.
          </li>
          <li>
            <strong>Functionality Cookies</strong>: Enable the Site to remember choices you make and provide enhanced, personalized features.
          </li>
          <li>
            <strong>Targeting Cookies</strong>: Record your visit to our Site, the pages you have visited, and the links you have followed. 
            We may use this information to make our Site and the advertising displayed on it more relevant to your interests.
          </li>
        </ul>
        <p>
          You can control and manage cookies in various ways. Most web browsers allow you to control cookies through their settings 
          preferences. For more information about how to manage cookies, please visit the help pages of your browser.
        </p>

        <h2>Data Security</h2>
        <p>
          We have implemented appropriate technical and organizational measures to secure your personal information from accidental 
          loss, unauthorized access, use, alteration, and disclosure. However, the transmission of information via the internet is 
          not completely secure. While we do our best to protect your personal information, we cannot guarantee the security of your 
          data transmitted to our Site.
        </p>

        <h2>Your Privacy Rights</h2>
        <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
        <ul>
          <li>The right to access your personal information</li>
          <li>The right to rectify or update your personal information</li>
          <li>The right to erase your personal information</li>
          <li>The right to restrict or object to processing of your personal information</li>
          <li>The right to data portability</li>
          <li>The right to withdraw consent</li>
        </ul>
        <p>
          To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
        </p>

        <h2>Children's Privacy</h2>
        <p>
          Our Site is not intended for children under 16 years of age. We do not knowingly collect personal information from children 
          under 16. If you are a parent or guardian and believe that your child has provided us with personal information, please 
          contact us so that we can delete such information.
        </p>

        <h2>Changes to This Privacy Policy</h2>
        <p>
          We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on 
          this page and updating the "Last Updated" date at the top of this policy. You are advised to review this privacy policy 
          periodically for any changes.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions, concerns, or requests regarding this privacy policy or our privacy practices, please contact us at:
        </p>
        <p>
          Email: <a href="mailto:privacy@nepque.com" className="text-blue-600 hover:text-blue-800">privacy@nepque.com</a><br />
          Postal address: 123 Deal Street, Coupon City, NY 10001, United States<br />
          Phone: +1 (800) 555-1234
        </p>
      </div>
    </StaticPageLayout>
  );
};

export default PrivacyPolicyPage;