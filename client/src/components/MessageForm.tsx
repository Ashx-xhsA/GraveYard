import { useState } from 'react';
import type { FormEvent } from 'react';
import api from '../api';
import { useModal } from '../context/ModalContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/toastContext';
import { errorText, useT } from '../i18n';
import type { MessageResponse } from '../types';

/**
 * Lets the signed-in user leave a message on a grave. Rendered inside the
 * modal, which lives outside the router, so the caller passes `onSent` to
 * refresh the page data.
 */
const MessageForm = ({ graveID, onSent }: { graveID: string; onSent: () => void }) => {
  const t = useT();
  const modalHeaderColor = useTheme()?.style?.modalHeaderColor ?? '#8a63a6';
  const { closeModal } = useModal();
  const toast = useToast();

  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = content.trim() !== '' && !submitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setSubmitting(true);
    try {
      await api.post<MessageResponse>(`/grave/${graveID}/messages`, { content });
      onSent();
      toast.success(t.message.success);
      closeModal();
    } catch (err) {
      setError(errorText(t, err));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 min-w-[280px]">
      <h2 className="text-2xl font-bold text-center mb-2" style={{ color: modalHeaderColor }}>
        {t.message.title}
      </h2>

      <textarea
        aria-label={t.message.title}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t.message.placeholder}
        rows={4}
        className="p-1.5 outline-none resize-y"
      />

      {error && <p className="text-red-600 text-xs text-center -mt-2">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="header-icon-button inline-block self-center px-2 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {submitting ? t.message.submitting : t.message.submit}
      </button>
    </form>
  );
};

export default MessageForm;
