import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, Platform } from 'react-native';

export default function App() {
  const [inCoverage, setInCoverage] = useState(false);
  const [commands, setCommands] = useState([]);
  const [zones, setZones] = useState([]);
  const [sosInterval, setSosInterval] = useState(15);
  const [role, setRole] = useState('rescue');
  const [deviceId, setDeviceId] = useState('DEVICE_123');
  const [groupId, setGroupId] = useState(1);

  const fetchSyncData = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          role,
          location: { lat: 20.6, lng: 79.0, groupId, name: 'Rescuer ' + deviceId }
        })
      });
      const data = await res.json();
      setCommands(data.commands || []);
      setZones(data.zones || []);
      setSosInterval(parseInt(data.sos_interval, 10));
      Alert.alert('Synced', 'New Commands Received!');
    } catch (e) {
      console.log('Sync Failed', e);
    }
  };

  const sendSOS = async () => {
    try {
      await fetch('http://localhost:3001/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          sosAlert: { lat: 20.5937, lng: 78.9629 }
        })
      });
      Alert.alert('SOS Sent', 'Your location has been broadcasted.');
    } catch (e) {
      console.log('SOS Failed', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Disaster Rescue Mobile App</Text>
      
      <View style={styles.card}>
        <Text style={styles.title}>Network-in-a-Box Sync</Text>
        <Text>Status: {inCoverage ? 'Connected' : 'Searching for NIB...'}</Text>
        <Button title={inCoverage ? "Force Sync Data" : "Enter NIB Coverage"} onPress={() => {
          setInCoverage(true);
          fetchSyncData();
        }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Assigned Tasks</Text>
        {commands.length === 0 ? <Text>No active commands.</Text> : null}
        {commands.map((cmd) => (
          <Text key={cmd.id}>Zone ID {cmd.operation_zone_id} : Route Calculated.</Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Public Action</Text>
        <Text>SOS Interval enforced: {sosInterval} Minutes</Text>
        <Button title="SEND EMERGENCY SOS" color="red" onPress={sendSOS} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', padding: 20, paddingTop: 50 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, elevation: 3, marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#3b82f6' }
});
