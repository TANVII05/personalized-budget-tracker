import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useExpenses } from '../context/ExpenseContext';

export default function HomeScreen() {
  const { expenses } = useExpenses();

  const totalExpense = expenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const categoryTotals = expenses.reduce(
    (acc: any, item: any) => {
      acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
      return acc;
    },
    {}
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Overview</Text>

      {/* 🔵 TOTAL CARD */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Spent</Text>
        <Text style={styles.totalAmount}>₹{totalExpense}</Text>

        <View style={styles.categoryGrid}>
          <Category label="Food" value={categoryTotals.Food} />
          <Category label="Travel" value={categoryTotals.Travel} />
          <Category label="Bills" value={categoryTotals.Bills} />
          <Category label="Others" value={categoryTotals.Others} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Expenses</Text>

      <FlatList
        data={expenses}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.expenseCard}>
            <View>
              <Text style={styles.expenseTitle}>{item.title}</Text>
              <Text style={styles.categoryTag}>{item.category}</Text>
            </View>
            <Text style={styles.amount}>₹{item.amount}</Text>
          </View>
        )}
      />
    </View>
  );
}

function Category({ label, value }: any) {
  return (
    <View style={styles.categoryBox}>
      <Text style={styles.categoryValue}>₹{value || 0}</Text>
      <Text style={styles.categoryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  totalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
  },
  totalLabel: {
    color: '#777',
    fontSize: 14,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryBox: {
    width: '48%',
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  categoryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryLabel: {
    fontSize: 12,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  expenseCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryTag: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
});
