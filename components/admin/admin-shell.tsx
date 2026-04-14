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
  CreditCard,
  LogOut,
  Menu,
  Moon,
  ReceiptText,
  Wallet,
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
  CONDO_TRANSITION_ENTER,
  CONDO_TRANSITION_PARAM,
  MANAGER_TRANSITION_ENTER,
  dashboardApi,
  startCondoWorkspaceTransition,
  startManagerWorkspaceTransition,
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

const SIDEBAR_STATE_PARAM = "condohome_sidebar";

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const state = useDashboardStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return new URLSearchParams(window.location.search).get(SIDEBAR_STATE_PARAM) === "collapsed";
  });
  const [condoMenuOpen, setCondoMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [featureMenuOpen, setFeatureMenuOpen] = useState(false);
  const [subscriptionLocked, setSubscriptionLocked] = useState(false);
  const [preNavigatingToCondo, setPreNavigatingToCondo] = useState(false);
  const [preNavigatingToManager, setPreNavigatingToManager] = useState(false);
  const [enteringCondoWorkspace, setEnteringCondoWorkspace] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return new URLSearchParams(window.location.search).get(CONDO_TRANSITION_PARAM) === CONDO_TRANSITION_ENTER;
  });
  const [enteringManagerWorkspace, setEnteringManagerWorkspace] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return new URLSearchParams(window.location.search).get(CONDO_TRANSITION_PARAM) === MANAGER_TRANSITION_ENTER;
  });
  const condoMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const featureMenuRef = useRef<HTMLDivElement | null>(null);

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
    : pathname?.startsWith("/regimento-interno")
    ? {
        id: "regimento-interno",
        label: "Mais funcionalidades",
        pageTitle: "Regimento Interno",
        pageDescription: "Centralize o documento, as versões e os arquivos do regimento interno do condomínio.",
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
    : pathname?.startsWith("/company/wallet")
    ? {
        id: "company",
        label: "Visão da empresa",
        pageTitle: "Minha carteira",
        pageDescription: "Acompanhe o saldo consolidado de todas as carteiras da empresa.",
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
      icon: CreditCard,
    },
    {
      id: "company-wallet",
      href: "/company/wallet",
      label: "Minha carteira",
      description: "Saque consolidado",
      icon: Wallet,
    },
    {
      id: "company-condos",
      href: "/my-condos",
      label: "Meus condomínios",
      description: "Carteira operacional",
      icon: Building2,
    },
  ];
  const currentSection =
    pathname?.startsWith("/regimento-interno")
      ? {
          id: "regimento-interno",
          label: "Mais funcionalidades",
          pageTitle: "Regimento Interno",
          pageDescription: "Centralize o documento, as versões e os arquivos do regimento interno do condomínio.",
        }
    : pathname?.startsWith("/company") && canViewSubscription
      ? companySection
    : pathname?.startsWith("/my-condos") && canViewSubscription
      ? myCondosSection
      : visibleSections.find((section) => section.id === requestedSection.id) ?? visibleSections[0];
  const showCompanyRail = currentUser?.role === "ADMIN_COMPANY" && !isManagerScope;
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

    const targetUrl = buildTenantUrl(
      condo.prefix,
      pathname ?? "/dashboard",
      state.accessToken,
      condoId,
      undefined,
      CONDO_TRANSITION_ENTER,
    );

    useDashboardStore.setState({ activeCondoId: condoId });
    setDesktopCollapsed(true);
    setPreNavigatingToCondo(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.location.assign(targetUrl);
      });
    });
  };

  const handleExit = async () => {
    if (currentUser?.role === "ADMIN_COMPANY" && !isManagerScope) {
      startManagerWorkspaceTransition(
        buildManagerUrl("/company", state.accessToken, { [SIDEBAR_STATE_PARAM]: "expanded" }, MANAGER_TRANSITION_ENTER),
      );
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
    if (value && value !== "ALL") {
      useDashboardStore.setState({ activeCondoId: value });
    }

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
                onMouseDown={(event) => {
                  event.preventDefault();
                  void switchCondo(condo.id);
                }}
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

      if (featureMenuOpen && featureMenuRef.current && !featureMenuRef.current.contains(target)) {
        setFeatureMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [condoMenuOpen, featureMenuOpen, userMenuOpen]);

  useEffect(() => {
    const handleEnterCondo = (event: Event) => {
      const customEvent = event as CustomEvent<{ url?: string }>;
      const targetUrl = customEvent.detail?.url;
      if (!targetUrl) {
        return;
      }
      setDesktopCollapsed(true);
      setPreNavigatingToCondo(true);
      window.setTimeout(() => {
        window.location.assign(targetUrl);
      }, 320);
    };

    window.addEventListener("condohome:enter-condo", handleEnterCondo as EventListener);
    return () => {
      window.removeEventListener("condohome:enter-condo", handleEnterCondo as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleEnterManager = (event: Event) => {
      const customEvent = event as CustomEvent<{ url?: string }>;
      const targetUrl = customEvent.detail?.url;
      if (!targetUrl) {
        return;
      }
      setPreNavigatingToManager(true);
      window.setTimeout(() => {
        window.location.assign(targetUrl);
      }, 320);
    };

    window.addEventListener("condohome:enter-manager", handleEnterManager as EventListener);
    return () => {
      window.removeEventListener("condohome:enter-manager", handleEnterManager as EventListener);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !enteringCondoWorkspace || isManagerScope) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    params.delete(CONDO_TRANSITION_PARAM);
    params.delete(SIDEBAR_STATE_PARAM);
    const rendered = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${rendered ? `?${rendered}` : ""}${window.location.hash}`);

    const timer = window.setTimeout(() => {
      setEnteringCondoWorkspace(false);
    }, 360);

    return () => window.clearTimeout(timer);
  }, [enteringCondoWorkspace, isManagerScope]);

  useEffect(() => {
    if (typeof window === "undefined" || !enteringManagerWorkspace || !isManagerScope) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    params.delete(CONDO_TRANSITION_PARAM);
    params.delete(SIDEBAR_STATE_PARAM);
    const rendered = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${rendered ? `?${rendered}` : ""}${window.location.hash}`);

    const timer = window.setTimeout(() => {
      setEnteringManagerWorkspace(false);
    }, 420);

    return () => window.clearTimeout(timer);
  }, [enteringManagerWorkspace, isManagerScope]);

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
    allowedPaths.add("/regimento-interno");

    if (pathname?.startsWith("/chatbot")) {
      router.replace(currentUser.role === "ADMIN_COMPANY" ? "/company" : "/dashboard");
      return;
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

  const renderSidebar = ({
    sections,
    collapsed,
    managerBrand,
    activeResolver,
    showCollapseControl,
    showExitButton,
    sectionActionResolver,
  }: {
    sections: Array<{ id: string; href: string; label: string; description: string; icon: typeof Building2 }>;
    collapsed: boolean;
    managerBrand: boolean;
    activeResolver: (href: string, id: string) => boolean;
    showCollapseControl: boolean;
    showExitButton: boolean;
    sectionActionResolver?: (section: { id: string; href: string; label: string; description: string; icon: typeof Building2 }) => {
      href: string;
      onClick?: () => void;
    };
  }) => (
    <div className="flex h-full flex-col">
      <div
        className={`mb-8 flex min-h-[96px] px-2 ${collapsed ? "justify-center" : "items-center gap-3"}`}
      >
        <div className="flex w-full items-center justify-center">
          {managerBrand ? (
            <CondoHomeBrandImage
              variant={collapsed ? "mark" : "logo"}
              forceWhite
              className={collapsed ? "h-14 w-14 object-contain" : "h-16 w-auto object-contain"}
            />
          ) : activeCondo?.logoUrl ? (
            <img
              src={activeCondo.logoUrl}
              alt={activeCondo.name}
              className={collapsed ? "h-16 w-16 rounded-[1.25rem] object-contain" : "max-h-16 w-auto object-contain"}
            />
          ) : (
            currentUser?.role === "ADMIN_COMPANY" ? (
              <div
                className={`flex items-center justify-center text-white ${collapsed ? "min-h-16 w-full rounded-[1.25rem] bg-white/10 px-2 text-center" : "min-h-16 rounded-2xl bg-white/5 px-4 py-3"}`}
              >
                {collapsed ? (
                  <p className="line-clamp-3 text-[11px] font-semibold leading-4">{activeCondo?.name ?? "Condomínio"}</p>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{activeCondo?.name ?? "Condomínio"}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <CondoHomeBrandImage
                forceWhite
                variant={collapsed ? "mark" : "logo"}
                className={collapsed ? "h-14 w-14 object-contain" : "h-16 w-auto object-contain"}
              />
            )
          )}
        </div>
      </div>

      <nav className="space-y-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const active = activeResolver(section.href, section.id);
          const action = sectionActionResolver?.(section) ?? { href: section.href };
          const itemClass = collapsed
            ? `flex items-center justify-center rounded-xl px-0 py-3 transition ${
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`
            : `flex items-center border-l-4 px-4 py-3 transition ${
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "border-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
              }`;

          return (
            <Link
              key={section.id}
              href={action.href}
              onClick={(event) => {
                setMobileOpen(false);
                action.onClick?.();
                if (action.onClick) {
                  event.preventDefault();
                }
              }}
              style={!collapsed && active ? { borderLeftColor: primaryColor } : undefined}
              className={itemClass}
              aria-label={collapsed ? section.label : undefined}
              title={collapsed ? section.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? (
                <span className="sidebar-copy sidebar-copy-visible min-w-0 pl-3">
                  <span className="block text-sm font-medium">
                    {section.label}
                  </span>
                  <span
                    className={`mt-0.5 block text-xs ${active ? "text-zinc-300" : "text-zinc-500"}`}
                  >
                    {section.description}
                  </span>
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 px-2 pt-6">
        {showExitButton ? (
          <Button
            variant="ghost"
            className={`text-zinc-300 hover:bg-white/10 hover:text-white ${
              collapsed
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
              className={`sidebar-copy ${collapsed ? "sidebar-copy-hidden" : "sidebar-copy-visible"}`}
            >
              {!collapsed ? "Sair" : null}
            </span>
          </Button>
        ) : null}

        {showCollapseControl ? null : null}
      </div>
    </div>
  );
  const sidebar = renderSidebar({
    sections: isManagerScope ? companySections : visibleSections,
    collapsed: collapsedNav,
    managerBrand: isManagerScope,
    activeResolver: (href, id) =>
      isManagerScope
        ? href === "/company"
          ? pathname === "/company"
          : pathname === href
        : currentSection.id === id,
    showCollapseControl: false,
    showExitButton: true,
    sectionActionResolver: !isManagerScope
      ? (section) =>
          section.id === "settings"
            ? {
                href: pathname ?? "/dashboard",
                onClick: () => setFeatureMenuOpen((value) => !value),
              }
            : { href: section.href }
      : undefined,
  });
  const companyRail = renderSidebar({
    sections: companySections,
    collapsed: true,
    managerBrand: true,
    activeResolver: () => false,
    showCollapseControl: false,
    showExitButton: false,
    sectionActionResolver: showCompanyRail
      ? (section) => ({
          href: buildManagerUrl(section.href, state.accessToken, { [SIDEBAR_STATE_PARAM]: "expanded" }, MANAGER_TRANSITION_ENTER),
          onClick: () => {
            startManagerWorkspaceTransition(
              buildManagerUrl(section.href, state.accessToken, { [SIDEBAR_STATE_PARAM]: "expanded" }, MANAGER_TRANSITION_ENTER),
            );
          },
        })
      : undefined,
  });
  if (!state.hydrationComplete || !state.bootstrapped) {
    if (enteringCondoWorkspace || enteringManagerWorkspace) {
      return (
        <main className="h-dvh overflow-hidden bg-slate-100 dark:bg-slate-950">
          <div className="flex h-full min-h-0">
            <aside className={`hidden shrink-0 border-r border-slate-100/10 bg-slate-950 transition-[width] duration-300 ease-out lg:block ${enteringManagerWorkspace ? "w-[300px]" : "w-24"}`}>
              <div
                className={`h-full overflow-y-auto ${enteringManagerWorkspace ? "p-6" : "p-4"}`}
                style={{
                  background: "linear-gradient(180deg, #0f172a 0%, #070d18 58%, #070d18 100%)",
                }}
              >
                {enteringManagerWorkspace
                  ? renderSidebar({
                      sections: companySections,
                      collapsed: false,
                      managerBrand: true,
                      activeResolver: (href) => pathname === href,
                      showCollapseControl: false,
                      showExitButton: true,
                    })
                  : companyRail}
              </div>
            </aside>
            <aside className="hidden w-0 shrink-0 overflow-hidden border-r border-slate-100/10 bg-slate-950 transition-[width] duration-300 ease-out lg:block" />
            <div className="min-w-0 flex-1 min-h-0 flex flex-col">
              <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
                <div className="h-[89px]" />
              </header>
              <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8" />
            </div>
          </div>
        </main>
      );
    }

    return (
    <main className="h-dvh overflow-hidden bg-slate-100 dark:bg-slate-950" />
  );
  }

  if (!currentUser) {
    return (
    <main className="h-dvh overflow-hidden bg-slate-100 dark:bg-slate-950" />
  );
  }

  if (subscriptionLocked && pathname !== "/subscription/payment") {
    return (
    <main className="h-dvh overflow-hidden bg-slate-100 dark:bg-slate-950" />
  );
  }

  return (
    <main className="h-dvh overflow-hidden bg-slate-100 dark:bg-slate-950">
      <div className="flex h-full min-h-0">
        {showCompanyRail ? (
          <aside className={`hidden shrink-0 border-r border-slate-100/10 bg-slate-950 transition-[width] duration-300 ease-out lg:block ${preNavigatingToManager ? "w-[300px]" : "w-24"}`}>
            <div
              className={`h-full overflow-y-auto ${preNavigatingToManager ? "p-6" : "p-4"}`}
              style={{
                background: "linear-gradient(180deg, #0f172a 0%, #070d18 58%, #070d18 100%)",
              }}
            >
              {preNavigatingToManager
                ? renderSidebar({
                    sections: companySections,
                    collapsed: false,
                    managerBrand: true,
                    activeResolver: (href) => pathname === href,
                    showCollapseControl: false,
                    showExitButton: true,
                  })
                : companyRail}
            </div>
          </aside>
        ) : null}
        <aside
          className={`hidden shrink-0 overflow-hidden border-r border-slate-100/10 bg-slate-950 ${enteringManagerWorkspace ? "" : "transition-[width,opacity] duration-300 ease-out"} lg:block ${
            enteringCondoWorkspace || preNavigatingToManager
              ? "w-0 opacity-0"
              : desktopCollapsed
              ? "w-24"
              : "w-[300px]"
          }`}
        >
          <div
            className="h-full overflow-y-auto p-4"
            style={{
              background: `linear-gradient(180deg, ${primaryColor} 0%, #070d18 58%, #070d18 100%)`,
            }}
          >
            {sidebar}
          </div>
        </aside>

        <div className="min-w-0 flex-1 min-h-0 flex flex-col">
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

          <div className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>

      {featureMenuOpen && !isManagerScope ? (
        <div className="fixed inset-0 z-[60] bg-slate-950/35 backdrop-blur-[1px]">
          <div className="flex h-full items-start justify-center px-4 pt-28 sm:pt-36">
            <div
              ref={featureMenuRef}
              className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">Mais funcionalidades</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Acesse recursos adicionais do condomínio.
                </p>
              </div>
              <div className="p-2">
                <Link
                  href="/regimento-interno"
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={() => setFeatureMenuOpen(false)}
                >
                  <span>
                    <span className="block font-medium">Regimento Interno</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">Documentos e versões</span>
                  </span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={() => setFeatureMenuOpen(false)}
                >
                  <span>
                    <span className="block font-medium">Configurações</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">Regras de cobrança e notificações</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

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
