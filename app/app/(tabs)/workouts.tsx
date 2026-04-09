import React from 'react';
import { Dumbbell } from 'lucide-react-native';

import { PlaceholderScreen } from '../../components/PlaceholderScreen';

export default function WorkoutsScreen() {
  return (
    <PlaceholderScreen
      eyebrow="Treinos"
      title="Suas fichas"
      description="Histórico de fichas, progressão de cargas e vídeos demonstrativos vão viver aqui. Por enquanto, a ficha atual aparece no início."
      Icon={Dumbbell}
    />
  );
}
