import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useExpenses } from '../context/ExpenseContext';
import { EmotionalRating, UserProfileType } from '../types/Expense';

export default function HomeScreen() {
  const {
    expenses,
    settings,
    getDailyAllowance,
    getBudgetEquivalency,
    rateExpense,
    deleteExpense,
    updateSettings,
  } = useExpenses();

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [profileType, setProfileType] = useState<UserProfileType>(settings.profileType || 'student');
  const [budgetInput, setBudgetInput] = useState(settings.monthlyBudget.toString());
  const [wageInput, setWageInput] = useState(settings.hourlyWage.toString());
  const [apiKeyInput, setApiKeyInput] = useState(settings.geminiApiKey || '');

  const { safeToSpendToday, daysRemaining, totalSpentThisMonth, remainingBudget } =
    getDailyAllowance();

  const budgetUsagePercent = Math.min(
    100,
    Math.round((totalSpentThisMonth / (settings.monthlyBudget || 1)) * 100)
  );

  const handleSaveSettings = () => {
    updateSettings({
      profileType,
      monthlyBudget: Number(budgetInput) || (profileType === 'student' ? 8000 : 25000),
      hourlyWage: Number(wageInput) || 400,
      geminiApiKey: apiKeyInput.trim(),
    });
    setSettingsModalVisible(false);
  };

  const isStudent = settings.profileType === 'student';

  return (
    <View style={styles.container}>
      {/* 🌟 TOP HEADER */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.appTitle}>Smart Budget</Text>
          <Text style={styles.subtitle}>
            {isStudent ? '🎓 College Student Pocket Money' : '💼 Personal Finance & AI'}
          </Text>
        </View>

        <View style={styles.headerBadges}>
          <View style={styles.streakPill}>
            <Text style={styles.streakText}>🔥 {settings.streakDays}d Streak</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              setProfileType(settings.profileType || 'student');
              setBudgetInput(settings.monthlyBudget.toString());
              setWageInput(settings.hourlyWage.toString());
              setApiKeyInput(settings.geminiApiKey || '');
              setSettingsModalVisible(true);
            }}
          >
            <Text style={styles.settingsButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 🧠 DYNAMIC "SAFE-TO-SPEND" ALLOWANCE CARD */}
        <View style={styles.safeToSpendCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.safeToSpendLabel}>
              {isStudent ? 'TODAY’S POCKET MONEY LIMIT' : 'GUILT-FREE DAILY ALLOWANCE'}
            </Text>
            <Text style={styles.daysRemainingBadge}>{daysRemaining} days left in month</Text>
          </View>

          <Text style={styles.safeToSpendAmount}>
            {settings.currencySymbol}{safeToSpendToday}
            <Text style={styles.perDaySuffix}> / today</Text>
          </Text>

          <Text style={styles.safeToSpendHelper}>
            {safeToSpendToday > 0
              ? `You have ${settings.currencySymbol}${safeToSpendToday} for today's snacks, food & expenses to keep your ${settings.currencySymbol}${settings.monthlyBudget.toLocaleString()} monthly pocket money on track.`
              : `⚠️ You have exhausted this month's budget! Try to pause non-essential spending.`}
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${budgetUsagePercent}%`,
                    backgroundColor: budgetUsagePercent > 85 ? '#ef4444' : '#3b82f6',
                  },
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelText}>
                Spent: {settings.currencySymbol}{totalSpentThisMonth.toLocaleString()} ({budgetUsagePercent}%)
              </Text>
              <Text style={styles.progressLabelText}>
                Left: {settings.currencySymbol}{remainingBudget.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* 🎓 STUDENT POCKET MONEY SUMMARY BANNER */}
        <View style={styles.insightCard}>
          <View style={styles.insightRow}>
            <Text style={styles.insightIcon}>{isStudent ? '🎓' : '⏳'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>
                {isStudent ? 'Monthly Pocket Money Health' : 'Life-Energy Spent'}
              </Text>
              <Text style={styles.insightSubtitle}>
                {isStudent ? (
                  <>
                    You have spent <Text style={styles.bold}>{budgetUsagePercent}%</Text> of your {settings.currencySymbol}{settings.monthlyBudget.toLocaleString()} monthly allowance. <Text style={styles.bold}>{settings.currencySymbol}{remainingBudget.toLocaleString()}</Text> is still available.
                  </>
                ) : (
                  <>
                    Total spent is equivalent to <Text style={styles.bold}>{getBudgetEquivalency(totalSpentThisMonth)}</Text> at {settings.currencySymbol}{settings.hourlyWage}/hr.
                  </>
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* 📋 RECENT TRANSACTIONS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Expenses & Feelings</Text>
          <Text style={styles.itemCountText}>{expenses.length} logged</Text>
        </View>

        {expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No expenses logged yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the "Smart Log" tab below to log your college food, snacks, outings, or bills!
            </Text>
          </View>
        ) : (
          expenses.slice(0, 15).map(item => (
            <View key={item.id} style={styles.expenseCard}>
              <View style={styles.expenseMainRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.expenseTitle}>{item.title}</Text>
                  <View style={styles.tagRow}>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryTagText}>{item.category}</Text>
                    </View>
                    <Text style={styles.dateTagText}>{item.dateStr || 'Recent'}</Text>
                    <Text style={styles.equivalencyTagText}>
                      📊 {getBudgetEquivalency(Number(item.amount))}
                    </Text>
                  </View>
                </View>

                <View style={styles.amountColumn}>
                  <Text style={styles.amount}>
                    {settings.currencySymbol}{Number(item.amount).toLocaleString()}
                  </Text>
                  <TouchableOpacity
                    onPress={() => deleteExpense(item.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 💔 1-Tap Emotional Check-In */}
              <View style={styles.emotionalCheckinRow}>
                <Text style={styles.feelingPrompt}>Feeling:</Text>
                <TouchableOpacity
                  onPress={() => rateExpense(item.id, 'loved')}
                  style={[
                    styles.feelingPill,
                    item.emotionalRating === 'loved' && styles.feelingPillActiveLoved,
                  ]}
                >
                  <Text style={styles.feelingPillText}>😍 Worth it</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => rateExpense(item.id, 'neutral')}
                  style={[
                    styles.feelingPill,
                    item.emotionalRating === 'neutral' && styles.feelingPillActiveNeutral,
                  ]}
                >
                  <Text style={styles.feelingPillText}>😐 Okay</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => rateExpense(item.id, 'regret')}
                  style={[
                    styles.feelingPill,
                    item.emotionalRating === 'regret' && styles.feelingPillActiveRegret,
                  ]}
                >
                  <Text style={styles.feelingPillText}>😩 Regret</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ⚙️ SETTINGS MODAL */}
      <Modal visible={settingsModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeading}>Personalize Your Profile</Text>

            <Text style={styles.inputLabel}>I am a:</Text>
            <View style={styles.profileTypeRow}>
              <TouchableOpacity
                style={[
                  styles.profileTypeChip,
                  profileType === 'student' && styles.profileTypeChipActive,
                ]}
                onPress={() => setProfileType('student')}
              >
                <Text
                  style={[
                    styles.profileTypeText,
                    profileType === 'student' && styles.profileTypeTextActive,
                  ]}
                >
                  🎓 College Student
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.profileTypeChip,
                  profileType === 'professional' && styles.profileTypeChipActive,
                ]}
                onPress={() => setProfileType('professional')}
              >
                <Text
                  style={[
                    styles.profileTypeText,
                    profileType === 'professional' && styles.profileTypeTextActive,
                  ]}
                >
                  💼 Working Pro
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>
              {profileType === 'student'
                ? `Monthly Pocket Money / Allowance (${settings.currencySymbol})`
                : `Monthly Budget Limit (${settings.currencySymbol})`}
            </Text>
            <Text style={styles.inputHelper}>
              {profileType === 'student'
                ? 'Total allowance you receive per month (e.g. ₹6000 or ₹10000)'
                : 'Total spending ceiling per month'}
            </Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={budgetInput}
              onChangeText={setBudgetInput}
              placeholder={profileType === 'student' ? 'e.g. 8000' : 'e.g. 25000'}
            />

            {profileType === 'professional' && (
              <>
                <Text style={styles.inputLabel}>Approx. Hourly Wage ({settings.currencySymbol}/hr)</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={wageInput}
                  onChangeText={setWageInput}
                  placeholder="e.g. 400"
                />
              </>
            )}

            <Text style={styles.inputLabel}>Google Gemini API Key (Optional)</Text>
            <Text style={styles.inputHelper}>For advanced cloud AI voice/text parsing</Text>
            <TextInput
              style={styles.modalInput}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              placeholder="AIzaSy..."
              autoCapitalize="none"
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setSettingsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
                <Text style={styles.saveButtonText}>Save Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  streakText: {
    color: '#B45309',
    fontWeight: '700',
    fontSize: 13,
  },
  settingsButton: {
    backgroundColor: '#E2E8F0',
    padding: 8,
    borderRadius: 20,
  },
  settingsButtonText: {
    fontSize: 16,
  },
  safeToSpendCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  safeToSpendLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  daysRemainingBadge: {
    backgroundColor: '#334155',
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  safeToSpendAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    marginVertical: 6,
  },
  perDaySuffix: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94A3B8',
  },
  safeToSpendHelper: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  progressContainer: {
    marginTop: 6,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressLabelText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  insightCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightIcon: {
    fontSize: 24,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
  },
  insightSubtitle: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 2,
    lineHeight: 16,
  },
  bold: {
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemCountText: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  expenseCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  expenseMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  dateTagText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  equivalencyTagText: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '600',
  },
  amountColumn: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  deleteButton: {
    padding: 4,
    marginTop: 4,
  },
  deleteButtonText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  emotionalCheckinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  feelingPrompt: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  feelingPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  feelingPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  feelingPillActiveLoved: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  feelingPillActiveNeutral: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  feelingPillActiveRegret: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  profileTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  profileTypeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileTypeChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  profileTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  profileTypeTextActive: {
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
  },
  inputHelper: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginTop: 4,
    color: '#0F172A',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#64748B',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
