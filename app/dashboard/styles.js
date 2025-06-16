import { StyleSheet } from 'react-native';

const colors = {
  primary: '#cc0000',
  secondary: '#f8f8f8',
  textDark: '#333',
  textLight: '#666',
  white: '#fff',
  border: '#eee',
  success: '#27ae60',
  warning: '#f39c12',
  danger: '#e74c3c',
};

export default StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.primary,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8,
  },

  // Typography
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: colors.textDark,
  },
  textLight: {
    fontSize: 14,
    color: colors.textLight,
  },
  textBold: {
    fontWeight: 'bold',
  },

  // Cards & Items
  card: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardHighlight: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Buttons
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  buttonSmall: {
    padding: 8,
    borderRadius: 4,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonOutlineText: {
    color: colors.primary,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },

  // Forms
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.white,
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
    color: colors.textDark,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.primary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.white,
  },

  // Utility
  emptyState: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: 32,
    fontSize: 16,
  },
  spacer: {
    height: 16,
  },
  colors,
});