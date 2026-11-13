import { AppButton } from '@/components/ui/AppButton';

import { EmptyState } from './EmptyState';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/** Estado de erro com ação de "tentar novamente". */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <EmptyState
      tone="danger"
      icon="cloud-offline-outline"
      title="Algo deu errado"
      description={message}
      action={
        onRetry ? (
          <AppButton title="Tentar novamente" icon="refresh" variant="outline" onPress={onRetry} />
        ) : undefined
      }
    />
  );
}
