import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { useExpenses } from '../context/ExpenseContext';
import { ExpenseCategory } from '../types/Expense';

export default function SubscriptionScreen() {
  const {
    subscriptions,
    settings,
    addSubscription,
    toggleSubscription,
    deleteSubscription,
    getBudgetEquivalency,
  } = useExpenses();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [category, setCategory] = useState<ExpenseCategory>('Entertainment');

  // Compute Annualized Drain
  const activeSubs = subscriptions.filter(s => s.active);
  const totalAnnualCost = activeSubs.reduce((sum, s) => {
    return sum + (s.billingCycle === 'monthly' ? Number(s.amount) * 12 : Number(s.amount));
  }, 0);

  const totalMonthlyCost = Math.round(totalAnnualCost / 12);
  const annualEquivalency = getBudgetEquivalency(totalAnnualCost);

  const handleAdd = () => {
    if (!title.trim() || !amount.trim()) return;
    addSubscription({
      title: title.trim(),
      amount: parseFloat(amount) || 0,
      billingCycle,
      category,
    });
    setTitle('');
    setAmount('');
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ⚰️ SUBSCRIPTION GRAVEYARD SHOCK BANNER */}
      <View style={styles.shockCard}>
        <View style={styles.shockRow}>
          <Text style={styles.shockIcon}>⚰️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.shockLabel}>ANNUAL SUBSCRIPTION DRAIN</Text>
            <Text style={styles.shockAmount}>
              {settings.currencySymbol}{totalAnnualCost.toLocaleString()}
              <Text style={styles.shockSuffix}> / year</Text>
            </Text>
            <Text style={styles.shockSubtitle}>
              You spend <Text style={styles.bold}>{settings.currencySymbol}{totalMonthlyCost.toLocaleString()}/mo</Text> across {activeSubs.length} active recurring plans.
            </Text>
            <View style={styles.shockLifePill}>
              <Text style={styles.shockLifeText}>
                {settings.profileType === 'student' ? (
                  <>
                    🎓 Consumes <Text style={styles.bold}>{Math.round((totalMonthlyCost / (settings.monthlyBudget || 1)) * 100)}%</Text> of your monthly pocket money
                  </>
                ) : (
                  <>
                    ⏳ Requires <Text style={styles.bold}>{annualEquivalency}</Text> each year
                  </>
                )}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 💡 SMART NEGOTIATION TIP */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Money-Saving Tip</Text>
        <Text style={styles.tipText}>
          Most people forget about at least 2 subscriptions. Pause any service you haven't used in 14 days and test if you really miss it!
        </Text>
      </View>

      {/* LIST OF SUBSCRIPTIONS */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionHeading}>Recurring Services ({subscriptions.length})</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Service</Text>
        </TouchableOpacity>
      </View>

      {subscriptions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No subscriptions tracked</Text>
          <Text style={styles.emptySubtitle}>
            Add Netflix, Spotify, Gym, Cloud Storage, or Internet bills to track your annual drain!
          </Text>
        </View>
      ) : (
        subscriptions.map(item => {
          const annualItemCost =
            item.billingCycle === 'monthly' ? Number(item.amount) * 12 : Number(item.amount);

          return (
            <View
              key={item.id}
              style={[
                styles.subCard,
                !item.active && styles.subCardInactive,
              ]}
            >
              <View style={styles.subMainRow}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text
                      style={[
                        styles.subTitle,
                        !item.active && styles.subTitleInactive,
                      ]}
                    >
                      {item.title}
                    </Text>
                    {!item.active && (
                      <View style={styles.pausedBadge}>
                        <Text style={styles.pausedBadgeText}>Paused / Cancelled</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.subCategory}>
                    {item.category} • {item.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
                  </Text>
                  <Text style={styles.subAnnualDrain}>
                    Annual cost: {settings.currencySymbol}{annualItemCost.toLocaleString()}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={[
                      styles.subAmount,
                      !item.active && styles.subAmountInactive,
                    ]}
                  >
                    {settings.currencySymbol}{Number(item.amount).toLocaleString()}
                    <Text style={styles.cycleSuffix}>
                      /{item.billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </Text>
                  </Text>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[
                        styles.toggleBtn,
                        item.active ? styles.toggleBtnActive : styles.toggleBtnInactive,
                      ]}
                      onPress={() => toggleSubscription(item.id)}
                    >
                      <Text style={styles.toggleBtnText}>
                        {item.active ? 'Pause' : 'Reactivate'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => deleteSubscription(item.id)}
                      style={styles.delBtn}
                    >
                      <Text style={styles.delBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })
      )}

      <View style={{ height: 40 }} />

      {/* ADD SUBSCRIPTION MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeading}>Add Recurring Subscription</Text>

            <Text style={styles.label}>Service Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Netflix, Disney+, Gym, Wifi"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Amount ({settings.currencySymbol})</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
            />

            <Text style={styles.label}>Billing Cycle</Text>
            <View style={styles.cycleRow}>
              <TouchableOpacity
                style={[
                  styles.cycleChip,
                  billingCycle === 'monthly' && styles.cycleChipActive,
                ]}
                onPress={() => setBillingCycle('monthly')}
              >
                <Text
                  style={[
                    styles.cycleText,
                    billingCycle === 'monthly' && styles.cycleTextActive,
                  ]}
                >
                  Monthly
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.cycleChip,
                  billingCycle === 'yearly' && styles.cycleChipActive,
                ]}
                onPress={() => setBillingCycle('yearly')}
              >
                <Text
                  style={[
                    styles.cycleText,
                    billingCycle === 'yearly' && styles.cycleTextActive,
                  ]}
                >
                  Yearly
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
                <Text style={styles.saveBtnText}>Track Service</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  shockCard: {
    backgroundColor: '#3B0764',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  shockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shockIcon: {
    fontSize: 32,
  },
  shockLabel: {
    color: '#E9D5FF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  shockAmount: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginVertical: 2,
  },
  shockSuffix: {
    fontSize: 14,
    color: '#D8B4FE',
    fontWeight: '600',
  },
  shockSubtitle: {
    color: '#F3E8FF',
    fontSize: 12,
    lineHeight: 16,
  },
  shockLifePill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  shockLifeText: {
    color: '#FAF5FF',
    fontSize: 11,
  },
  bold: {
    fontWeight: '800',
  },
  tipCard: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  tipText: {
    fontSize: 11,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  addButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  subCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subCardInactive: {
    backgroundColor: '#F1F5F9',
    opacity: 0.75,
  },
  subMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  subTitleInactive: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  pausedBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pausedBadgeText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  subCategory: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  subAnnualDrain: {
    fontSize: 11,
    color: '#7C3AED',
    fontWeight: '600',
    marginTop: 4,
  },
  subAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  subAmountInactive: {
    color: '#94A3B8',
  },
  cycleSuffix: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FEE2E2',
  },
  toggleBtnInactive: {
    backgroundColor: '#DCFCE7',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  delBtn: {
    padding: 4,
  },
  delBtnText: {
    fontSize: 12,
    color: '#94A3B8',
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
    padding: 20,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
    color: '#0F172A',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  cycleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  cycleChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cycleChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  cycleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  cycleTextActive: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  cancelBtn: {
    padding: 10,
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
