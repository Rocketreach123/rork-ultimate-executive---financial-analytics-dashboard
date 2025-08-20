import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FiltersProvider } from "@/providers/FiltersProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="dashboard/executive" />
      <Stack.Screen name="dashboard/financial" />
      <Stack.Screen name="dashboard/reactivation" />
      <Stack.Screen name="dashboard/high-value" />
      <Stack.Screen name="dashboard/seasonality" />
      <Stack.Screen name="dashboard/process-mix" />
      <Stack.Screen name="dashboard/customers" />
      <Stack.Screen name="dashboard/trends" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <ThemeProvider>
          <FiltersProvider>
            <RootLayoutNav />
          </FiltersProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
