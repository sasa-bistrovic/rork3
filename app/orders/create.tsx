import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  MapPin, 
  Package, 
  Calendar, 
  DollarSign, 
  FileText,
  Weight,
  Box,
  Layers
} from 'lucide-react-native';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { geocodeAddress } from '@/utils/geocoding';

export default function CreateOrderScreen() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { createOrder, isLoading } = useOrderStore();
  
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [cargoDescription, setCargoDescription] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [cargoVolume, setCargoVolume] = useState('');
  const [cargoItems, setCargoItems] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  
  const handleCreateOrder = async () => {
    if (!user) return;
    
    // Basic validation
    if (!pickupAddress || !deliveryAddress || !cargoDescription || !cargoWeight || !cargoVolume || !price) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    
    try {
      setIsGeocodingLoading(true);
      
      // Geocode pickup address
      const pickupCoords = await geocodeAddress(pickupAddress);
      if (!pickupCoords) {
        Alert.alert('Error', 'Could not geocode pickup address. Please check and try again.');
        setIsGeocodingLoading(false);
        return;
      }
      
      // Geocode delivery address
      const deliveryCoords = await geocodeAddress(deliveryAddress);
      if (!deliveryCoords) {
        Alert.alert('Error', 'Could not geocode delivery address. Please check and try again.');
        setIsGeocodingLoading(false);
        return;
      }
      
      setIsGeocodingLoading(false);
      
      // In a real app, we would use proper date pickers and location pickers
      const now = new Date();
      const scheduledPickup = pickupDate ? new Date(pickupDate).toISOString() : new Date(now.getTime() + 86400000).toISOString();
      const estimatedDelivery = new Date(now.getTime() + 172800000).toISOString();
      
      const newOrder = await createOrder({
        ordererId: user.id,
        pickupLocation: {
          address: pickupAddress,
          latitude: pickupCoords.latitude,
          longitude: pickupCoords.longitude,
        },
        deliveryLocation: {
          address: deliveryAddress,
          latitude: deliveryCoords.latitude,
          longitude: deliveryCoords.longitude,
        },
        cargo: {
          description: cargoDescription,
          weight: parseFloat(cargoWeight),
          volume: parseFloat(cargoVolume),
          items: parseInt(cargoItems) || 1,
        },
        price: parseFloat(price),
        currency: 'USD',
        notes,
        scheduledPickup,
        estimatedDelivery,
      });
      
      Alert.alert(
        'Order Created',
        'Your order has been created successfully',
        [
          { 
            text: 'View Order', 
            onPress: () => router.push(`/orders/${newOrder.id}`) 
          },
          { 
            text: 'Back to Orders', 
            onPress: () => router.back() 
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create order. Please try again.');
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Locations</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <MapPin size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Pickup Address"
              value={pickupAddress}
              onChangeText={setPickupAddress}
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <MapPin size={20} color={colors.secondary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Delivery Address"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cargo Details</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Package size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Cargo Description"
              value={cargoDescription}
              onChangeText={setCargoDescription}
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <View style={styles.inputIcon}>
                <Weight size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Weight (kg)"
                value={cargoWeight}
                onChangeText={setCargoWeight}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.inputIcon}>
                <Box size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Volume (m³)"
                value={cargoVolume}
                onChangeText={setCargoVolume}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <View style={styles.inputIcon}>
                <Layers size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Number of Items"
                value={cargoItems}
                onChangeText={setCargoItems}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.inputIcon}>
                <DollarSign size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Price (USD)"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Calendar size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Pickup Date (YYYY-MM-DD)"
              value={pickupDate}
              onChangeText={setPickupDate}
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.textAreaContainer}>
            <View style={[styles.inputIcon, { alignSelf: 'flex-start', marginTop: 12 }]}>
              <FileText size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.textArea}
              placeholder="Additional Notes"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button 
          title="Create Order" 
          onPress={handleCreateOrder}
          isLoading={isLoading || isGeocodingLoading}
          style={styles.button}
        />
        
        {isGeocodingLoading && (
          <Text style={styles.geocodingText}>Validating addresses...</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    height: 48,
    color: colors.text,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textAreaContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    flex: 1,
    height: 100,
    color: colors.text,
    fontSize: 16,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingRight: 12,
    paddingBottom: 12,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    width: '100%',
  },
  geocodingText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: colors.textLight,
  },
});