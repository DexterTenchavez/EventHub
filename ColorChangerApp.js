import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';

const ColorChangerApp = () => {
  const [bgColor, setBgColor] = useState('white');

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.buttonContainer}>
        <Button title="White" onPress={() => setBgColor('white')} />
        <Button title="Light Blue" onPress={() => setBgColor('#ADD8E6')} />
        <Button title="Light Green" onPress={() => setBgColor('#90EE90')} />
      </View>
    </View>
  );
};



export default ColorChangerApp;