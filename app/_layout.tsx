import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Slot, Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useAuthStore } from "@/store/authStore";

export const unstable_settings = {
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This component handles authentication-based navigation
function AuthenticationGuard({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, error } = useAuthStore();

  useEffect(() => {
    // Only run this effect after the first render
    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';
    
    if (!isAuthenticated && !inAuthGroup && segments[0] !== '') {
      // If not authenticated and not on auth screens or root, redirect to root
      router.replace('/');
    } else if (isAuthenticated && (inAuthGroup || segments[0] === '')) {
      // If authenticated and on auth screens or root, redirect to tabs
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <Slot />;
  }

  return (
    <ErrorBoundary>
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <AuthenticationGuard>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="orders/[id]" 
          options={{ 
            title: "Order Details",
            headerBackTitle: "Back",
          }} 
        />
        <Stack.Screen 
          name="orders/create" 
          options={{ 
            title: "Create Order",
            headerBackTitle: "Back",
            presentation: "modal",
          }} 
        />
        <Stack.Screen 
          name="profile/edit" 
          options={{ 
            title: "Edit Profile",
            headerBackTitle: "Back",
          }} 
        />
        <Stack.Screen 
          name="profile/vehicles" 
          options={{ 
            title: "My Vehicles",
            headerBackTitle: "Back",
          }} 
        />
        <Stack.Screen 
          name="profile/vehicles/add" 
          options={{ 
            title: "Add Vehicle",
            headerBackTitle: "Back",
            presentation: "modal",
          }} 
        />
      </Stack>
    </AuthenticationGuard>
  );
}