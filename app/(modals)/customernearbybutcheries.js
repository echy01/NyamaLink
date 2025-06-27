import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import globalStyles from '../styles/globalStyles';
import COLORS from '../styles/colors';
import api from '../api';

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => value * Math.PI / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

const { height } = Dimensions.get('window');

const CustomerNearbyButcheriesScreen = () => {
    const [location, setLocation] = useState(null);
    const [butchers, setButchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mapVisible, setMapVisible] = useState(false);
    const router = useRouter();

  const fetchNearbyButchers = async (lat, lng) => {
    try {
      const response = await api.getNearbyButchers(lat, lng);
      setButchers(response.data?.nearbyButchers || []);
    } catch (err) {
      console.error('❌ Nearby Butchers Error:', err.message);
      Alert.alert('Error', 'Unable to fetch nearby butcheries.');
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please enable location to view nearby butcheries.');
      setLoading(false);
      return;
    }
    const { coords } = await Location.getCurrentPositionAsync({});
    setLocation(coords);
    fetchNearbyButchers(coords.latitude, coords.longitude);
  };

  useEffect(() => {
    getLocation();
  }, []);

  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={globalStyles.loadingText}>Finding nearby butcheries...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => setMapVisible(!mapVisible)}
      >
        <Text style={globalStyles.buttonText}>{mapVisible ? 'Show List' : 'Show Map'}</Text>
      </TouchableOpacity>

      {mapVisible ? (
        <MapView
          style={{ width: '100%', height: height * 0.75 }}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {butchers.map((butcher) => (
            <Marker
              key={butcher._id}
              coordinate={{
                latitude: butcher.location.coordinates[1],
                longitude: butcher.location.coordinates[0],
              }}
              title={butcher.name}
              description={butcher.email}
              pinColor={COLORS.primary}
            />
          ))}
        </MapView>
      ) : (
        <FlatList
          data={butchers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingTop: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/butcher-inventory-view/${item._id}`)}
            >
              <View style={globalStyles.card}>
                <Text style={globalStyles.cardTitle}>{item.name}</Text>
                <Text style={{ color: COLORS.textLight }}>{item.email}</Text>
                {location && item.location?.coordinates?.length === 2 && (
                  <Text style={{ color: COLORS.textLight }}>
                    {getDistanceFromLatLonInKm(
                      location.latitude,
                      location.longitude,
                      item.location.coordinates[1],
                      item.location.coordinates[0]
                    ).toFixed(2)} km away
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={globalStyles.emptyStateText}>
              No butcheries found nearby.
            </Text>
          }
        />
      )}
    </View>
  );
};

export default CustomerNearbyButcheriesScreen;
