'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/' },
  { name: 'Tickets', href: '/tickets' },
  { name: 'Time', href: '/time' },
  { name: 'Apps', href: '/apps' },
  { name: 'Reports', href: '/reports' },
  { name: 'Settings', href: '/settings' },
  { name: 'Finances', href: '/finances' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-white shadow-sm border-r min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
