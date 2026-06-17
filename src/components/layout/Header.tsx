import { Bell, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDateChinese } from '@/utils/dateUtils';
import { useStore } from '@/store';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export function Header({ onMobileMenuToggle, isMobileMenuOpen }: HeaderProps) {
  const { getExpiringBatches, getRestockList } = useStore();
  const expiring = getExpiringBatches(3);
  const restock = getRestockList();

  const alertCount = expiring.length + restock.length;

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMobileMenuToggle}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>

          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索商品、供应商..."
              className="w-72 pl-9 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium">{formatDateChinese(new Date())}</p>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('zh-CN', { weekday: 'long' })}
            </p>
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {alertCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 min-w-5 justify-center p-0 text-[10px] animate-pulse-soft"
              >
                {alertCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
