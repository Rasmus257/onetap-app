
/**
 * Custom Modal Component
 * 
 * Cross-platform modal for displaying messages, confirmations, and alerts.
 * Replaces Alert.alert() for better web compatibility and UX.
 */

import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { BlurView } from "expo-blur";

interface CustomModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

export function CustomModal({
  visible,
  title,
  message,
  type = "info",
  onClose,
  confirmText = "OK",
  cancelText,
  onConfirm,
}: CustomModalProps) {
  const theme = useTheme();

  const getIconForType = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(0, 0, 0, 0.5)" },
            ]}
          />
        )}

        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.dark ? "#1C1C1E" : "#FFFFFF",
            },
          ]}
        >
          <Text style={styles.icon}>{getIconForType()}</Text>

          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
              },
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.message,
              {
                color: theme.dark ? "#98989D" : "#666666",
              },
            ]}
          >
            {message}
          </Text>

          <View style={styles.buttonContainer}>
            {cancelText && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  {
                    backgroundColor: theme.dark ? "#2C2C2E" : "#F2F2F7",
                  },
                ]}
                onPress={onClose}
              >
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: theme.colors.text,
                    },
                  ]}
                >
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={handleConfirm}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 48,
    textAlign: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    // Styles applied via backgroundColor prop
  },
  confirmButton: {
    // Styles applied via backgroundColor prop
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#FFFFFF",
  },
});
