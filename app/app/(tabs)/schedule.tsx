import React from 'react';
import { Calendar } from 'lucide-react-native';

import { PlaceholderScreen } from '../../components/PlaceholderScreen';

export default function ScheduleScreen() {
  return (
    <PlaceholderScreen
      eyebrow="Agenda"
      title="Suas aulas"
      description="Reserva de aulas, cancelamento e lista de espera vão aparecer aqui. Estamos terminando a integração com o calendário da academia."
      Icon={Calendar}
    />
  );
}
