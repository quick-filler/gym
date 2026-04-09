import React from 'react';
import { CreditCard } from 'lucide-react-native';

import { PlaceholderScreen } from '../../components/PlaceholderScreen';

export default function PaymentsScreen() {
  return (
    <PlaceholderScreen
      eyebrow="Finanças"
      title="Seus pagamentos"
      description="Histórico de cobranças, recibos e pendências via Asaas vão aparecer aqui. A situação do plano já está visível no início."
      Icon={CreditCard}
    />
  );
}
