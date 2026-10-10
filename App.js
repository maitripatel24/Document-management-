import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { isFirebaseConfigured } from './src/firebaseConfig';
import { Button, Loading, colors, styles } from './src/ui';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcon = (emoji) => ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;

function MainTabs() {
  const { isAdmin } = useAuth();
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: colors.primary }}>
      <Tab.Screen name="Documents" component={DocumentsScreen} options={{ tabBarIcon: tabIcon('📁') }} />
      {isAdmin ? (
        <Tab.Screen name="Admin" component={AdminUsersScreen} options={{ title: 'Admin · Team', tabBarLabel: 'Admin', tabBarIcon: tabIcon('🛡️') }} />
      ) : null}
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: tabIcon('👤') }} />
    </Tab.Navigator>
  );
}

function NoProfile() {
  const { logout } = useAuth();
  return (
    <View style={[styles.screen, { justifyContent: 'center', padding: 24 }]}>
      <Text style={styles.title}>Account not set up</Text>
      <Text style={[styles.subtitle, { marginBottom: 24 }]}>
        Your login exists but has no team profile yet. Ask your admin to add you.
      </Text>
      <Button title="Sign out" onPress={logout} />
    </View>
  );
}

function Root() {
  const { user, profile, loading } = useAuth();
  if (loading) return <Loading />;
  return (
    <Stack.Navigator>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Setup" component={SetupScreen} options={{ title: 'First-time setup' }} />
        </>
      ) : !profile ? (
        <Stack.Screen name="NoProfile" component={NoProfile} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="AddDocument" component={AddDocumentScreen} options={{ title: 'Add document' }} />
          <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} options={{ title: 'Document' }} />
          <Stack.Screen name="AddUser" component={AddUserScreen} options={{ title: 'Add team member' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

function NotConfigured() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 24, paddingTop: 80 }}>
      <Text style={styles.title}>Connect Firebase</Text>
      <Text style={styles.subtitle}>
        Open src/firebaseConfig.js and paste your Firebase project's config. See README.md for step-by-step setup.
      </Text>
    </ScrollView>
  );
}

// Firebase modules are loaded only after config exists, so the app shows setup help instead of crashing.
let AuthProvider, useAuth, LoginScreen, SetupScreen, DocumentsScreen, AddDocumentScreen, DocumentDetailScreen,
  AdminUsersScreen, AddUserScreen, ProfileScreen;
if (isFirebaseConfigured) {
  ({ AuthProvider, useAuth } = require('./src/AuthContext'));
  LoginScreen = require('./src/screens/LoginScreen').default;
  SetupScreen = require('./src/screens/SetupScreen').default;
  DocumentsScreen = require('./src/screens/DocumentsScreen').default;
  AddDocumentScreen = require('./src/screens/AddDocumentScreen').default;
  DocumentDetailScreen = require('./src/screens/DocumentDetailScreen').default;
  AdminUsersScreen = require('./src/screens/AdminUsersScreen').default;
  AddUserScreen = require('./src/screens/AddUserScreen').default;
  ProfileScreen = require('./src/screens/ProfileScreen').default;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {isFirebaseConfigured ? (
        <AuthProvider>
          <NavigationContainer>
            <Root />
          </NavigationContainer>
        </AuthProvider>
      ) : (
        <NotConfigured />
      )}
    </SafeAreaProvider>
  );
}
