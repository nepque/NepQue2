const HowItWorks = () => {
  const steps = [
    {
      icon: "search",
      title: "1. Find a Coupon",
      description: "Browse through thousands of coupons or search for your favorite store to find the best deals."
    },
    {
      icon: "copy",
      title: "2. Copy the Code",
      description: "Click to reveal and copy the coupon code to your clipboard with just one click."
    },
    {
      icon: "tags",
      title: "3. Enjoy Savings",
      description: "Paste the coupon code at checkout and enjoy instant savings on your purchase."
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-neutral-800 mb-10 text-center">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
                <i className={`fas fa-${step.icon} text-xl`}></i>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">{step.title}</h3>
              <p className="text-neutral-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
