"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { CondoHomeBrandImage } from "../brand/condohome-brand-image";
import { Button } from "../ui/button";
import {
  adminSections,
  getAdminSectionByPathname,
} from "../../src/lib/admin-navigation";
import { useDashboardStore } from "../../src/store/useDashboardStore";

type AdminShellProps = {
  children: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const state = useDashboardStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  const currentUser = state.currentUserId
    ? state.users[state.currentUserId]
    : undefined;
  const activeCondo = state.activeCondoId
    ? state.condos[state.activeCondoId]
    : undefined;
  const canManageFinance =
    currentUser?.role === "ADMIN_COMPANY" || currentUser?.role === "SYSTEM_ADMIN";
  const visibleSections = adminSections.filter(
    (section) =>
      ((section.id !== "boletos" && section.id !== "payments") || canManageFinance) &&
      (section.id !== "payments" || activeCondo?.type === "COMPLETE"),
  );
  const requestedSection = getAdminSectionByPathname(pathname ?? "/dashboard");
  const currentSection = visibleSections.find((section) => section.id === requestedSection.id) ?? visibleSections[0];
  const collapsedNav = desktopCollapsed && !mobileOpen;

  useEffect(() => {
    if (state.themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.themeMode]);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (state.hydrationComplete && !state.bootstrapped) {
      void state.bootstrap();
    }
  }, [state]);

  useEffect(() => {
    if (!state.hydrationComplete || !state.bootstrapped) {
      return;
    }

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    if (pathname && !visibleSections.some((section) => section.href === pathname)) {
      router.replace(visibleSections[0]?.href ?? "/dashboard");
    }
  }, [currentUser, pathname, router, state.bootstrapped, state.hydrationComplete, visibleSections]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div
        className={`mb-8 flex px-2 ${collapsedNav ? "justify-center" : "items-center gap-3"}`}
      >
        <div className="flex w-full items-center justify-center">
          <CondoHomeBrandImage
            variant={collapsedNav ? "mark" : "logo"}
            className={collapsedNav ? "h-14 w-14 object-contain" : "h-16 w-auto object-contain"}
          />
        </div>
      </div>

      <nav className="space-y-1">
        {visibleSections.map((section) => {
          const Icon = section.icon;
          const active = currentSection.id === section.id;

          return (
            <Link
              key={section.id}
              href={section.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center border-l-4 px-4 py-3 transition ${
                active
                  ? "border-white bg-white/10 text-white"
                  : "border-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span
                className={`sidebar-copy min-w-0 pl-3 ${collapsedNav ? "sidebar-copy-hidden" : "sidebar-copy-visible"}`}
              >
                {!collapsedNav ? (
                  <>
                    <span className="block text-sm font-medium">
                      {section.label}
                    </span>
                    <span
                      className={`mt-0.5 block text-xs ${active ? "text-zinc-300" : "text-zinc-500"}`}
                    >
                      {section.description}
                    </span>
                  </>
                ) : null}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 px-2 pt-6">
        <Button
          variant="ghost"
          className={`text-zinc-300 hover:bg-white/10 hover:text-white ${
            collapsedNav
              ? "mx-auto h-10 w-10 justify-center rounded-xl p-0"
              : "w-full justify-start gap-2"
          }`}
          onClick={() => {
            void state.logout();
            router.replace("/login");
          }}
          aria-label="Sair"
          title="Sair"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span
            className={`sidebar-copy ${collapsedNav ? "sidebar-copy-hidden" : "sidebar-copy-visible"}`}
          >
            {!collapsedNav ? "Sair" : null}
          </span>
        </Button>

        <Button
          variant="ghost"
          className={`hidden text-zinc-200 hover:bg-white/10 hover:text-white lg:inline-flex ${
            collapsedNav
              ? "mx-auto h-10 w-10 justify-center rounded-xl border border-white/10 bg-white/5 p-0 px-0 py-0"
              : "w-full justify-start gap-2"
          }`}
          onClick={() => setDesktopCollapsed((prev) => !prev)}
          aria-label={collapsedNav ? "Expandir menu" : "Recolher menu"}
          title={collapsedNav ? "Expandir menu" : "Recolher menu"}
        >
          {collapsedNav ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
          <span
            className={`sidebar-copy ${collapsedNav ? "sidebar-copy-hidden" : "sidebar-copy-visible"}`}
          >
            {!collapsedNav ? "Recolher menu" : null}
          </span>
        </Button>
      </div>
    </div>
  );

  if (!state.hydrationComplete || !state.bootstrapped) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        Carregando painel...
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        Redirecionando...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="flex min-h-screen">
        <aside
          className={`hidden shrink-0 border-r border-slate-100/10 bg-slate-950 transition-[width] duration-300 ease-out lg:block ${
            desktopCollapsed ? "w-24" : "w-[300px]"
          }`}
        >
          <div className="sticky top-0 h-screen overflow-y-auto p-6">
            {sidebar}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0 lg:hidden"
                  onClick={() => setMobileOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden h-10 w-10 p-0 lg:inline-flex"
                  onClick={() => setDesktopCollapsed((prev) => !prev)}
                >
                  {desktopCollapsed ? (
                    <ChevronsRight className="h-4 w-4" />
                  ) : (
                    <ChevronsLeft className="h-4 w-4" />
                  )}
                </Button>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    {currentSection.label}
                  </p>
                  <h1 className="truncate text-xl font-semibold text-slate-950 dark:text-slate-50">
                    {currentSection.pageTitle}
                  </h1>
                  <p className="mt-1 hidden text-sm text-slate-500 dark:text-slate-400 sm:block">
                    {currentSection.pageDescription}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0 lg:hidden"
                  onClick={() => {
                    void state.logout();
                    router.replace("/login");
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0"
                  onClick={() =>
                    state.setThemeMode(
                      state.themeMode === "dark" ? "light" : "dark",
                    )
                  }
                >
                  {state.themeMode === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          />
          <div className="absolute left-0 top-0 h-full w-[88vw] max-w-[340px] bg-zinc-950 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-zinc-300 hover:bg-white/10 hover:text-white"
                onClick={() => {
                  setMobileOpen(false);
                  void state.logout();
                  router.replace("/login");
                }}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-zinc-300 hover:bg-white/10 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {sidebar}
          </div>
        </div>
      ) : null}
    </main>
  );
}
