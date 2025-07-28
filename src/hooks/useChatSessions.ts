"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatSession } from "@/types/chatsession";

export function useChatSessions() {
  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery<ChatSession[]>({
    queryKey: ['chatSessions'],
    queryFn: async () => {
      const res = await fetch('/api/chat-sessions');
      return res.json();
    },
    enabled: false
  });

  const { mutateAsync: createSession } = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/chat-sessions', { method: 'POST' });
      return res.json();
    },
    onSuccess: (newSession) => {
      queryClient.setQueryData<ChatSession[]>(['chatSessions'], (old = []) => [
        ...old,
        newSession
      ]);
    }
  });

  return { sessions, createSession };
}