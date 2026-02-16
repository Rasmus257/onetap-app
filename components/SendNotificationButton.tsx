
import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { sendNotification } from "@/utils/api";
import { CustomModal } from "@/components/ui/Modal";

interface SendNotificationButtonProps {
  variant?: "primary" | "secondary";
  style?: any;
}

export default function SendNotificationButton({
  variant = "primary",
  style,
}: SendNotificationButtonProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    type: "success" | "error";
  }>({
    title: "",
    message: "",
    type: "success",
  });

  const showModal = (title: string, message: string, type: "success" | "error") => {
    setModalConfig({ title, message, type });
    setModalVisible(true);
  };

  const handlePress = async () => {
    console.log("[SendNotificationButton] User tapped Send Notification button");
    setLoading(true);

    try {
      console.log("[API] Requesting POST /api/notifications/send...");
      
      const response = await sendNotification({
        title: "Hello from Natively! 👋",
        message: "This is a test push notification sent from your app.",
      });

      console.log("[API] Notification sent successfully:", response);
      
      showModal(
        "Success",
        `Notification sent successfully! 🎉${response.notificationId ? `\n\nNotification ID: ${response.notificationId}` : ""}`,
        "success"
      );
    } catch (error) {
      console.error("[API] Failed to send notification:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to send notification. Please try again.";
      
      showModal(
        "Error",
        errorMessage,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const isPrimary = variant === "primary";
  const backgroundColor = isPrimary
    ? theme.colors.primary
    : theme.dark
    ? "#2C2C2E"
    : "#F2F2F7";
  const textColor = isPrimary
    ? "#FFFFFF"
    : theme.colors.text;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor },
          style,
        ]}
        onPress={handlePress}
        disabled={loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <Text style={[styles.buttonText, { color: textColor }]}>
            Send Push Notification
          </Text>
        )}
      </TouchableOpacity>

      <CustomModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
