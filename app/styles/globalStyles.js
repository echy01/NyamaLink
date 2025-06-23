// import { StyleSheet } from 'react-native';
// import COLORS from './colors';

// const globalStyles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.bg,
//     padding: 16,
//   },
//   card: {
//     backgroundColor: COLORS.card,
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.textDark,
//     marginBottom: 8,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.textDark,
//     marginBottom: 4,
//   },
//   button: {
//     backgroundColor: COLORS.primary,
//     padding: 10,
//     borderRadius: 8,
//     marginTop: 10,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderColor: COLORS.border,
//     backgroundColor: COLORS.accent,
//   },
//   tabButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//   },
//   activeTab: {
//     backgroundColor: COLORS.primary,
//   },
//   tabText: {
//     fontWeight: 'bold',
//     color: COLORS.textDark,
//   },
//   content: {
//     flex: 1,
//     padding: 10,
//   },
// });

// export default globalStyles;


import { StyleSheet } from 'react-native';
import COLORS from './colors';

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 16,
  },
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
  sectionHeader: { // Aligned with ButcherDashboard's local styles
    fontSize: 18,
    fontWeight: '600', // Changed from '700' to match butcher.js for consistency
    color: COLORS.textDark,
    marginBottom: 10, // Changed from 8 to match butcher.js
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center', // Added for better button content centering
    flexDirection: 'row', // Added for icon + text
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 5, // Space for icon
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
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: COLORS.bg,
    fontSize: 16,
  },

  // Moved from butcher.js and adapted for general use
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border, 
    backgroundColor: COLORS.card, 
  },
  tabButton: {
    alignItems: 'center',
    padding: 8,
    flex: 1,
  },
  activeTab: {
    backgroundColor: COLORS.primary, 
    borderRadius: 10,
    marginHorizontal: 4,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.textLight, 
    fontFamily: 'Poppins_400Regular', 
  },
  activeTabText: {
    color: '#fff', 
    fontWeight: 'bold',
  },

  // Added new general styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textLight,
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: COLORS.textLight,
  },
  // Existing styles that were in your previous globalStyles.js
  content: { // Re-added as it was present in your original globalStyles
    flex: 1,
    paddingHorizontal: 16,
  },
  header: { // Re-added as it was present in your original globalStyles
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.primary,
    paddingTop: 50,
  },
  headerTitle: { // Re-added as it was present in your original globalStyles
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff', // Use COLORS.white
  },
  label: { // Re-added as it was present in your original globalStyles
    marginBottom: 6,
    fontWeight: '600',
    color: COLORS.textDark,
  },
});

export default globalStyles;
