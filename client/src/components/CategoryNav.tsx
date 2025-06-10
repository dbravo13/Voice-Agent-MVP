
import { Link } from "react-router-dom";
import { Camera, Laptop, Smartphone, Headphones, Watch, Gamepad2 } from "lucide-react";

const CategoryNav = () => {
  const categories = [
    { name: "Cameras", icon: Camera, path: "/category/cameras" },
    { name: "Laptops", icon: Laptop, path: "/category/laptops" },
    { name: "Phones", icon: Smartphone, path: "/category/phones" },
    { name: "Audio", icon: Headphones, path: "/category/audio" },
    { name: "Wearables", icon: Watch, path: "/category/wearables" },
    { name: "Gaming", icon: Gamepad2, path: "/category/gaming" },
  ];

  return (
    <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-4">
          <div className="flex space-x-8 overflow-x-auto">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.name}
                  to={category.path}
                  className="flex flex-col items-center space-y-2 min-w-0 flex-shrink-0 group"
                >
                  <div className="p-3 rounded-xl bg-muted/50 group-hover:bg-primary/10 transition-colors">
                    <IconComponent className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
