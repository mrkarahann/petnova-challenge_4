import React from 'react';
import { View, Text } from 'react-native';

export default function StatCubugu({
  etiket,
  deger,
  ilerlemeRengi,
  arkaPlanRengi,
  stiller,
}) {
  return (
    <View style={stiller.statSatiri}>
      <View style={stiller.statBaslikSatiri}>
        <Text style={stiller.statEtiketi}>{etiket}</Text>
        <Text style={stiller.statDegeri}>{deger}</Text>
      </View>
      <View style={[stiller.cubukDis, { backgroundColor: arkaPlanRengi }]}>
        <View style={[stiller.cubukIc, { width: `${deger}%`, backgroundColor: ilerlemeRengi }]} />
      </View>
    </View>
  );
}
