import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

const roles = ['customer', 'butcher', 'agent'];
const router = useRouter();

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword || !role) {
      return Alert.alert('Error', 'Please fill in all fields.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Alert.alert('Error', 'Enter a valid email address.');
    }

    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match.');
    }

  try {
    const response = await fetch('http://192.168.100.48:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Alert.alert('Signup Error', data.message || 'Failed to create account');
    }

    Alert.alert('Success', 'Account created successfully!');
    router.push('/loginscreen');

  } catch (error) {
    console.error('Signup API error:', error);
    Alert.alert('Error', 'Unable to connect to server. Please try again later.');
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Select Your Role:</Text>
      <View style={styles.roles}>
        {roles.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.roleButton, role === r && styles.selectedRole]}
            onPress={() => setRole(r)}
          >
            <Text style={role === r ? styles.selectedRoleText : styles.roleText}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
        <Text style={styles.signupButtonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/loginscreen')}>
        <Text style={styles.loginLink}>
          Already have an account? <Text style={{ fontWeight: 'bold' }}>Login</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#cc0000',
    textAlign: 'center',
  },
  input: {
    borderColor: '#cc0000',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#000',
  },
  roles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  roleButton: {
    borderWidth: 1,
    borderColor: '#cc0000',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  selectedRole: {
    backgroundColor: '#cc0000',
  },
  roleText: {
    color: '#000000',
  },
  selectedRoleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  signupButton: {
    backgroundColor: '#cc0000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    color: '#000',
    textAlign: 'center',
    marginTop: 12,
  },
});

