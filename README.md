# 🚀 SmartBudget - Behavioral & AI-Powered Expense Tracker

> A next-generation React Native & Expo mobile application designed to solve budgeting fatigue using **behavioral psychology**, **AI natural language parsing**, and **predictive financial analytics**.

![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-~54.0-000020?logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-~5.9-3178C6?logo=typescript&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI_NLP-8E75C4?logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 Why SmartBudget is Different

Most expense trackers act like tedious accounting spreadsheets that require micromanaging categories and offer little psychological motivation. 

**SmartBudget** bridges the gap between numbers and human behavior with 6 unique pillars:

### 1. 🧠 Dynamic "Guilt-Free" Daily Allowance
- Instead of overwhelming you with a static monthly number (e.g. ₹10,000), it calculates a **Daily Safe-to-Spend Limit**:
  $$\text{Daily Safe-to-Spend} = \frac{\text{Remaining Pocket Money / Budget}}{\text{Days Remaining in Month}}$$
- **Real-Time Recalibration**: Splurge today on an outing? The app gently adjusts tomorrow's limit to keep you on track without running out of money before month-end.

### 2. 🤖 AI Natural Language Smart Logging
- Type or speak naturally: *"Spent ₹450 on Zomato pizza yesterday"* or *"Uber cab 320"*.
- Powered by **Google Gemini 1.5 Flash** with an instant offline NLP fallback.
- Extracts `amount`, `title`, `category`, and `date` in milliseconds.

### 3. ⏳ "Impulse Buy" Cool-Down Wishlist
- Prevents dopamine-driven impulse spending by locking non-essential wants behind a **24h, 48h, or 72h reflection timer**.
- When the timer unlocks, ask yourself: *"Do I still really need this?"*
- **🛡️ Impulse Defense Savings Trophy**: Tracks the total money saved every time you walk away!

### 4. 💔 Emotional ROI (Post-Purchase Regret Check-In)
- Tracks *how you feel* about your spending, not just *what* you bought.
- 1-tap reaction on recent purchases: **😍 Worth it**, **😐 Okay**, or **😩 Regret**.
- Visualizes your monthly **Emotional ROI Dashboard** (Joy vs Regret ratio).

### 5. ⚰️ Subscription Graveyard & Shock Calculator
- Visualizes the true **Annual Drain** of recurring subscriptions (Netflix, Spotify, Gym, Cloud, Wifi).
- 1-tap pause/archive toggle to cancel and eliminate ghost expenses.

### 6. 📊 Predictive Burn-Rate Forecast & Gamification
- **Month-End Spend Prediction**: Forecasts your final spending at the end of the month based on your daily burn velocity.
- **Duolingo-Style Gamification**: Daily habit streaks (🔥) and unlockable achievement badges (*Habit Builder*, *Consistency King*, *Impulse Conqueror*, *Subscription Slayer*).

### 🎓 College Student Mode
- Defaulted for students: tracks **Monthly Pocket Money** and calculates percentage impact (e.g., *"This meal takes 8% of your monthly pocket money"*).

---

## 📱 App Screenshots & Navigation Structure

SmartBudget features a modern 5-tab navigation bar:

1. 🏠 **Home**: Daily Pocket Money Safe-to-Spend gauge, streak counter, and recent activity with 1-tap emotional reviews.
2. 🤖 **Smart Log**: Natural language quick-entry, category selection, and 10-year compounding opportunity cost previews.
3. 🧠 **Mindset**: Impulse reflection timers, unlocked review actions, and emotional ROI analytics.
4. ⚰️ **Subscriptions**: Recurring subscription manager, active toggles, and annualized cost shock banner.
5. 📊 **Analytics**: Month-end predictive burn-rate forecast, spending velocity status, and achievement badges.

---

## 🛠️ Tech Stack

- **Framework**: React Native 0.81 (Expo SDK 54)
- **Language**: TypeScript (Strict Mode)
- **Navigation**: React Navigation (Bottom Tabs & Native Stack)
- **State & Storage**: React Context API + `@react-native-async-storage/async-storage` (Offline-First)
- **AI & NLP**: Google Gemini 1.5 Flash API + Local Heuristic Entity Extractor

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Expo Go](https://expo.dev/go) app installed on iOS or Android

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TANVII05/personalized-budget-tracker.git
   cd personalized-budget-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start -c
   ```

4. **Open on your device**:
   - **iOS**: Open Camera and scan the terminal QR code.
   - **Android**: Open the *Expo Go* app and tap "Scan QR code".
   - **Web**: Press `w` in the terminal to view in browser.

---

## 🗂️ Project Structure

```
personalized-budget-tracker/
├── App.tsx                     # Main App entry point & Context provider
├── src/
│   ├── context/
│   │   └── ExpenseContext.tsx  # Centralized budget state, calculations & persistence
│   ├── navigation/
│   │   └── AppTabs.tsx         # 5-Tab modern bottom navigator
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Daily Safe-to-Spend & Emotional Check-ins
│   │   ├── AddExpenseScreen.tsx    # AI NLP Entry & Opportunity Cost Preview
│   │   ├── MindsetScreen.tsx       # Impulse Cool-Down & Emotional ROI Dashboard
│   │   ├── SubscriptionScreen.tsx  # Subscription Graveyard & Shock Calculator
│   │   └── AnalyticsScreen.tsx     # Predictive Forecast & Habit Badges
│   ├── services/
│   │   └── aiParser.ts         # Gemini AI + Offline NLP entity extractor
│   ├── types/
│   │   └── Expense.ts          # TypeScript data models
│   └── utils/
│       └── autoCategorize.ts   # Category mapping utilities
└── package.json
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).