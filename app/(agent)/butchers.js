import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import globalStyles from '../styles/globalStyles'; 
import InfoCard from '../../components/InfoCard';     
import api from '../api';                         
import COLORS from '../styles/colors';             

const AgentButchersScreen = () => {
  const [butchers, setButchers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchButchers = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const butchersRes = await api.getButchers(); 

      setButchers(Array.isArray(butchersRes.data?.butchers) ? butchersRes.data.butchers : []);
    } catch (err) {
      console.error('❌ Agent Butchers Load Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to load butchers data. Please try again.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchButchers();
  }, [fetchButchers]);

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={localStyles.contentContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
        ) : (
          <FlatList
            data={butchers}
            renderItem={({ item }) => {
              if (!item || !item._id) {
                console.warn("Skipping malformed butcher item:", item);
                return null;
              }
              return (
                <InfoCard
                  icon="person-outline"
                  title={String(item.name)}
                  value={`Email: ${String(item.email)}`}
                  subtitle={`Registered: ${new Date(item.createdAt).toLocaleDateString()}`}
                >
                  {/* Potentially add actions like "View Details" for a specific butcher */}
                </InfoCard>
              );
            }}
            keyExtractor={(item) => String(item._id || item.email)} // Fallback for key if _id is missing
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchButchers} />}
            ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No registered butchers found.</Text>}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 0, 
    paddingTop: 10,
  },
  loadingIndicator: {
    marginTop: 50,
  },
});

export default AgentButchersScreen;
