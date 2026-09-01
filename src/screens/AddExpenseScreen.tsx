import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useExpenses } from '../context/ExpenseContext';
import { ExpenseCategory } from '../types/Expense';
import { parseNaturalLanguageExpense } from '../services/aiParser';

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Travel',
  'Bills',
  'Entertainment',
  'Shopping',
  'Health',
  'Education',
  'Others',
];

const SAMPLE_PROMPTS = [
  'Spent ₹450 on Zomato pizza yesterday',
  'Uber cab 320 for airport',
  'Paid wifi bill 899',
  'Bought shoes on Zara for 2499',
];

export default function AddExpenseScreen() {
  const { addExpense, settings, getBudgetEquivalency } = useExpenses();

  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSourceBadge, setAiSourceBadge] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const numAmount = parseFloat(amount) || 0;
  const equivalencyText = numAmount > 0 ? getBudgetEquivalency(numAmount) : null;
  // Opportunity Cost: Compound interest 12% over 10 years = amount * (1 + 0.12)^10 = amount * ~3.1058
  const tenYearCompounded = Math.round(numAmount * 3.1058);

  const handleAiParse = async (textToParse?: string) => {
    const input = textToParse || aiPrompt;
    if (!input.trim()) return;

    setIsAiLoading(true);
    try {
      const result = await parseNaturalLanguageExpense(input, settings.geminiApiKey);
      setTitle(result.title);
      if (result.amount > 0) setAmount(result.amount.toString());
      setCategory(result.category);
      setDateStr(result.dateStr);
      setAiSourceBadge(result.source === 'gemini' ? '✨ Gemini AI Parsed' : '⚡ Smart NLP Parsed');
    } catch (err) {
      console.log('AI Parsing failed', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !amount.trim()) return;

    addExpense({
      title: title.trim(),
      amount: parseFloat(amount) || 0,
      category,
      dateStr,
      notes: notes.trim() || undefined,
      emotionalRating: 'unrated',
    });

    // Reset Form
    setTitle('');
    setAmount('');
    setNotes('');
    setAiPrompt('');
    setAiSourceBadge(null);
    setDateStr(new Date().toISOString().split('T')[0]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 🤖 AI NATURAL LANGUAGE QUICK-ENTRY */}
      <View style={styles.aiCard}>
        <View style={styles.aiHeaderRow}>
          <Text style={styles.aiTitle}>🤖 AI Natural Language Entry</Text>
          <Text style={styles.aiSubtitle}>Type or paste your expense</Text>
        </View>

        <TextInput
          placeholder="e.g. Spent ₹850 on dinner with friends yesterday"
          placeholderTextColor="#94A3B8"
          style={styles.aiInput}
          value={aiPrompt}
          onChangeText={setAiPrompt}
          multiline
        />

        <View style={styles.aiButtonRow}>
          <TouchableOpacity
            style={styles.aiParseButton}
            onPress={() => handleAiParse()}
            disabled={isAiLoading}
          >
            {isAiLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.aiParseButtonText}>✨ AI Auto-Fill</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick sample chips */}
        <Text style={styles.samplesLabel}>Try sample prompts:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.samplesScroll}>
          {SAMPLE_PROMPTS.map((sample, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.sampleChip}
              onPress={() => {
                setAiPrompt(sample);
                handleAiParse(sample);
              }}
            >
              <Text style={styles.sampleChipText}>{sample}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {aiSourceBadge && (
          <View style={styles.aiSuccessBadge}>
            <Text style={styles.aiSuccessText}>{aiSourceBadge}</Text>
          </View>
        )}
      </View>

      {/* 📝 STRUCTURED EXPENSE FORM */}
      <View style={styles.formCard}>
        <Text style={styles.formSectionTitle}>Transaction Details</Text>

        <Text style={styles.label}>Title / Merchant</Text>
        <TextInput
          placeholder="e.g. Swiggy, Uber, Electricity"
          placeholderTextColor="#94A3B8"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Amount ({settings.currencySymbol})</Text>
        <TextInput
          placeholder="0.00"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          style={[styles.input, styles.amountInput]}
          value={amount}
          onChangeText={setAmount}
        />

        {/* ⏳ BUDGET EQUIVALENCY & OPPORTUNITY COST PREVIEWS */}
        {numAmount > 0 && (
          <View style={styles.insightBox}>
            <View style={styles.insightRow}>
              <Text style={styles.insightIcon}>📊</Text>
              <Text style={styles.insightText}>
                Budget Impact: <Text style={styles.bold}>{equivalencyText}</Text>
              </Text>
            </View>

            <View style={styles.insightRow}>
              <Text style={styles.insightIcon}>🚀</Text>
              <Text style={styles.insightText}>
                Opportunity Cost: If invested @ 12% for 10 yrs = <Text style={styles.bold}>{settings.currencySymbol}{tenYearCompounded.toLocaleString()}</Text>
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                category === cat && styles.categoryChipActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  category === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#94A3B8"
          style={styles.input}
          value={dateStr}
          onChangeText={setDateStr}
        />

        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          placeholder="e.g. Shared with Rahul, split bill"
          placeholderTextColor="#94A3B8"
          style={styles.input}
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!title.trim() || !amount.trim()) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!title.trim() || !amount.trim()}
        >
          <Text style={styles.saveButtonText}>Log Expense</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  aiCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  aiHeaderRow: {
    marginBottom: 10,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  aiSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  aiInput: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 55,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  aiButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  aiParseButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  aiParseButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  samplesLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 10,
    marginBottom: 6,
    fontWeight: '600',
  },
  samplesScroll: {
    flexDirection: 'row',
  },
  sampleChip: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
  },
  sampleChipText: {
    color: '#E2E8F0',
    fontSize: 11,
  },
  aiSuccessBadge: {
    marginTop: 10,
    backgroundColor: '#065F46',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  aiSuccessText: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  amountInput: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
  },
  insightBox: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 6,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightIcon: {
    fontSize: 16,
  },
  insightText: {
    fontSize: 12,
    color: '#1E40AF',
    flex: 1,
  },
  bold: {
    fontWeight: '800',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  categoryChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
