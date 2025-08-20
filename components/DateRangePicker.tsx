import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { Calendar, ChevronDown } from 'lucide-react-native';

interface DateRangePickerProps {
  dateFrom: Date;
  dateTo: Date;
  onDateChange: (from: Date, to: Date) => void;
}

export function DateRangePicker({ dateFrom, dateTo, onDateChange }: DateRangePickerProps) {
  const [showModal, setShowModal] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const presets = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
    { label: 'Year to Date', days: -1 },
  ];

  const handlePreset = (days: number) => {
    const to = new Date();
    let from: Date;
    
    if (days === -1) {
      from = new Date(to.getFullYear(), 0, 1);
    } else {
      from = new Date();
      from.setDate(from.getDate() - days);
    }
    
    onDateChange(from, to);
    setShowModal(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={() => setShowModal(true)}>
        <Calendar size={16} color="#6b7280" />
        <Text style={styles.dateText}>
          {formatDate(dateFrom)} - {formatDate(dateTo)}
        </Text>
        <ChevronDown size={16} color="#6b7280" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date Range</Text>
            {presets.map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={styles.presetButton}
                onPress={() => handlePreset(preset.days)}
              >
                <Text style={styles.presetText}>{preset.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  presetButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginBottom: 8,
  },
  presetText: {
    fontSize: 16,
    color: '#374151',
  },
});