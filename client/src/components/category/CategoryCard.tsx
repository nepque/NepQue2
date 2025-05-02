import { Link } from "wouter";

interface CategoryCardProps {
  id: number;
  name: string;
  icon: string;
  color: string;
  couponCount: number;
}

const CategoryCard = ({ id, name, icon, color, couponCount }: CategoryCardProps) => {
  // Function to get color class based on category color
  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-primary";
      case "green":
        return "bg-green-100 text-green-600";
      case "purple":
        return "bg-purple-100 text-purple-600";
      case "red":
        return "bg-red-100 text-red-600";
      case "yellow":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-neutral-200 text-neutral-600";
    }
  };

  return (
    <Link
      href={`/coupons?categoryId=${id}`}
      className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow border border-neutral-200"
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 ${getColorClasses(color)} rounded-full mb-3`}>
        <i className={`fas fa-${icon} text-lg`}></i>
      </div>
      <h3 className="font-medium text-neutral-800">{name}</h3>
      <p className="text-sm text-neutral-500 mt-1">{couponCount} coupons</p>
    </Link>
  );
};

export default CategoryCard;
