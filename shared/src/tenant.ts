import type { User } from './models';

interface EnsureTenantInput {
  activeCondoId?: string;
  user?: User;
  availableCondoIds: string[];
}

export const ensureActiveCondoSelected = ({
  activeCondoId,
  user,
  availableCondoIds,
}: EnsureTenantInput): string | undefined => {
  if (!availableCondoIds.length) {
    return undefined;
  }

  if (activeCondoId && availableCondoIds.includes(activeCondoId)) {
    return activeCondoId;
  }

  const preferred = user?.defaultCondoId;
  if (preferred && availableCondoIds.includes(preferred)) {
    return preferred;
  }

  const firstAccessible = user?.accessibleCondoIds.find((id) => availableCondoIds.includes(id));
  if (firstAccessible) {
    return firstAccessible;
  }

  return availableCondoIds[0];
};

export const assertCondoScope = (condoId: string | undefined): string => {
  if (!condoId) {
    throw new Error('Nenhum condomínio ativo selecionado.');
  }
  return condoId;
};
