"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Check,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Compass,
  LogOut,
  Menu,
  Moon,
  ReceiptText,
  Sun,
  UserCircle,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CondoHomeBrandImage } from "../brand/condohome-brand-image";
import { Button } from "../ui/button";
import {
  adminSections,
  getAdminSectionByPathname,
} from "../../src/lib/admin-navigation";
import {
  buildManagerUrl,
  buildTenantUrl,
  dashboardApi,
  useDashboardStore,
} from "../../src/store/useDashboardStore";

type AdminShellProps = {
  children: React.ReactNode;
};

type ContextSection = {
  id: string;
  label: string;
  pageTitle: string;
  pageDescription: string;
};

const hexToHsl = (hex: string) => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) {
    return undefined;
  }

  const r = parseInt(match[1], 16) / 255;
  const g = parseInt(match[2], 16) / 255;
  const b = parseInt(match[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const isPlatformPage = (path?: string | null) => {
  if (!path) {
    return false;
  }

  return path.startsWith("/subscription") || path.startsWith("/my-condos") || path.startsWith("/company");
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const state = useDashboardStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [condoMenuOpen, setCondoMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [subscriptionLocked, setSubscriptionLocked] = useState(false);
  const condoMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const currentUser = state.currentUserId
    ? state.users[state.currentUserId]
    : undefined;
  const isManagerScope =
    pathname?.startsWith("/company") ||
    pathname?.startsWith("/subscription") ||
    pathname?.startsWith("/my-condos") ||
    false;
  const activeCondo = state.activeCondoId
    ? state.condos[state.activeCondoId]
    : undefined;
  const accessibleCondos = currentUser?.accessibleCondoIds
    .map((id) => state.condos[id])
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name)) ?? [];
  const canManageWallet =
    currentUser?.role === "ADMIN_COMPANY" || currentUser?.role === "SYSTEM_ADMIN";
  const canManageBoletos =
    currentUser?.role === "ADMIN_COMPANY" || currentUser?.role === "SYSTEM_ADMIN";
  const canSwitchCondos =
    currentUser?.role === "ADMIN_COMPANY" || currentUser?.role === "SYSTEM_ADMIN";
  const canViewSubscription =
    currentUser?.role === "ADMIN_COMPANY" || currentUser?.role === "SYSTEM_ADMIN";
  const showManagerCondoFilter =
    currentUser?.role === "ADMIN_COMPANY" &&
    (pathname === "/company" || pathname === "/company/financial");
  const [managerSelectedCondoId, setManagerSelectedCondoId] = useState("ALL");
  const visibleSections = adminSections.filter(
    (section) =>
      (section.id !== "boletos" || canManageBoletos) &&
      (section.id !== "payments" || canManageWallet) &&
      (section.id !== "settings" || canSwitchCondos),
  );
  const requestedSection = getAdminSectionByPathname(pathname ?? "/dashboard");
  const subscriptionSection: ContextSection = {
    id: "subscription",
    label: "Minha assinatura",
    pageTitle: "Minha assinatura",
    pageDescription: "Acompanhe plano, cobrança e estimativa mensal da conta da empresa.",
  };
  const myCondosSection: ContextSection = {
    id: "my-condos",
    label: "Carteira operacional",
    pageTitle: "Meus condomínios",
    pageDescription: "Gerencie a carteira operacional da empresa e o acesso dos síndicos.",
  };
  const companySection: ContextSection = pathname?.startsWith("/company/occurrences")
    ? {
        id: "company",
        label: "Visão da empresa",
        pageTitle: "Ocorrências da carteira",
        pageDescription: "Acompanhe os chamados abertos e o histórico operacional de toda a carteira.",
      }
    : pathname?.startsWith("/company/agenda")
    ? {
        id: "company",
        label: "Visão da empresa",
        pageTitle: "Agenda da carteira",
        pageDescription: "Veja compromissos e datas importantes da carteira inteira, com filtros por condomínio.",
      }
    : pathname?.startsWith("/company/documents")
    ? {
        id: "company",
        label: "Visão da empresa",
        pageTitle: "Documentos da carteira",
        pageDescription: "Monitore vencimentos e arquivos da carteira sem sair da visão da empresa.",
      }
    : pathname?.startsWith("/company/financial")
    ? {
        id: "company",
        label: "Visão da empresa",
        pageTitle: "Financeiro da carteira",
        pageDescription: "Acompanhe cobrança, inadimplência e saldo disponível em toda a carteira.",
      }
    : {
    id: "company",
    label: "Visão da empresa",
    pageTitle: "Visão da empresa",
    pageDescription: "Acompanhe a carteira inteira da empresa com filtros e drill-down por condomínio.",
  };
  const companySections = [
    {
      id: "company-home",
      href: "/company",
      label: "Visão da empresa",
      description: "Panorama executivo",
      icon: Compass,
    },
    {
      id: "company-financial",
      href: "/company/financial",
      label: "Financeiro",
      description: "Cobrança e saldo",
      icon: Building2,
    },
    {
      id: "company-condos",
      href: "/my-condos",
      label: "Meus condomínios",
      description: "Carteira operacional",
      icon: Building2,
    },
    {
      id: "company-subscription",
      href: "/subscription",
      label: "Minha assinatura",
      description: "Plano e cobrança",
      icon: ReceiptText,
    },
  ];
  const currentSection =
    pathname?.startsWith("/company") && canViewSubscription
      ? companySection
      : pathname?.startsWith("/subscription") && canViewSubscription
      ? subscriptionSection
      : pathname?.startsWith("/my-condos") && canViewSubscription
      ? myCondosSection
      : visibleSections.find((section) => section.id === requestedSection.id) ?? visibleSections[0];
  const collapsedNav = desktopCollapsed && !mobileOpen;
  const primaryColor = isManagerScope ? "#0f172a" : activeCondo?.primaryColor ?? "#0f766e";

  useEffect(() => {
    if (typeof window === "undefined" || !showManagerCondoFilter) {
      setManagerSelectedCondoId("ALL");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    setManagerSelectedCondoId(params.get("condoId") ?? "ALL");
  }, [pathname, showManagerCondoFilter]);

  useEffect(() => {
    if (state.themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.themeMode]);

  useEffect(() => {
    const root = document.documentElement;
    const primary = !isManagerScope && activeCondo?.primaryColor ? hexToHsl(activeCondo.primaryColor) : undefined;

    if (primary) {
      root.style.setProperty("--primary", primary);
      root.style.setProperty("--ring", primary);
      root.style.setProperty("--accent", primary);
    } else {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--ring");
      root.style.removeProperty("--accent");
    }
  }, [activeCondo?.primaryColor, isManagerScope]);

  const switchCondo = async (condoId: string) => {
    const condo = state.condos[condoId];
    if (!condo) {
      return;
    }

    setCondoMenuOpen(false);

    if (isPlatformPage(pathname)) {
      await state.setActiveCondoId(condoId);
      router.replace(pathname ?? "/dashboard");
      return;
    }

    useDashboardStore.setState({ activeCondoId: condoId });
    window.location.assign(buildTenantUrl(condo.prefix, pathname ?? "/dashboard", state.accessToken, condoId));
  };

  const handleExit = async () => {
    if (currentUser?.role === "ADMIN_COMPANY" && !isManagerScope) {
      window.location.assign(buildManagerUrl("/company", state.accessToken));
      return;
    }

    await state.logout();
    router.replace("/login");
  };

  const handleManagerCondoFilterChange = (value: string) => {
    if (typeof window === "undefined") {
      return;
    }

    setManagerSelectedCondoId(value || "ALL");

    const next = new URLSearchParams(window.location.search);
    if (!value || value === "ALL") {
      next.delete("condoId");
    } else {
      next.set("condoId", value);
    }

    if (next.has("page")) {
      next.set("page", "1");
    }

    const rendered = next.toString();
    router.replace(rendered ? `${pathname}?${rendered}` : pathname ?? "/company", { scroll: false });
  };

  const condoSwitcher = (mode: "desktop" | "mobile") => {
    if (!canSwitchCondos || accessibleCondos.length <= 1) {
      return null;
    }

    const isMobile = mode === "mobile";

    return (
      <div ref={condoMenuRef} className={`relative ${isMobile ? "block w-full sm:hidden" : "hidden sm:block"}`}>
        <button
          type="button"
          className={`flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 ${isMobile ? "" : "min-w-[240px]"}`}
          onClick={() => setCondoMenuOpen((value) => !value)}
          aria-haspopup="listbox"
          aria-expanded={condoMenuOpen}
        >
          <span className="flex min-w-0 items-center gap-2">
            {activeCondo?.logoUrl ? (
              <img src={activeCondo.logoUrl} alt="" className="h-7 w-7 rounded-lg object-contain" />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-4 w-4" />
              </span>
            )}
            <span className="truncate font-medium">{activeCondo?.name ?? "Selecionar operação"}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
        </button>

        {condoMenuOpen ? (
          <div className={`absolute z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-900 ${isMobile ? "left-0 right-0" : "right-0 w-72"}`} role="listbox">
            {accessibleCondos.map((condo) => (
              <button
                key={condo.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => {
                  void switchCondo(condo.id);
                }}
                role="option"
                aria-selected={condo.id === state.activeCondoId}
              >
                {condo.logoUrl ? (
                  <img src={condo.logoUrl} alt="" className="h-8 w-8 rounded-lg object-contain" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-4 w-4" />
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate font-medium">{condo.name}</span>
                {condo.id === state.activeCondoId ? <Check className="h-4 w-4 text-primary" /> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

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
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (condoMenuOpen && condoMenuRef.current && !condoMenuRef.current.contains(target)) {
        setCondoMenuOpen(false);
      }

      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [condoMenuOpen, userMenuOpen]);

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

    const allowedPaths = new Set(visibleSections.map((section) => section.href));
    const isCompanyPath = pathname?.startsWith("/company");
    if (canViewSubscription) {
      allowedPaths.add("/company");
      allowedPaths.add("/subscription");
      allowedPaths.add("/subscription/payment");
      allowedPaths.add("/my-condos");
    }

    if (currentUser.role !== "ADMIN_COMPANY" && pathname?.startsWith("/company")) {
      router.replace("/dashboard");
      return;
    }

    if (pathname && !(allowedPaths.has(pathname) || (canViewSubscription && isCompanyPath))) {
      router.replace(currentUser.role === "ADMIN_COMPANY" ? "/company" : visibleSections[0]?.href ?? "/dashboard");
    }
  }, [canViewSubscription, currentUser, pathname, router, state.bootstrapped, state.hydrationComplete, visibleSections]);

  useEffect(() => {
    if (!state.hydrationComplete || !state.bootstrapped || currentUser?.role !== "ADMIN_COMPANY") {
      setSubscriptionLocked(false);
      return;
    }

    let cancelled = false;
    void dashboardApi.saas
      .customerPortal()
      .then((portal) => {
        if (cancelled) {
          return;
        }

        const trialEndsAt = portal.currentSubscription?.trialEndsAtUtc ? new Date(portal.currentSubscription.trialEndsAtUtc).getTime() : undefined;
        const isTrialActive =
          portal.currentSubscription?.status === "TRIALING" &&
          (!trialEndsAt || Number.isNaN(trialEndsAt) || trialEndsAt > Date.now());
        const locked = !!portal.currentSubscription && portal.currentSubscription.status !== "ACTIVE" && !isTrialActive;

        setSubscriptionLocked(locked);
        if (locked && pathname !== "/subscription/payment") {
          router.replace("/subscription/payment");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSubscriptionLocked(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.role, pathname, router, state.bootstrapped, state.hydrationComplete]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div
        className={`mb-8 flex px-2 ${collapsedNav ? "justify-center" : "items-center gap-3"}`}
      >
        <div className="flex w-full items-center justify-center">
          {isManagerScope ? (
            <CondoHomeBrandImage
              variant={collapsedNav ? "mark" : "logo"}
              forceWhite
              className={collapsedNav ? "h-14 w-14 object-contain" : "h-16 w-auto object-contain"}
            />
          ) : activeCondo?.logoUrl ? (
            <img
              src={activeCondo.logoUrl}
              alt={activeCondo.name}
              className={collapsedNav ? "h-14 w-14 rounded-2xl object-contain" : "max-h-16 w-auto object-contain"}
            />
          ) : (
            <CondoHomeBrandImage
              forceWhite
              variant={collapsedNav ? "mark" : "logo"}
              className={collapsedNav ? "h-14 w-14 object-contain" : "h-16 w-auto object-contain"}
            />
          )}
        </div>
      </div>

      <nav className="space-y-1">
        {(isManagerScope ? companySections : visibleSections).map((section) => {
          const Icon = section.icon;
          const active = isManagerScope
            ? section.href === "/company"
              ? pathname === "/company"
              : pathname === section.href
            : currentSection.id === section.id;

          return (
            <Link
              key={section.id}
              href={section.href}
              onClick={() => setMobileOpen(false)}
              style={active ? { borderLeftColor: primaryColor } : undefined}
              className={`flex items-center border-l-4 px-4 py-3 transition ${
                active
                  ? "bg-white/15 text-white shadow-sm"
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
            void handleExit();
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

  if (subscriptionLocked && pathname !== "/subscription/payment") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        Redirecionando para pagamento...
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
          <div
            className="sticky top-0 h-screen overflow-y-auto p-6"
            style={{
              background: `linear-gradient(180deg, ${primaryColor} 0%, #070d18 58%, #070d18 100%)`,
            }}
          >
            {sidebar}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
            <div className="space-y-3 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-4">
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
                  {!isManagerScope ? condoSwitcher("desktop") : null}
                  {showManagerCondoFilter ? (
                    <div className="hidden sm:block">
                      <select
                        className="input min-w-[220px]"
                        value={managerSelectedCondoId}
                        onChange={(event) => handleManagerCondoFilterChange(event.target.value)}
                      >
                        <option value="ALL">Toda a carteira</option>
                        {accessibleCondos.map((condo) => (
                          <option key={condo.id} value={condo.id}>
                            {condo.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
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
                  <div ref={userMenuRef} className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 gap-2 px-3"
                      onClick={() => setUserMenuOpen((value) => !value)}
                      aria-haspopup="menu"
                      aria-expanded={userMenuOpen}
                    >
                      <UserCircle className="h-4 w-4" />
                      <span className="hidden max-w-32 truncate sm:inline">
                        {currentUser.name}
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    </Button>

                    {userMenuOpen ? (
                      <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-900" role="menu">
                        <div className="px-3 py-2">
                          <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">
                            {currentUser.name}
                          </p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {currentUser.email}
                          </p>
                        </div>
                        {canViewSubscription ? (
                          <>
                            <Link
                              href="/company"
                              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                              onClick={() => setUserMenuOpen(false)}
                              role="menuitem"
                            >
                              <Building2 className="h-4 w-4" />
                              Visão da empresa
                            </Link>
                            <Link
                              href="/subscription"
                              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                              onClick={() => setUserMenuOpen(false)}
                              role="menuitem"
                            >
                              <ReceiptText className="h-4 w-4" />
                              Minha assinatura
                            </Link>
                          </>
                        ) : null}
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                          onClick={() => {
                            setUserMenuOpen(false);
                            void handleExit();
                          }}
                          role="menuitem"
                        >
                          <LogOut className="h-4 w-4" />
                          Sair
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              {!isManagerScope ? (
                <div className="flex flex-wrap items-center gap-2">{condoSwitcher("mobile")}</div>
              ) : showManagerCondoFilter ? (
                <div className="sm:hidden">
                  <select
                    className="input"
                    value={managerSelectedCondoId}
                    onChange={(event) => handleManagerCondoFilterChange(event.target.value)}
                  >
                    <option value="ALL">Toda a carteira</option>
                    {accessibleCondos.map((condo) => (
                      <option key={condo.id} value={condo.id}>
                        {condo.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
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
          <div
            className="absolute left-0 top-0 h-full w-[88vw] max-w-[340px] bg-zinc-950 p-5 shadow-2xl"
            style={{
              background: `linear-gradient(180deg, ${primaryColor} 0%, #070d18 58%, #070d18 100%)`,
            }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-zinc-300 hover:bg-white/10 hover:text-white"
                onClick={() => {
                  setMobileOpen(false);
                  void handleExit();
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
