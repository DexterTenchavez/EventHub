import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const CounterApp = () => {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Counter App</Text>
      <Text style={styles.count}>Count: {count}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Increment (+1)" onPress={() => setCount(count + 1)} />
        <Button title="Decrement (-1)" onPress={() => setCount(count - 1)} />
      </View>
    </View>
  );
};




export default CounterApp;