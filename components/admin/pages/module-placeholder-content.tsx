import { ModulePlaceholder } from '../module-placeholder';

type ModulePlaceholderContentProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function ModulePlaceholderContent(props: ModulePlaceholderContentProps) {
  return <ModulePlaceholder {...props} />;
}
