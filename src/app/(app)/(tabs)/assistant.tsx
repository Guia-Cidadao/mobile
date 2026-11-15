import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { getErrorMessage } from '@/services/api/apiError';
import { chatbotService } from '@/services/chatbotService';
import { colors, fonts, MIN_TOUCH_SIZE, radius, shadows, spacing } from '@/theme';
import type { ChatMessage } from '@/types/chatbot';

const QUICK_SUGGESTIONS = [
  'Quais documentos preciso para emitir o RG?',
  'Como solicitar segunda via de documentos?',
  'Quais serviços exigem comprovante de residência?',
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  author: 'assistant',
  text: 'Olá! Sou o Assistente Cidadão. Pergunte sobre qualquer serviço público ou documento necessário e eu consultarei a base oficial para você.',
};

export default function AssistantScreen() {
  const router = useRouter();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const nextMessageIdRef = useRef(1);

  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [question, setQuestion] = useState('');
  const [isSending, setIsSending] = useState(false);

  async function handleSendQuestion(customQuestion?: string) {
    const trimmed = (customQuestion ?? question).trim();
    if (!trimmed || isSending) {
      return;
    }

    const userMessageId = `user-${nextMessageIdRef.current++}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      author: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customQuestion) {
      setQuestion('');
    }
    setIsSending(true);

    try {
      const response = await chatbotService.ask(trimmed);
      const assistantMessage: ChatMessage = {
        id: `assistant-${nextMessageIdRef.current++}`,
        author: 'assistant',
        text: response.resposta,
        sources: response.fontes ?? undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = getErrorMessage(error, {
        500: 'O serviço de inteligência artificial não está disponível no momento. Você ainda pode consultar todos os serviços na aba Serviços.',
        503: 'O assistente virtual está temporariamente indisponível. Tente novamente em instantes.',
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${nextMessageIdRef.current++}`,
          author: 'assistant',
          text: errorMessage,
          isError: true,
        },
      ]);
    } finally {
      setIsSending(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListHeaderComponent={
          messages.length === 1 ? (
            <View style={styles.suggestionsBox}>
              <AppText variant="label" color="textSecondary">
                Sugestões rápidas:
              </AppText>
              <View style={styles.suggestionChips}>
                {QUICK_SUGGESTIONS.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => void handleSendQuestion(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`Perguntar: ${item}`}
                    style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
                  >
                    <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
                    <AppText variant="caption" color="primary" style={styles.chipText}>
                      {item}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : undefined
        }
        renderItem={({ item }) => {
          const isUser = item.author === 'user';
          return (
            <View
              style={[
                styles.messageRow,
                isUser ? styles.messageRowUser : styles.messageRowAssistant,
              ]}
            >
              {!isUser && (
                <View style={[styles.avatar, item.isError && styles.avatarError]}>
                  <Ionicons
                    name={item.isError ? 'alert-circle-outline' : 'chatbubble-ellipses-outline'}
                    size={18}
                    color={item.isError ? colors.danger : colors.primary}
                  />
                </View>
              )}

              <View
                style={[
                  styles.bubble,
                  isUser ? styles.bubbleUser : styles.bubbleAssistant,
                  item.isError && styles.bubbleError,
                ]}
              >
                <AppText
                  variant="body"
                  color={isUser ? 'textOnPrimary' : item.isError ? 'danger' : 'textPrimary'}
                >
                  {item.text}
                </AppText>

                {item.sources && item.sources.length > 0 && (
                  <View style={styles.sourcesSection}>
                    <AppText variant="caption" color="textSecondary">
                      Serviços relacionados:
                    </AppText>
                    <View style={styles.sourcesList}>
                      {item.sources.map((source) => (
                        <Pressable
                          key={`${source.servico_id}-${source.servico}`}
                          onPress={() =>
                            router.push({
                              pathname: '/(app)/services/[id]',
                              params: { id: String(source.servico_id) },
                            })
                          }
                          accessibilityRole="link"
                          accessibilityLabel={`Abrir serviço ${source.servico}`}
                          style={styles.sourceChip}
                        >
                          <Ionicons
                            name="document-text-outline"
                            size={14}
                            color={colors.secondary}
                          />
                          <AppText variant="caption" color="secondary">
                            {source.servico}
                          </AppText>
                          <Ionicons name="open-outline" size={13} color={colors.secondary} />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          isSending ? (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color={colors.primary} />
              <AppText variant="caption" color="textSecondary">
                Consultando base de serviços públicos...
              </AppText>
            </View>
          ) : undefined
        }
      />

      <View style={styles.inputBar}>
        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder="Digite sua dúvida sobre um serviço público..."
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Mensagem para o assistente virtual"
          multiline
          maxLength={500}
          editable={!isSending}
          style={styles.textInput}
        />
        <Pressable
          onPress={() => void handleSendQuestion()}
          disabled={!question.trim() || isSending}
          accessibilityRole="button"
          accessibilityLabel="Enviar pergunta"
          style={({ pressed }) => [
            styles.sendButton,
            (!question.trim() || isSending) && styles.sendButtonDisabled,
            pressed && styles.sendButtonPressed,
          ]}
        >
          <Ionicons name="send" size={20} color={colors.textOnPrimary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesList: {
    flexGrow: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  suggestionsBox: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  suggestionChips: {
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    ...shadows.card,
  },
  chipPressed: {
    backgroundColor: colors.primaryLight,
  },
  chipText: {
    flex: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarError: {
    backgroundColor: colors.dangerLight,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
    ...shadows.card,
  },
  bubbleError: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
  },
  sourcesSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    gap: spacing.xs,
  },
  sourcesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  sourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs + 2,
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    borderRadius: radius.pill,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  textInput: {
    flex: 1,
    minHeight: MIN_TOUCH_SIZE,
    maxHeight: 110,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  sendButton: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
});
