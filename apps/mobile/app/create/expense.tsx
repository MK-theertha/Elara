import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import {
  expenseCategoryEnum,
  paymentMethodEnum,
  type ExpenseCategory,
  type PaymentMethod,
} from '@elara/validation';
import { useTheme } from '@/theme/useTheme';
import { Button, Chip, TextInput } from '@/components';
import { useToastStore } from '@/stores/toast-store';

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  FOOD: 'Food & Dining',
  TRANSPORT: 'Transport',
  SHOPPING: 'Shopping',
  BILLS: 'Bills & Utilities',
  ENTERTAINMENT: 'Entertainment',
  HEALTH: 'Health',
  TRAVEL: 'Travel',
  OTHER: 'Other',
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  CARD: 'Card',
  BANK_TRANSFER: 'Bank transfer',
  OTHER: 'Other',
};

export default function CreateExpenseScreen() {
  const { colors, spacing, typography } = useTheme();
  const showToast = useToastStore((s) => s.show);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('FOOD');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');

  const handleSubmit = () => {
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) return;
    showToast('Expense added', 'success');
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'New Expense' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          autoFocus
        />
        <TextInput
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
        />

        <View style={{ gap: spacing.xxs }}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Category</Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' }}>
            {expenseCategoryEnum.options.map((c) => (
              <Chip
                key={c}
                label={CATEGORY_LABELS[c]}
                selected={category === c}
                onPress={() => setCategory(c)}
              />
            ))}
          </View>
        </View>

        <View style={{ gap: spacing.xxs }}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Payment method</Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' }}>
            {paymentMethodEnum.options.map((m) => (
              <Chip
                key={m}
                label={PAYMENT_LABELS[m]}
                selected={paymentMethod === m}
                onPress={() => setPaymentMethod(m)}
              />
            ))}
          </View>
        </View>

        <Button label="Add Expense" onPress={handleSubmit} fullWidth />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
