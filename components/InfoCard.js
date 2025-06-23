import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../app/styles/colors'; // Corrected import path for colors

const InfoCard = ({ icon, title, value, subtitle, imageSource, children }) => (
  <View style={styles.card}>
    {imageSource ? (
      <Image source={imageSource} style={styles.cardImage} resizeMode="cover" />
    ) : (
      // Render Ionicons as a fallback if no imageSource is provided
      <Ionicons name={icon} size={30} color={COLORS.primary} style={styles.iconPlaceholder} />
    )}
    
    <View style={styles.textContainer}>
      {/* Ensure all potentially displayed text is within a <Text> component */}
      {/* Explicitly convert to String to handle any non-string values gracefully */}
      <Text style={styles.title}>{String(title)}</Text>
      {value !== undefined && value !== null && <Text style={styles.value}>{String(value)}</Text>}
      {subtitle !== undefined && subtitle !== null && <Text style={styles.subtitle}>{String(subtitle)}</Text>}
      
      {/* The 'children' prop will typically contain other components (like Touchables with Text) */}
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
