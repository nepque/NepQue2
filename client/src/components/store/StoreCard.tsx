import { Link } from "wouter";

interface StoreCardProps {
  id: number;
  name: string;
  logo: string;
  couponCount: number;
  slug: string;
}

const StoreCard = ({ id, name, logo, slug, couponCount }: StoreCardProps) => {
  return (
    <Link
      href={`/store/${slug}`}
      className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow border border-neutral-200 flex flex-col items-center"
    >
      <img 
        src={logo} 
        alt={name} 
        className="w-16 h-16 object-contain mb-3"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=64`;
        }}
      />
      <h3 className="font-medium text-neutral-800">{name}</h3>
      <p className="text-sm text-neutral-500 mt-1">{couponCount} coupons</p>
    </Link>
  );
};

export default StoreCard;
