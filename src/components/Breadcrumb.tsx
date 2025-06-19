import Link from "next/link";

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-400 mb-6">
      <Link href="/" className="hover:text-cyan-400 transition-colors">
        ホーム
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <span className="text-slate-600">&gt;</span>
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-cyan-400 transition-colors"
            >
              {item.name}
            </Link>
          ) : (
            <span className="text-slate-300">{item.name}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
