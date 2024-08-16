import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import Modal from "react-native-modal";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const IP = "192.168.236.208"; // Update with your server IP

export default function HomeScreen({ navigation }) {
  const [isModalVisible, setModalVisible] = useState(false);
  const [sound, setSound] = useState();
  const [fireData, setFireData] = useState(null);
  const [smokeData, setSmokeData] = useState(null);
  const [tempData, setTempData] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const playSound = async () => {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/Audio/ExitPath.mp3")
    );
    setSound(sound);
    console.log("Playing Sound");
    await sound.playAsync();
  };

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    if (fireData === "Flem Detected..") {
      Alert.alert("Alert", "Flem is Detected ....");
      playSound();
      toggleModal();
    }
    if (smokeData === "Smoke is Detected ....") {
      console.log(smokeData);
      Alert.alert("Alert", "Smoke is Detected ....");
      playSound();
      toggleModal();
    }
  }, [fireData, smokeData]);

  useEffect(() => {
    setLoading(true);

    const fireSocket = new WebSocket(`ws://${IP}:81`);
    const smokeSocket = new WebSocket(`ws://${IP}:82`);
    const tempSocket = new WebSocket(`ws://${IP}:83`);

    fireSocket.onopen = () => {
      console.log("Connected to fire sensor WebSocket");
    };
    fireSocket.onmessage = (event) => {
      setFireData(event.data);
      console.log("Fire:", event.data);
    };
    fireSocket.onerror = (error) => {
      console.log("Fire WebSocket Error: ", error.message);
    };
    fireSocket.onclose = (e) => {
      console.log("Fire WebSocket closed: ", e.reason);
    };

    smokeSocket.onopen = () => {
      console.log("Connected to smoke sensor WebSocket");
    };
    smokeSocket.onmessage = (event) => {
      setSmokeData(event.data);
      console.log("Smoke:", event.data);
    };
    smokeSocket.onerror = (error) => {
      console.log("Smoke WebSocket Error: ", error.message);
    };
    smokeSocket.onclose = (e) => {
      console.log("Smoke WebSocket closed: ", e.reason);
    };

    tempSocket.onopen = () => {
      console.log("Connected to temperature sensor WebSocket");
    };
    tempSocket.onmessage = (event) => {
      setTempData(event.data);
      console.log("Temp:", event.data);
      // setLoading(false);
    };
    tempSocket.onerror = (error) => {
      console.log("Temperature WebSocket Error: ", error.message);
    };
    tempSocket.onclose = (e) => {
      console.log("Temperature WebSocket closed: ", e.reason);
    };

    return () => {
      fireSocket.close();
      smokeSocket.close();
      tempSocket.close();
    };
  }, []);

  if (!loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Fire Detection, Monitoring and Alerting System based on IoT
      </Text>

      <Text style={styles.status}>
        {" "}
        <Text style={styles.statusTitle}> Fire Sensor Status : </Text>
        <Text style={styles.statusData}> {fireData} </Text>
      </Text>
      <Text style={styles.status}>
        <Text style={styles.statusTitle}> Smoke Sensor Status : </Text>
        <Text style={styles.statusData}> {smokeData} </Text>
      </Text>
      <Text style={styles.status}>
        {" "}
        <Text style={styles.statusTitle}>Temperature: </Text>
        <Text style={styles.statusData}>{tempData}°C</Text>
      </Text>

      <Button
        title="Play Exit Path Map"
        onPress={() => {
          toggleModal();
          playSound();
          Alert.alert("Alert", "Alert triggered!");
        }}
      />

      {isModalVisible && (
        <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
          <View style={styles.modalContent}>
            <Image
              source={require("../assets/Images/map.jpeg")}
              style={styles.modalImage}
            />
          </View>
        </Modal>
      )}
      <Text></Text>
      <Button
        style={{ marginVertical: 100 }}
        title="Go to Profile"
        onPress={() => navigation.navigate("Profile")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ecf0f1",
    padding: 10,
  },
  title: {
    textAlign: "center",
    margin: 20,
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  status: {
    display: "flex",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    width: "90%",
    textAlign: "start",
    fontSize: 14,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  modalContent: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  modalImage: {
    width: 400,
    height: 400,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusTitle: {
    flex: 1,
    fontWeight: "bold",
    color: "#3d2be0",
    marginBottom: 5,
    fontSize: 16,
  },
  statusData: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
});
