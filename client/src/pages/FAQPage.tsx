import StaticPageLayout from "@/components/layout/StaticPageLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQPage = () => {
  return (
    <StaticPageLayout
      title="Frequently Asked Questions"
      description="Find answers to common questions about using NepQue, submitting coupons, and saving money with our platform."
      keywords="FAQ, frequently asked questions, coupon help, NepQue help, how to use coupons"
    >
      <div className="space-y-8">
        <p className="text-lg text-gray-700 mb-6">
          Find answers to the most commonly asked questions about NepQue. If you can't find what you're 
          looking for, please visit our <a href="/contact" className="text-blue-600 hover:text-blue-800">Contact Us</a> page.
        </p>
        
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">General Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="what-is-nepque">
              <AccordionTrigger>What is NepQue?</AccordionTrigger>
              <AccordionContent>
                NepQue is a coupon and deal discovery platform that helps shoppers find the best discounts and promotional 
                offers from thousands of online and in-store retailers. We verify coupons, allow users to submit new deals, 
                and provide a seamless experience for saving money on your purchases.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="free-to-use">
              <AccordionTrigger>Is NepQue free to use?</AccordionTrigger>
              <AccordionContent>
                Yes, NepQue is completely free for users. We make money through affiliate partnerships with retailers, but this 
                never affects which coupons we show you or how they work.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="account-needed">
              <AccordionTrigger>Do I need an account to use coupons?</AccordionTrigger>
              <AccordionContent>
                You don't need an account to browse or use coupons. However, creating an account allows you to save your favorite 
                deals, receive personalized recommendations, and submit your own coupons to share with the community.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Using Coupons</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="how-to-use">
              <AccordionTrigger>How do I use a coupon from NepQue?</AccordionTrigger>
              <AccordionContent>
                Simply click on the coupon you want to use. You'll see the coupon code (if applicable) which you can copy and 
                paste during checkout at the retailer's website. Some offers are automatic discounts or deals that don't require 
                a code - for these, just click through to the retailer to take advantage of the offer.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="coupon-not-working">
              <AccordionTrigger>What should I do if a coupon doesn't work?</AccordionTrigger>
              <AccordionContent>
                While we make every effort to verify coupons, sometimes they expire earlier than expected or have restrictions we 
                weren't aware of. If you find a coupon that doesn't work, please report it using the "Report" button on the coupon 
                detail page. This helps us maintain the quality of our offers.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="code-vs-deal">
              <AccordionTrigger>What's the difference between a coupon code and a deal?</AccordionTrigger>
              <AccordionContent>
                A coupon code is a specific alphanumeric code that you enter at checkout to receive a discount. A deal is a special 
                offer that doesn't require a code - it might be an automatic discount, a sale, or a special promotional price that's 
                already applied when you visit the store through our link.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Submitting Coupons</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="how-to-submit">
              <AccordionTrigger>How can I submit a coupon to NepQue?</AccordionTrigger>
              <AccordionContent>
                You need to be logged in to submit a coupon. Once logged in, click on the "Submit Coupon" link in your user menu. 
                Fill out the form with all the coupon details including the code, expiration date, and description. Our team will 
                review your submission and publish it if it meets our guidelines.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="submission-guidelines">
              <AccordionTrigger>What are the guidelines for coupon submissions?</AccordionTrigger>
              <AccordionContent>
                We ask that all submissions include accurate information, a valid coupon code (if applicable), the correct expiration 
                date, and a clear description of the offer. We don't accept coupons that are already expired, contain inappropriate 
                content, or promote restricted products. For a complete list of guidelines, please check our submission form.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="review-time">
              <AccordionTrigger>How long does it take for my coupon to be approved?</AccordionTrigger>
              <AccordionContent>
                We typically review submissions within 24-48 hours. Once approved, your coupon will appear on the site and be 
                attributed to your account. If your submission is rejected, you'll receive a notification with the reason.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Account Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="create-account">
              <AccordionTrigger>How do I create an account?</AccordionTrigger>
              <AccordionContent>
                Click the "Sign In" button in the top right corner of the page. You'll have the option to create a new account 
                using your email address or sign in with Google for a faster experience.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="forgot-password">
              <AccordionTrigger>I forgot my password. How can I reset it?</AccordionTrigger>
              <AccordionContent>
                On the sign-in page, click the "Forgot Password" link. Enter your email address, and we'll send you a link to 
                reset your password. If you signed up with Google, you'll need to use the Google sign-in option instead.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="delete-account">
              <AccordionTrigger>How can I delete my account?</AccordionTrigger>
              <AccordionContent>
                If you wish to delete your account, please go to your profile settings and select the "Delete Account" option. 
                This will permanently remove your account and all associated data. If you have any issues, please contact our 
                support team.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <p className="text-lg text-gray-700 mt-8">
          Still have questions? Feel free to <a href="/contact" className="text-blue-600 hover:text-blue-800">contact us</a> and 
          our team will be happy to assist you.
        </p>
      </div>
    </StaticPageLayout>
  );
};

export default FAQPage;