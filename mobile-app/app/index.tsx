import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function App() {
  const [screen, setScreen] = useState(1);
  const [sosInterval, setSosInterval] = useState(15); // minutes
  const [timeToNextSync, setTimeToNextSync] = useState(15 * 60); // seconds
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Form Data
  const [userName, setUserName] = useState('');
  const [transport, setTransport] = useState('Road');
  const [needs, setNeeds] = useState({
    food: 6,
    tablets: 2,
    asthma: 1,
    sanatory: 2
  });
  const [adults, setAdults] = useState(5);
  const [medicalNeed, setMedicalNeed] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    fetchSyncSettings();
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeToNextSync(prev => {
        if (prev <= 1) {
          triggerAutoSync();
          return sosInterval * 60;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const fetchSyncSettings = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/settings');
      const data = await res.json();
      if (data.sos_interval) {
        const interval = parseInt(data.sos_interval, 10);
        setSosInterval(interval);
        setTimeToNextSync(interval * 60);
      }
    } catch (e) {
      console.log('Settings fetch failed', e);
    }
  };

  const triggerAutoSync = async () => {
    console.log('Auto-Sync Triggered');
    await sendSOS(true); // silent sync
  };

  const sendSOS = async (isSilent = false) => {
    setIsSyncing(true);
    try {
      const response = await fetch('http://localhost:3001/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: userName || 'PUBLIC_USER',
          location: { 
            lat: 20.5937 + (Math.random() - 0.5) * 0.01, 
            lng: 78.9629 + (Math.random() - 0.5) * 0.01, 
            name: userName || 'Anonymous User' 
          },
          sosAlert: isSilent ? null : { 
            lat: 20.5937, 
            lng: 78.9629,
            details: { transport, needs, adults, medicalNeed }
          }
        })
      });
      
      const data = await response.json();
      if (data.sos_interval) {
        setSosInterval(parseInt(data.sos_interval, 10));
      }

      if (!isSilent) {
        if (Platform.OS === 'web') alert('SOS Sent Successfully! Help is on the way.');
        else Alert.alert('SOS Sent', 'Your location and needs have been broadcasted to the rescue team.');
      }
    } catch (e) {
      console.log('Sync failed', e);
      if (!isSilent) {
        if (Platform.OS === 'web') alert('Failed to send SOS. Check connections.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const updateNeed = (key, delta) => {
    setNeeds(prev => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Screen 1: Login
  if (screen === 1) {
    return (
      <View style={[styles.container, { backgroundColor: '#FF4136' }]}>
        <View style={styles.headerContainer}>
          <View style={styles.logoCircle}>
             <View style={styles.chakraBorder}>
                <Image 
                  source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Indian_Rescue_Logo.png/200px-Indian_Rescue_Logo.png' }} 
                  style={styles.logo}
                />
             </View>
          </View>
          <Text style={styles.headerTitle}>Indian Emergency{"\n"}Rescue SOS System</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>User Name / Mobile:</Text>
          <TextInput style={styles.input} placeholder="Name: XXXX" placeholderTextColor="#999" onChangeText={setUserName} value={userName} />
          <TextInput style={styles.input} placeholder="Password: *****" secureTextEntry placeholderTextColor="#999" />

          <Text style={[styles.label, { marginTop: 20 }]}>Bypass - Login:</Text>
          <TextInput style={styles.input} placeholder="Name / Phone : XXXX" placeholderTextColor="#999" />

          <TouchableOpacity style={styles.loginBtn} onPress={() => setScreen(2)}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.alertBtn}>
            <Text style={styles.alertBtnText}>Latest Alerts</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.footerNumber}>1</Text>
      </View>
    );
  }

  // Screen 2: Requirements
  if (screen === 2) {
    return (
      <View style={[styles.container, { backgroundColor: '#FFFFCC' }]}>
        <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
          <View style={styles.redCard}>
            <Text style={styles.cardTitleText}>How can we reach to Rescue you. VIA ?</Text>
          </View>
          
          <View style={styles.row}>
            {['AIR', 'Boat', 'Road'].map(mode => (
              <TouchableOpacity 
                key={mode} 
                style={[styles.modeBtn, transport === mode && styles.modeBtnActive]} 
                onPress={() => setTransport(mode)}
              >
                <Text style={[styles.modeBtnText, transport === mode && {color: 'white'}]}>{mode}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.subLabel}>Provide your surrounding Status</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.iconBtn}><MaterialCommunityIcons name="volume-high" size={40} color="black" /></TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, {padding: 5}]}><MaterialCommunityIcons name="camera-outline" size={45} color="black" /></TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}><MaterialCommunityIcons name="file-document-edit-outline" size={40} color="black" /></TouchableOpacity>
          </View>

          <View style={styles.needsSection}>
            <View style={styles.needsHeader}>
               <Text style={styles.needsHeaderText}>Supply of Basic Needs</Text>
            </View>
            
            <View style={styles.needRow}>
              <Text style={styles.needText}>1. Food</Text>
              <View style={styles.counter}>
                 <TouchableOpacity onPress={() => updateNeed('food', -1)}><Text style={styles.counterBtn}>-</Text></TouchableOpacity>
                 <Text style={styles.counterText}>{needs.food} nos.</Text>
                 <TouchableOpacity onPress={() => updateNeed('food', 1)}><Text style={styles.counterBtn}>+</Text></TouchableOpacity>
              </View>
            </View>
            <View style={styles.needRow}>
              <Text style={styles.needText}>2. Tablets</Text>
              <View style={styles.counter}>
                 <TouchableOpacity onPress={() => updateNeed('tablets', -1)}><Text style={styles.counterBtn}>-</Text></TouchableOpacity>
                 <Text style={styles.counterText}>{needs.tablets} nos.</Text>
                 <TouchableOpacity onPress={() => updateNeed('tablets', 1)}><Text style={styles.counterBtn}>+</Text></TouchableOpacity>
              </View>
            </View>
            <View style={styles.needRow}>
              <Text style={styles.needText}>3. Asthma Kit</Text>
              <View style={styles.counter}>
                 <TouchableOpacity onPress={() => updateNeed('asthma', -1)}><Text style={styles.counterBtn}>-</Text></TouchableOpacity>
                 <Text style={styles.counterText}>{needs.asthma} nos.</Text>
                 <TouchableOpacity onPress={() => updateNeed('asthma', 1)}><Text style={styles.counterBtn}>+</Text></TouchableOpacity>
              </View>
            </View>
            <View style={styles.needRow}>
              <Text style={styles.needText}>4. Sanatory Kit</Text>
              <View style={styles.counter}>
                 <TouchableOpacity onPress={() => updateNeed('sanatory', -1)}><Text style={styles.counterBtn}>-</Text></TouchableOpacity>
                 <Text style={styles.counterText}>{needs.sanatory} nos.</Text>
                 <TouchableOpacity onPress={() => updateNeed('sanatory', 1)}><Text style={styles.counterBtn}>+</Text></TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.peopleSection}>
              <Text style={styles.peopleLabel}>Number of{"\n"}Peoples with You:</Text>
              <View style={styles.peopleCountBox}>
                 <TextInput 
                   style={styles.peopleCount} 
                   keyboardType="numeric" 
                   value={String(adults)} 
                   onChangeText={v => setAdults(parseInt(v) || 0)} 
                 />
                 <Text style={styles.peopleSubText}>Adults</Text>
              </View>
          </View>

          <TouchableOpacity style={styles.nextBtn} onPress={() => setScreen(3)}>
            <Text style={styles.nextBtnText}>Next Step</Text>
            <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
          </TouchableOpacity>
        </ScrollView>
        <Text style={styles.footerNumber}>2</Text>
      </View>
    );
  }

  // Screen 3: SOS
  return (
    <View style={[styles.container, { backgroundColor: '#00A6EB' }]}>
      <View style={styles.medicalHeader}>
        <View style={styles.medicalIconCircle}>
           <MaterialCommunityIcons name="ambulance" size={60} color="white" />
        </View>
        <View style={styles.blueBox}>
           <Text style={styles.medicalHeaderText}>Need Medical Emergency ?</Text>
        </View>
      </View>

      <View style={styles.row}>
         <TouchableOpacity 
           style={[styles.medicalBtn, medicalNeed === 'pregnancy' && styles.medicalBtnActive]}
           onPress={() => setMedicalNeed('pregnancy')}
         >
           <Text style={styles.medicalBtnText}>Pregnancy{"\n"}Support</Text>
         </TouchableOpacity>
         <TouchableOpacity 
           style={[styles.medicalBtn, medicalNeed === 'medical' && styles.medicalBtnActive]}
           onPress={() => setMedicalNeed('medical')}
         >
           <Text style={styles.medicalBtnText}>Medical{"\n"}Support</Text>
         </TouchableOpacity>
      </View>

      <View style={styles.sosContainer}>
         <Text style={styles.sosTitle}>Triggering the SOS</Text>
         
         <TouchableOpacity style={styles.sosBtn} onPress={() => sendSOS()}>
            <View style={styles.sosInner}>
              <Text style={styles.sosBtnText}>SOS</Text>
              <MaterialCommunityIcons name="gesture-tap" size={40} color="white" />
            </View>
            <Ionicons name="hand-right" size={40} color="white" style={styles.handIcon} />
         </TouchableOpacity>

         <View style={styles.timerContainer}>
            <View style={styles.syncIndicator}>
               <MaterialCommunityIcons 
                 name="sync" 
                 size={20} 
                 color={isSyncing ? "yellow" : "white"} 
                 style={isSyncing && {transform: [{rotate: '360deg'}]}}
               />
               <Text style={styles.timerLabel}>Timing Sync: </Text>
               <Text style={styles.timerValue}>{formatTime(timeToNextSync)}</Text>
            </View>
         </View>

         <Text style={styles.sosFooterText}>
           ( Please Don't Worry you will{"\n"}Receive the support from{"\n"}Our Rescue Team )
         </Text>

         <TouchableOpacity onPress={() => setScreen(1)} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Back to Home</Text>
         </TouchableOpacity>
      </View>
      <Text style={styles.footerNumber}>3</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { height: '35%', alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  logoCircle: { width: 120, height: 120, backgroundColor: 'white', borderRadius: 60, padding: 5, justifyContent: 'center', alignItems: 'center' },
  chakraBorder: { width: '100%', height: '100%', borderRadius: 60, borderStyle: 'dotted', borderWidth: 3, borderColor: '#000080', justifyContent: 'center', alignItems: 'center' },
  logo: { width: '80%', height: '80%', resizeMode: 'contain' },
  headerTitle: { fontSize: 26, fontWeight: '900', color: 'white', textAlign: 'center', marginTop: 15, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 2 },
  formContainer: { flex: 1, padding: 25, backgroundColor: '#FF4136' },
  label: { color: 'yellow', fontSize: 18, marginBottom: 5, fontWeight: 'bold' },
  input: { backgroundColor: 'white', borderRadius: 5, padding: 12, marginBottom: 20, fontSize: 18, borderBottomWidth: 3, borderBottomColor: '#28A745', fontWeight: 'bold' },
  loginBtn: { backgroundColor: '#28A745', padding: 15, borderRadius: 30, alignItems: 'center', width: '60%', alignSelf: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, elevation: 5 },
  loginBtnText: { color: 'black', fontSize: 24, fontWeight: 'bold' },
  alertBtn: { backgroundColor: '#FF851B', padding: 15, borderRadius: 30, alignItems: 'center', width: '80%', alignSelf: 'center', marginTop: 30 },
  alertBtnText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  footerNumber: { position: 'absolute', bottom: 10, alignSelf: 'center', color: 'red', fontSize: 60, fontWeight: 'bold', opacity: 0.8 },

  // Screen 2
  redCard: { backgroundColor: '#990000', padding: 12, width: '90%', borderRadius: 8, marginBottom: 20 },
  cardTitleText: { color: 'white', fontSize: 20, textAlign: 'center', fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 20 },
  modeBtn: { backgroundColor: 'white', borderColor: '#990000', borderWidth: 2, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  modeBtnActive: { backgroundColor: '#FF4136' },
  modeBtnText: { color: '#990000', fontWeight: 'bold', fontSize: 20 },
  subLabel: { color: '#28A745', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  iconBtn: { backgroundColor: 'white', borderColor: '#28A745', borderWidth: 2, padding: 10, borderRadius: 8 },
  needsSection: { width: '95%', backgroundColor: '#FFE4E1', borderRadius: 25, borderWidth: 3, borderColor: '#990000', padding: 15, paddingTop: 25, marginBottom: 20 },
  needsHeader: { backgroundColor: '#990000', alignSelf: 'center', paddingHorizontal: 30, paddingVertical: 8, borderRadius: 10, position: 'absolute', top: -20 },
  needsHeaderText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  needRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#FFB6C1', paddingBottom: 5 },
  needText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  counter: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderColor: '#28A745', borderWidth: 2, borderRadius: 8, paddingHorizontal: 10 },
  counterBtn: { fontSize: 28, fontWeight: 'bold', paddingHorizontal: 10, color: '#0056b3' },
  counterText: { fontSize: 18, fontWeight: 'bold', color: '#28A745', marginHorizontal: 10 },
  peopleSection: { flexDirection: 'row', width: '90%', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  peopleLabel: { color: 'red', fontSize: 20, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  peopleCountBox: { backgroundColor: '#990000', padding: 10, borderRadius: 10, alignItems: 'center', width: 100 },
  peopleCount: { color: 'white', fontSize: 32, fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: 'white', textAlign: 'center', width: '100%' },
  peopleSubText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  nextBtn: { flexDirection: 'row', backgroundColor: '#00A6EB', padding: 15, borderRadius: 30, alignItems: 'center', width: '70%', justifyContent: 'center', gap: 10 },
  nextBtnText: { color: 'white', fontSize: 22, fontWeight: 'bold' },

  // Screen 3
  medicalHeader: { alignItems: 'center', marginTop: 50, marginBottom: 30 },
  medicalIconCircle: { backgroundColor: '#990000', width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 3, borderColor: 'white' },
  blueBox: { backgroundColor: '#005580', paddingHorizontal: 25, paddingVertical: 10, borderRadius: 30, borderWidth: 2, borderColor: 'white' },
  medicalHeaderText: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  medicalBtn: { backgroundColor: 'red', width: 160, height: 80, justifyContent: 'center', alignItems: 'center', borderRadius: 40, borderWidth: 3, borderColor: 'white' },
  medicalBtnActive: { backgroundColor: '#990000' },
  medicalBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' },
  sosContainer: { flex: 1, alignItems: 'center', padding: 20 },
  sosTitle: { fontSize: 24, fontWeight: 'bold', marginVertical: 20, color: 'black' },
  sosBtn: { backgroundColor: 'red', width: 160, height: 160, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.5, elevation: 12, borderWidth: 4, borderColor: 'white' },
  sosInner: { alignItems: 'center' },
  sosBtnText: { color: 'white', fontSize: 50, fontWeight: '900' },
  handIcon: { position: 'absolute', bottom: -10, right: -10 },
  timerContainer: { marginTop: 30, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  syncIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timerLabel: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  timerValue: { color: 'yellow', fontSize: 24, fontWeight: '900' },
  sosFooterText: { color: 'yellow', textAlign: 'center', marginTop: 30, fontSize: 16, fontWeight: 'bold' },
  backBtn: { marginTop: 20 },
  backBtnText: { color: 'white', textDecorationLine: 'underline', fontSize: 16 }
});

