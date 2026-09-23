import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { BrutalBox } from './BrutalBox';
import {
  AttributeOption,
  DATING_INTENTION_OPTIONS,
  DealbreakerFilters as Filters,
  DRINKING_OPTIONS,
  FAMILY_PLANS_OPTIONS,
  PET_OPTIONS,
  SMOKING_OPTIONS,
  WORKOUT_OPTIONS,
} from '../types/lifestyle';

interface DealbreakerFiltersProps {
  value: Filters;
  onChange: (next: Filters) => void;
}

const GROUPS: Array<{ key: keyof Filters; title: string; options: AttributeOption[] }> = [
  { key: 'intentions', title: 'THEY ARE LOOKING FOR', options: DATING_INTENTION_OPTIONS },
  { key: 'drinking', title: 'DRINKING', options: DRINKING_OPTIONS },
  { key: 'smoking', title: 'SMOKING', options: SMOKING_OPTIONS },
  { key: 'workout', title: 'EXERCISE', options: WORKOUT_OPTIONS },
  { key: 'pets', title: 'PETS', options: PET_OPTIONS },
  { key: 'family', title: 'FAMILY PLANS', options: FAMILY_PLANS_OPTIONS },
];

/** Multi-select chips per attribute. Nothing selected = no filter; people who left it blank are never hidden. */
export const DealbreakerFilters: React.FC<DealbreakerFiltersProps> = ({ value, onChange }) => {
  const toggle = (key: keyof Filters, option: string) => {
    const current = value[key];
    const next = current.includes(option) ? current.filter((v) => v !== option) : [...current, option];
    onChange({ ...value, [key]: next });
  };

  return (
    <BrutalBox
      backgroundColor="#FFFFFF"
      borderColor={colors.borderBlack}
      borderWidth={2.8}
      borderRadius={20}
      shadowOffset={{ x: 4, y: 4 }}
      contentStyle={styles.card}
    >
      <Text style={styles.title}>DEAL-BREAKERS</Text>
      <Text style={styles.hint}>Only show people whose answer is one of your picks.</Text>

      {GROUPS.map((group) => (
        <View key={group.key} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          <View style={styles.chips}>
            {group.options.map((opt) => {
              const selected = value[group.key].includes(opt.value);
              return (
                <TouchableOpacity
                  key={opt.value}
                  activeOpacity={0.75}
                  onPress={() => toggle(group.key, opt.value)}
                  style={[styles.chip, selected && styles.chipSelected]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                >
                  {selected ? <Ionicons name="checkmark" size={14} color="#000" style={{ marginRight: 4 }} /> : null}
                  <Text style={styles.chipText}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </BrutalBox>
  );
};

const styles = StyleSheet.create({
  card: { padding: 18, gap: 16 },
  title: { fontFamily: typography.headline, fontSize: 20, letterSpacing: 0.5, color: colors.textDark },
  hint: { fontFamily: typography.bodyMedium, fontSize: 12, color: '#6B7280', marginTop: -10 },
  group: { gap: 8 },
  groupTitle: { fontFamily: typography.bodyExtraBold, fontSize: 11, letterSpacing: 0.5, color: '#4B5563' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 2.5, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  chipSelected: { backgroundColor: colors.accentYellow },
  chipText: { fontFamily: typography.bodyBold, fontSize: 12.5, color: colors.textDark },
});
