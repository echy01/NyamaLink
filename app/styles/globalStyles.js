import { StyleSheet } from 'react-native';
import COLORS from './colors'; 

const globalStyles = StyleSheet.create({
  // Base Container
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 16, 
  },
  // Card Component Styling
  card: {
    backgroundColor: COLORS.card, 
    padding: 16,
    borderRadius: 12, 
    marginBottom: 12, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Section Header Styling
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark, 
    marginBottom: 10,
  },
  // Card Title Styling
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark, 
    marginBottom: 4,
  },
  // Button Styling
  button: {
    backgroundColor: COLORS.primary, 
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center', 
    flexDirection: 'row', 
  },
  buttonText: {
    color: '#fff', 
    fontWeight: '600',
    marginLeft: 5, 
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary, 
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonOutlineText: {
    color: COLORS.primary, 
    fontWeight: '600',
    marginLeft: 5,
  },
  // Form elements
  input: {
    borderWidth: 1,
    borderColor: COLORS.border, 
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: COLORS.textDark,
    backgroundColor: COLORS.card, 
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textDark, 
    marginBottom: 8,
  },
  // Utility styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  // Text for empty states or loading
  emptyStateText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: COLORS.textLight, 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg, 
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textLight, 
  },
  // General padding for content areas
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
});

export default globalStyles;
