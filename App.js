import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import CounterApp from './CounterApp';
import ColorChangerApp from './ColorChangerApp';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <CounterApp />
        <ColorChangerApp />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40
  }
});

export default App;