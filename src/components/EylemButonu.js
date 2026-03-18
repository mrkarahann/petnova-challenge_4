import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export default function EylemButonu({
  yazi,
  ikon,
  onPress,
  stiller,
  devreDisi = false,
  tema = 'birincil',
  tamGenislik = false,
}) {
  const temaStili =
    tema === 'ikincil'
      ? stiller.butonIkincil
      : tema === 'vurgu'
        ? stiller.butonVurgu
        : stiller.butonBirincil;
  const temaYaziStili =
    tema === 'ikincil'
      ? stiller.butonYazisiAcik
      : tema === 'vurgu'
        ? stiller.butonYazisiKoyu
        : stiller.butonYazisiKoyu;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={devreDisi}
      style={[
        stiller.buton,
        temaStili,
        tamGenislik && stiller.butonTamGenislik,
        devreDisi && stiller.butonDevreDisi,
      ]}
    >
      <Text style={[stiller.butonYazisi, temaYaziStili]}>
        {ikon ? `${ikon} ` : ''}
        {yazi}
      </Text>
    </TouchableOpacity>
  );
}
