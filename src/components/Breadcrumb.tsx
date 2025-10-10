import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />}
          {item.href ? (
            <Link
              to={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors font-light"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-light">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};
