import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useExpenses } from '../context/ExpenseContext';

export default function AnalyticsScreen() {
  const { expenses, settings, badges, getForecast } = useExpenses();

  const forecast = getForecast();

  // Category Totals
  const categoryTotals = expenses.reduce((acc: Record<string, number>, item) => {
    acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
    return acc;
  }, {});

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1;

  const getVelocityStatus = () => {
    if (forecast.projectedMonthEndSpend <= settings.monthlyBudget * 0.9) {
      return {
        label: '🟢 Excellent Pace',
        desc: 'You are well under your spending ceiling. Great discipline!',
        color: '#059669',
        bgColor: '#DCFCE7',
      };
    } else if (forecast.projectedMonthEndSpend <= settings.monthlyBudget) {
      return {
        label: '🟡 On Track',
        desc: 'You are on target to meet your budget goal this month.',
        color: '#D97706',
        bgColor: '#FEF3C7',
      };
    } else {
      return {
        label: '🔴 Overspending Risk',
        desc: `At this burn rate, you are projected to exceed your budget by ${settings.currencySymbol}${(forecast.projectedMonthEndSpend - settings.monthlyBudget).toLocaleString()}.`,
        color: '#DC2626',
        bgColor: '#FEE2E2',
      };
    }
  };

  const velocity = getVelocityStatus();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 📊 PREDICTIVE BURN-RATE CARD */}
      <View style={styles.forecastCard}>
        <Text style={styles.forecastHeader}>PREDICTIVE MONTH-END FORECAST</Text>

        <View style={styles.forecastRow}>
          <View>
            <Text style={styles.forecastMainAmount}>
              {settings.currencySymbol}{forecast.projectedMonthEndSpend.toLocaleString()}
            </Text>
            <Text style={styles.forecastSub}>Projected Spend on Day {forecast.totalDaysInMonth}</Text>
          </View>

          <View style={styles.budgetGoalCol}>
            <Text style={styles.budgetGoalLabel}>Budget Goal</Text>
            <Text style={styles.budgetGoalAmount}>
              {settings.currencySymbol}{settings.monthlyBudget.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Velocity Status Banner */}
        <View style={[styles.velocityBanner, { backgroundColor: velocity.bgColor }]}>
          <Text style={[styles.velocityTitle, { color: velocity.color }]}>
            {velocity.label}
          </Text>
          <Text style={styles.velocityDesc}>{velocity.desc}</Text>
        </View>

        {/* Burn Rate Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>
              {settings.currencySymbol}{forecast.dailyBurnRate}
            </Text>
            <Text style={styles.statLbl}>Daily Burn Rate</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statVal}>{forecast.daysPassed}d</Text>
            <Text style={styles.statLbl}>Days Elapsed</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statVal}>{forecast.daysRemaining}d</Text>
            <Text style={styles.statLbl}>Days Left</Text>
          </View>
        </View>
      </View>

      {/* 🏆 GAMIFICATION: BADGES & HABIT STREAKS */}
      <View style={styles.sectionCard}>
        <View style={styles.badgeHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>🏆 Financial Badges & Habits</Text>
            <Text style={styles.sectionSub}>Unlock achievements by maintaining habits</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakBadgeText}>🔥 {settings.streakDays}d Streak</Text>
          </View>
        </View>

        <View style={styles.badgesGrid}>
          {badges.map(badge => {
            const isUnlocked = Boolean(badge.unlockedAt);
            return (
              <View
                key={badge.id}
                style={[
                  styles.badgeItem,
                  !isUnlocked && styles.badgeItemLocked,
                ]}
              >
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                <Text
                  style={[
                    styles.badgeName,
                    !isUnlocked && styles.badgeNameLocked,
                  ]}
                >
                  {badge.title}
                </Text>
                <Text style={styles.badgeDesc}>{badge.description}</Text>
                <View
                  style={[
                    styles.badgeStatusPill,
                    isUnlocked ? styles.badgeUnlockedPill : styles.badgeLockedPill,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeStatusText,
                      isUnlocked ? styles.badgeUnlockedText : styles.badgeLockedText,
                    ]}
                  >
                    {isUnlocked ? '✓ Unlocked' : '🔒 In Progress'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* 🍩 CATEGORY SPENDING BREAKDOWN */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🍩 Spending Breakdown</Text>
        <Text style={styles.sectionSub}>Where your money went this month</Text>

        {Object.keys(categoryTotals).length === 0 ? (
          <Text style={styles.emptyText}>No spending data to categorize yet.</Text>
        ) : (
          Object.entries(categoryTotals).map(([cat, amt]) => {
            const pct = Math.round((amt / totalSpent) * 100);
            return (
              <View key={cat} style={styles.catRow}>
                <View style={styles.catLabelRow}>
                  <Text style={styles.catName}>{cat}</Text>
                  <Text style={styles.catAmount}>
                    {settings.currencySymbol}{amt.toLocaleString()} ({pct}%)
                  </Text>
                </View>
                <View style={styles.catProgressBg}>
                  <View style={[styles.catProgressFill, { width: `${pct}%` }]} />
                </View>
              </View>
            );
          })
        )}
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
  forecastCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  forecastHeader: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  forecastMainAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  forecastSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  budgetGoalCol: {
    alignItems: 'flex-end',
  },
  budgetGoalLabel: {
    color: '#94A3B8',
    fontSize: 11,
  },
  budgetGoalAmount: {
    color: '#60A5FA',
    fontSize: 18,
    fontWeight: '700',
  },
  velocityBanner: {
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  velocityTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  velocityDesc: {
    fontSize: 11,
    color: '#334155',
    marginTop: 2,
    lineHeight: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  statVal: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  statLbl: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  streakBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  streakBadgeText: {
    color: '#B45309',
    fontWeight: '700',
    fontSize: 12,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  badgeItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  badgeItemLocked: {
    opacity: 0.6,
    backgroundColor: '#F1F5F9',
  },
  badgeIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  badgeName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: '#64748B',
  },
  badgeDesc: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 13,
  },
  badgeStatusPill: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeUnlockedPill: {
    backgroundColor: '#DCFCE7',
  },
  badgeLockedPill: {
    backgroundColor: '#E2E8F0',
  },
  badgeStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeUnlockedText: {
    color: '#166534',
  },
  badgeLockedText: {
    color: '#64748B',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 14,
  },
  catRow: {
    marginTop: 12,
  },
  catLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  catName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  catAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  catProgressBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  catProgressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
});
