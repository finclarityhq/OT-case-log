
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Book,
  PlusSquare,
  Download,
  TestTube,
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cases', label: 'All Cases', icon: Book },
  { href: '/export', label: 'Export Data', icon: Download },
];

export function MainSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <TestTube className="h-5 w-5 text-primary-foreground" />
          </div>
          <div
            data-sidebar="header-text"
            className="text-lg font-semibold text-foreground group-data-[collapsible=icon]:hidden"
          >
            OT Case Log
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map(item => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="group-data-[collapsible=icon]:hidden">
          <Button asChild className="w-full">
            <Link href="/cases/new">
                <PlusSquare />
                New Case
            </Link>
          </Button>
        </div>
        <div className="hidden group-data-[collapsible=icon]:block">
          <SidebarMenuButton tooltip="New Case" asChild>
            <Link href="/cases/new">
              <PlusSquare />
            </Link>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
