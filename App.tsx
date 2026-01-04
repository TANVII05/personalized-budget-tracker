import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppTabs';
import { ExpenseProvider } from './src/context/ExpenseContext';

export default function App() {
  return (
    <ExpenseProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ExpenseProvider>
  );
}
