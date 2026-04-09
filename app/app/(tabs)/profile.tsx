import React from 'react';
import { User } from 'lucide-react-native';

import { PlaceholderScreen } from '../../components/PlaceholderScreen';

export default function ProfileScreen() {
  return (
    <PlaceholderScreen
      eyebrow="Perfil"
      title="Sua conta"
      description="Dados pessoais, avaliações físicas, preferências de notificações e logout vão ficar aqui. Em breve."
      Icon={User}
    />
  );
}
