import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import COLORS from '../styles/colors';
import globalStyles from '../styles/globalStyles';
import api from '../api';

const { height } = Dimensions.get('window');

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => value * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const NearbySlaughterhousesScreen = () => {
  const [location, setLocation] = useState(null);
  const [slaughterhouses, setSlaughterhouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapVisible, setMapVisible] = useState(false);
  const router = useRouter();

  const fetchNearbySlaughterhouses = async (lat, lng) => {
    try {
      const res = await api.getNearbySlaughterhouses(lat, lng);
      setSlaughterhouses(res.data?.nearbyAgents || []);
    } catch (err) {
      console.error('❌ Nearby Slaughterhouse Error:', err.message);
      Alert.alert('Error', 'Unable to fetch nearby slaughterhouses.');
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Enable location to continue.');
      setLoading(false);
      return;
    }
    const { coords } = await Location.getCurrentPositionAsync({});
    setLocation(coords);
    fetchNearbySlaughterhouses(coords.latitude, coords.longitude);
  };

  useEffect(() => {
    getLocation();
  }, []);

  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={globalStyles.loadingText}>Finding nearby slaughterhouses...</Text>
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
          {slaughterhouses.map((s) => (
            <Marker
              key={s._id}
              coordinate={{
                latitude: s.location.coordinates[1],
                longitude: s.location.coordinates[0],
              }}
              title={s.name}
              description={s.email}
              pinColor={COLORS.primary}
              onPress={() =>
                router.push({
                  pathname: '(butcher)/purchase-from-agents',
                  params: { slaughterhouseId: item._id },
                })
              }
            />
          ))}
        </MapView>
      ) : (
        <FlatList
          data={slaughterhouses}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={globalStyles.card}
              onPress={() =>
                router.push({
                  pathname: '/purchase-from-agents',
                  params: { slaughterhouseId: item._id },
                })
              }
            >
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
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={globalStyles.emptyStateText}>No slaughterhouses nearby.</Text>
          }
        />
      )}
    </View>
  );
};

export default NearbySlaughterhousesScreen;
