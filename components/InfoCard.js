import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../app/styles/colors';

const InfoCard = ({ icon, title, value, subtitle, imageSource, children }) => (
  <View style={styles.card}>
    {imageSource ? (
      <Image source={imageSource} style={styles.cardImage} resizeMode="cover" />
    ) : typeof icon === 'string' ? (
      <Ionicons name={icon} size={30} color={COLORS.primary} style={styles.iconPlaceholder} />
    ) : (
      // If icon is a JSX element like <Image />
      <View style={styles.iconPlaceholder}>{icon}</View>
    )}

    <View style={styles.textContainer}>
      <Text style={styles.title}>{String(title)}</Text>
      {value !== undefined && value !== null && <Text style={styles.value}>{String(value)}</Text>}
      {subtitle !== undefined && subtitle !== null && <Text style={styles.subtitle}>{String(subtitle)}</Text>}
      {children}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  iconPlaceholder: {
    marginRight: 12,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  value: {
    fontSize: 14,
    color: COLORS.textDark,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
});

export default InfoCard;
