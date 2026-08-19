import { useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarClock, Send, Sparkles, StickyNote, Wallet, X } from 'lucide-react-native';
import type { ChatMessage } from '@elara/validation';
import { useTheme } from '@/theme/useTheme';
import { AnimatedPressable, IconButton } from '@/components';
import { aiApi } from '@/features/ai/api';
import { useToastStore } from '@/stores/toast-store';
import { ApiError } from '@/lib/api-client';
import type { IconType } from '@/components/icon-type';

const SUGGESTIONS: { icon: IconType; prompt: string }[] = [
  { icon: CalendarClock, prompt: "What's on my plate today?" },
  { icon: StickyNote, prompt: 'Summarize my pinned notes' },
  { icon: Wallet, prompt: 'Do I have anything due soon?' },
  { icon: Sparkles, prompt: 'Any upcoming tasks I should prioritize?' },
];

export default function AiScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.show);
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setSending(true);
    try {
      const { reply } = await aiApi.chat({ messages: nextMessages });
      setMessages((current) => [...current, { role: 'assistant', content: reply }]);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Couldn't reach the assistant", 'danger');
      setMessages(messages);
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: insets.top + spacing.xs,
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Sparkles size={20} color={colors.primary} strokeWidth={1.75} />
          <Text style={[typography.cardTitle, { color: colors.text }]}>AI Assistant</Text>
        </View>
        <IconButton icon={X} accessibilityLabel="Close" onPress={() => router.back()} />
      </View>

      {messages.length === 0 ? (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: spacing.xl,
            gap: spacing.lg,
          }}
        >
          <View style={{ alignItems: 'center', gap: spacing.xs }}>
            <Text style={[typography.sectionTitle, { color: colors.text, textAlign: 'center' }]}>
              Ask about your day
            </Text>
            <Text
              style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}
            >
              I can see your tasks, calendar, and pinned notes.
            </Text>
          </View>
          <View style={{ gap: spacing.sm }}>
            {SUGGESTIONS.map((s) => (
              <AnimatedPressable
                key={s.prompt}
                accessibilityRole="button"
                onPress={() => send(s.prompt)}
                scaleTo={0.97}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  backgroundColor: colors.surface,
                  borderRadius: radius.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing.sm + 2,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: radius.button,
                    backgroundColor: `${colors.primary}1A`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <s.icon size={16} color={colors.primary} strokeWidth={1.75} />
                </View>
                <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]}>
                  {s.prompt}
                </Text>
              </AnimatedPressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((m, i) => (
            <View
              key={i}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                backgroundColor: m.role === 'user' ? colors.primary : colors.backgroundSecondary,
                borderRadius: radius.button,
                borderBottomRightRadius: m.role === 'user' ? 4 : radius.button,
                borderBottomLeftRadius: m.role === 'assistant' ? 4 : radius.button,
                padding: spacing.sm,
              }}
            >
              <Text
                style={[
                  typography.bodySmall,
                  { color: m.role === 'user' ? colors.onPrimary : colors.text },
                ]}
              >
                {m.content}
              </Text>
            </View>
          ))}
          {sending ? (
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: colors.backgroundSecondary,
                borderRadius: radius.button,
                borderBottomLeftRadius: 4,
                padding: spacing.sm,
              }}
            >
              <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>Thinking…</Text>
            </View>
          ) : null}
        </ScrollView>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: spacing.xs,
          padding: spacing.md,
          paddingBottom: insets.bottom + spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <RNTextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask me anything…"
          placeholderTextColor={colors.textTertiary}
          multiline
          style={[
            typography.body,
            {
              flex: 1,
              maxHeight: 100,
              color: colors.text,
              backgroundColor: colors.backgroundSecondary,
              borderRadius: radius.input,
              paddingHorizontal: spacing.sm + 2,
              paddingVertical: spacing.sm,
            },
          ]}
        />
        <IconButton
          icon={Send}
          accessibilityLabel="Send"
          variant="filled"
          color={colors.primary}
          disabled={!input.trim() || sending}
          onPress={() => send(input)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
