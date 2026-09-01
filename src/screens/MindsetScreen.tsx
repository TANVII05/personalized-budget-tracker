import React, { useState, useEffect } from 'react';
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

export default function MindsetScreen() {
  const {
    wishlist,
    expenses,
    settings,
    addWishlistItem,
    resolveWishlistItem,
    deleteWishlistItem,
    getImpulseSavings,
    getBudgetEquivalency,
  } = useExpenses();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Shopping');
  const [coolDownHours, setCoolDownHours] = useState(24);
  const [now, setNow] = useState(Date.now());

  // Refresh countdown every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const impulseSavings = getImpulseSavings();

  // Calculate Emotional ROI
  const ratedExpenses = expenses.filter(e => e.emotionalRating && e.emotionalRating !== 'unrated');
  const lovedTotal = ratedExpenses
    .filter(e => e.emotionalRating === 'loved')
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const neutralTotal = ratedExpenses
    .filter(e => e.emotionalRating === 'neutral')
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const regretTotal = ratedExpenses
    .filter(e => e.emotionalRating === 'regret')
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const totalRatedAmount = lovedTotal + neutralTotal + regretTotal || 1;

  const lovedPct = Math.round((lovedTotal / totalRatedAmount) * 100);
  const neutralPct = Math.round((neutralTotal / totalRatedAmount) * 100);
  const regretPct = Math.round((regretTotal / totalRatedAmount) * 100);

  const handleAddItem = () => {
    if (!title.trim() || !amount.trim()) return;
    addWishlistItem({
      title: title.trim(),
      amount: parseFloat(amount) || 0,
      category,
      coolDownHours,
    });
    setTitle('');
    setAmount('');
    setModalVisible(false);
  };

  const getRemainingTime = (createdAt: number, hours: number) => {
    const target = createdAt + hours * 60 * 60 * 1000;
    const diff = target - now;
    if (diff <= 0) return null;

    const remainingHrs = Math.floor(diff / (1000 * 60 * 60));
    const remainingMins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${remainingHrs}h ${remainingMins}m`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 🛡️ IMPULSE SAVINGS TROPHY BANNER */}
      <View style={styles.trophyCard}>
        <View style={styles.trophyRow}>
          <Text style={styles.trophyIcon}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.trophyTitle}>Impulse Defense Savings</Text>
            <Text style={styles.trophyAmount}>
              {settings.currencySymbol}{impulseSavings.toLocaleString()}
            </Text>
            <Text style={styles.trophySubtitle}>
              Total money saved by waiting out cool-downs and walking away!
            </Text>
          </View>
        </View>
      </View>

      {/* 💔 EMOTIONAL ROI DASHBOARD */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>💔 Emotional ROI (Feelings on Spends)</Text>
        <Text style={styles.sectionSub}>
          Based on {ratedExpenses.length} purchases reviewed after 48 hours
        </Text>

        <View style={styles.roiGrid}>
          <View style={[styles.roiBox, styles.roiBoxLoved]}>
            <Text style={styles.roiEmoji}>😍</Text>
            <Text style={styles.roiValue}>
              {settings.currencySymbol}{lovedTotal.toLocaleString()}
            </Text>
            <Text style={styles.roiLabel}>Loved ({lovedPct}%)</Text>
          </View>

          <View style={[styles.roiBox, styles.roiBoxNeutral]}>
            <Text style={styles.roiEmoji}>😐</Text>
            <Text style={styles.roiValue}>
              {settings.currencySymbol}{neutralTotal.toLocaleString()}
            </Text>
            <Text style={styles.roiLabel}>Okay ({neutralPct}%)</Text>
          </View>

          <View style={[styles.roiBox, styles.roiBoxRegret]}>
            <Text style={styles.roiEmoji}>😩</Text>
            <Text style={styles.roiValue}>
              {settings.currencySymbol}{regretTotal.toLocaleString()}
            </Text>
            <Text style={styles.roiLabel}>Regret ({regretPct}%)</Text>
          </View>
        </View>
      </View>

      {/* ⏳ IMPULSE BUY COOL-DOWN WISHLIST */}
      <View style={styles.wishlistHeaderRow}>
        <View>
          <Text style={styles.sectionHeading}>⏳ Impulse Cool-Down List</Text>
          <Text style={styles.sectionSub}>Pause before spending on non-essentials</Text>
        </View>
        <TouchableOpacity
          style={styles.addWishlistButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addWishlistButtonText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      {wishlist.length === 0 ? (
        <View style={styles.emptyWishlist}>
          <Text style={styles.emptyWishlistIcon}>✨</Text>
          <Text style={styles.emptyWishlistTitle}>No items currently cooling down</Text>
          <Text style={styles.emptyWishlistSub}>
            Whenever you want to buy something non-essential, add it here and wait 24-48h!
          </Text>
        </View>
      ) : (
        wishlist.map(item => {
          const timeLeft = getRemainingTime(item.createdAt, item.coolDownHours);
          const isUnlocked = !timeLeft;

          return (
            <View key={item.id} style={styles.wishCard}>
              <View style={styles.wishMainRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.wishTitle}>{item.title}</Text>
                  <Text style={styles.wishCategory}>{item.category}</Text>
                  <Text style={styles.wishLifeEnergy}>
                    📊 Impact: {getBudgetEquivalency(Number(item.amount))}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.wishAmount}>
                    {settings.currencySymbol}{Number(item.amount).toLocaleString()}
                  </Text>
                  {item.status === 'locked' && (
                    <View
                      style={[
                        styles.statusBadge,
                        isUnlocked ? styles.statusUnlocked : styles.statusLocked,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {isUnlocked ? '🔓 Ready to Review' : `⏳ ${timeLeft} left`}
                      </Text>
                    </View>
                  )}
                  {item.status === 'cancelled' && (
                    <View style={[styles.statusBadge, styles.statusSaved]}>
                      <Text style={styles.statusText}>🛡️ Resisted (Saved!)</Text>
                    </View>
                  )}
                  {item.status === 'bought' && (
                    <View style={[styles.statusBadge, styles.statusBought]}>
                      <Text style={styles.statusText}>🛒 Bought</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Action Buttons if in locked/unlocked state */}
              {item.status === 'locked' && (
                <View style={styles.wishActionRow}>
                  {isUnlocked ? (
                    <>
                      <TouchableOpacity
                        style={styles.walkAwayButton}
                        onPress={() => resolveWishlistItem(item.id, 'cancelled')}
                      >
                        <Text style={styles.walkAwayButtonText}>🛡️ Walk Away (Save)</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.buyButton}
                        onPress={() => resolveWishlistItem(item.id, 'bought')}
                      >
                        <Text style={styles.buyButtonText}>🛒 Still Need It (Buy)</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.coolingDownBanner}>
                      <Text style={styles.coolingDownBannerText}>
                        🔒 In reflection cool-down. Sleep on it before buying!
                      </Text>
                      <TouchableOpacity
                        onPress={() => deleteWishlistItem(item.id)}
                        style={{ padding: 4 }}
                      >
                        <Text style={{ color: '#94A3B8', fontSize: 12 }}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })
      )}

      <View style={{ height: 40 }} />

      {/* MODAL TO ADD WISHLIST ITEM */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeading}>Add to Impulse Cool-Down</Text>

            <Text style={styles.inputLabel}>Item Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. New Noise-Cancelling Headphones"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.inputLabel}>Price ({settings.currencySymbol})</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
            />

            <Text style={styles.inputLabel}>Cool-Down Duration</Text>
            <View style={styles.durationRow}>
              {[24, 48, 72].map(hrs => (
                <TouchableOpacity
                  key={hrs}
                  style={[
                    styles.durationChip,
                    coolDownHours === hrs && styles.durationChipActive,
                  ]}
                  onPress={() => setCoolDownHours(hrs)}
                >
                  <Text
                    style={[
                      styles.durationText,
                      coolDownHours === hrs && styles.durationTextActive,
                    ]}
                  >
                    {hrs} Hours
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddItem}>
                <Text style={styles.saveBtnText}>Start Timer</Text>
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
  trophyCard: {
    backgroundColor: '#065F46',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  trophyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trophyIcon: {
    fontSize: 32,
  },
  trophyTitle: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  trophyAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginVertical: 2,
  },
  trophySubtitle: {
    color: '#D1FAE5',
    fontSize: 11,
    lineHeight: 15,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  roiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  roiBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  roiBoxLoved: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  roiBoxNeutral: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roiBoxRegret: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  roiEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  roiValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  roiLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  wishlistHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addWishlistButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addWishlistButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyWishlist: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyWishlistIcon: {
    fontSize: 30,
    marginBottom: 6,
  },
  emptyWishlistTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  emptyWishlistSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  wishCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  wishMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wishTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  wishCategory: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  wishLifeEnergy: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '600',
    marginTop: 4,
  },
  wishAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  statusLocked: {
    backgroundColor: '#FEF3C7',
  },
  statusUnlocked: {
    backgroundColor: '#DBEAFE',
  },
  statusSaved: {
    backgroundColor: '#DCFCE7',
  },
  statusBought: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  wishActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  walkAwayButton: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  walkAwayButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  coolingDownBanner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coolingDownBannerText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
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
  inputLabel: {
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
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  durationChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  durationChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  durationTextActive: {
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
