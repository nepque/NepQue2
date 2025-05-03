import StaticPageLayout from "@/components/layout/StaticPageLayout";
import { Link } from "wouter";

const TermsOfServicePage = () => {
  const lastUpdated = "May 01, 2025";

  return (
    <StaticPageLayout
      title="Terms of Service"
      description="Read the terms and conditions that govern your use of NepQue's coupon and deals platform."
      keywords="terms of service, user agreement, legal terms, conditions of use, NepQue terms"
    >
      <div className="prose prose-lg max-w-none">
        <p className="text-sm text-gray-500">Last Updated: {lastUpdated}</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          Welcome to NepQue. These Terms of Service ("Terms") govern your access to and use of the NepQue 
          website, services, and applications (collectively, the "Service"). By accessing or using the Service, 
          you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
        </p>

        <h2>2. Changes to Terms</h2>
        <p>
          We may modify these Terms at any time. It is your responsibility to review these Terms periodically. Your 
          continued use of the Service after we post modifications to the Terms indicates your acceptance of those changes. 
          If you do not agree to the modified Terms, you must stop using the Service.
        </p>

        <h2>3. Eligibility</h2>
        <p>
          You must be at least 16 years old to use the Service. By using the Service, you represent and warrant that 
          you are at least 16 years of age and have the legal capacity to enter into these Terms. If you are using the 
          Service on behalf of an organization, you represent and warrant that you have the authority to bind that 
          organization to these Terms.
        </p>

        <h2>4. User Accounts</h2>
        <p>
          Some features of the Service require you to create an account. You are responsible for safeguarding your account 
          and for all activities that occur under your account. You agree to provide accurate, current, and complete 
          information during the registration process and to update such information to keep it accurate, current, and 
          complete. We reserve the right to suspend or terminate your account if any information provided proves to be 
          inaccurate, not current, or incomplete.
        </p>

        <h2>5. User Content</h2>
        <p>
          Our Service allows you to submit, post, or share content, including coupon codes, deals, reviews, and comments 
          ("User Content"). You retain ownership of your User Content, but you grant us a worldwide, non-exclusive, 
          royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute your User Content 
          in any existing or future media in connection with the Service.
        </p>
        <p>
          You represent and warrant that:
        </p>
        <ul>
          <li>You own or have the necessary rights to use and authorize us to use your User Content</li>
          <li>Your User Content does not violate the rights of any third party, including copyright, trademark, privacy, or other personal or proprietary rights</li>
          <li>Your User Content does not contain material that is defamatory, obscene, offensive, harassing, or otherwise objectionable</li>
          <li>Your User Content does not contain malware, viruses, or other harmful code</li>
        </ul>
        <p>
          We reserve the right to remove any User Content that violates these Terms or that we determine is harmful, 
          offensive, or otherwise inappropriate.
        </p>

        <h2>6. Coupon and Deal Information</h2>
        <p>
          The coupon codes, deals, and discount information available through the Service are provided by retailers, brands, 
          users, and other third parties. While we strive to ensure that the information on our Service is accurate and 
          up-to-date, we cannot guarantee the accuracy, completeness, or validity of any coupon codes, deals, or other 
          promotional offers.
        </p>
        <p>
          Coupon codes and deals may expire, have restrictions, or change without notice. It is your responsibility to verify 
          the terms and conditions of any coupon or deal before use. We are not responsible for any losses or damages resulting 
          from the use of the coupons or deals displayed on our Service.
        </p>

        <h2>7. Prohibited Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose or in violation of these Terms</li>
          <li>Post, upload, or distribute User Content that is defamatory, libelous, inaccurate, or unlawful</li>
          <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity</li>
          <li>Use automated means, including spiders, robots, crawlers, or data mining tools, to access, scrape, or index the Service</li>
          <li>Attempt to access areas of the Service that you are not authorized to access</li>
          <li>Engage in any activity that interferes with or disrupts the Service</li>
          <li>Encourage or enable any other individual to do any of the above</li>
        </ul>

        <h2>8. Intellectual Property Rights</h2>
        <p>
          The Service and its original content (excluding User Content), features, and functionality are and will remain 
          the exclusive property of NepQue and its licensors. The Service is protected by copyright, trademark, and other 
          laws of the United States and foreign countries. Our trademarks and trade dress may not be used in connection 
          with any product or service without the prior written consent of NepQue.
        </p>
        <p>
          If you believe that material available on our Service infringes your copyright, please notify us by providing the 
          following information:
        </p>
        <ul>
          <li>Identification of the copyrighted work claimed to have been infringed</li>
          <li>Identification of the material that is claimed to be infringing</li>
          <li>Information reasonably sufficient to permit us to contact you</li>
          <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized</li>
          <li>A statement that the information in the notification is accurate</li>
        </ul>

        <h2>9. Links to Third-Party Websites</h2>
        <p>
          The Service may contain links to third-party websites that are not owned or controlled by NepQue. We have no control 
          over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites. 
          You acknowledge and agree that NepQue shall not be responsible or liable for any damage or loss caused by the use 
          of any such content, goods, or services available on or through any such third-party websites.
        </p>

        <h2>10. Termination</h2>
        <p>
          We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for 
          any reason whatsoever, including, without limitation, if you breach these Terms. Upon termination, your right to use the 
          Service will immediately cease.
        </p>

        <h2>11. Disclaimer of Warranties</h2>
        <p>
          THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. NEPQUE EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, 
          WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
          PURPOSE, AND NON-INFRINGEMENT. NEPQUE MAKES NO WARRANTY THAT THE SERVICE WILL MEET YOUR REQUIREMENTS, BE AVAILABLE ON AN 
          UNINTERRUPTED, SECURE, OR ERROR-FREE BASIS, OR THAT DEFECTS WILL BE CORRECTED.
        </p>

        <h2>12. Limitation of Liability</h2>
        <p>
          IN NO EVENT SHALL NEPQUE, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
          CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR USE, ARISING OUT OF OR IN ANY WAY CONNECTED WITH 
          THE USE OF THE SERVICE OR THESE TERMS, WHETHER BASED ON CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR OTHERWISE, EVEN 
          IF NEPQUE HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>

        <h2>13. Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless NepQue, its officers, directors, employees, and agents, from and against 
          any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to 
          attorney's fees) arising from: (i) your use of and access to the Service; (ii) your violation of any term of these Terms; 
          (iii) your violation of any third-party right, including without limitation any copyright, property, or privacy right; or 
          (iv) any claim that your User Content caused damage to a third party.
        </p>

        <h2>14. Governing Law and Jurisdiction</h2>
        <p>
          These Terms and your use of the Service shall be governed by and construed in accordance with the laws of the State of New York, 
          without giving effect to any choice or conflict of law provision or rule. Any legal suit, action, or proceeding arising out of, 
          or related to, these Terms or the Service shall be instituted exclusively in the federal courts of the United States or the 
          courts of the State of New York, in each case located in New York City, although we retain the right to bring any suit, action, 
          or proceeding against you for breach of these Terms in your country of residence or any other relevant country.
        </p>

        <h2>15. Severability</h2>
        <p>
          If any provision of these Terms is found to be unenforceable or invalid under any applicable law, such unenforceability or 
          invalidity shall not render these Terms unenforceable or invalid as a whole, and such provision shall be deleted without 
          affecting the remaining provisions herein.
        </p>

        <h2>16. Entire Agreement</h2>
        <p>
          These Terms, together with our <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>, 
          constitute the entire agreement between you and NepQue regarding the Service and supersede any prior agreements between you and 
          NepQue relating to the Service.
        </p>

        <h2>17. Contact Information</h2>
        <p>
          If you have any questions about these Terms, please contact us at:
        </p>
        <p>
          Email: <a href="mailto:legal@nepque.com" className="text-blue-600 hover:text-blue-800">legal@nepque.com</a><br />
          Postal address: 123 Deal Street, Coupon City, NY 10001, United States<br />
          Phone: +1 (800) 555-1234
        </p>
      </div>
    </StaticPageLayout>
  );
};

export default TermsOfServicePage;