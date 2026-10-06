import { useState } from 'react';
import type { FormEvent } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/toastContext';
import { errorText, itemLabel, useT } from '../i18n';
import type { InventoryEntry, OfferingRequest, OfferingResponse } from '../types';

const entryKey = (entry: InventoryEntry) => `${entry.kind}:${entry.name}`;

/**
 * Lets the signed-in user offer something from their inventory to a grave.
 * Rendered inside the modal, which lives outside the router, so the caller
 * passes `onOffered` to refresh the page data.
 */
const OfferForm = ({ graveID, onOffered }: { graveID: string; onOffered: () => void }) => {
  const t = useT();
  const modalHeaderColor = useTheme()?.style?.modalHeaderColor ?? '#8a63a6';
  const { user, setInventory } = useAuth();
  const { closeModal } = useModal();
  const toast = useToast();

  // Unnamed items must be named in the inventory before they can be offered.
  const offerable = (user?.inventory ?? []).filter((entry) => entry.count > 0 && entry.name !== '');

  const [selectedKey, setSelectedKey] = useState(() => (offerable[0] ? entryKey(offerable[0]) : ''));
  const [quantity, setQuantity] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selected = offerable.find((entry) => entryKey(entry) === selectedKey);
  const amount = Number(quantity);
  const canSubmit =
    !!selected && Number.isInteger(amount) && amount >= 1 && amount <= selected.count && !submitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected || !canSubmit) return;
    setError('');
    setSubmitting(true);
    try {
      const body: OfferingRequest = { kind: selected.kind, itemName: selected.name, quantity: amount };
      const res = await api.post<OfferingResponse>(`/grave/${graveID}/offerings`, body);
      setInventory(res.data.inventory);
      onOffered();
      toast.success(t.offer.success(amount, itemLabel(t, selected.name)));
      closeModal();
    } catch (err) {
      setError(errorText(t, err));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 min-w-[280px]">
      <h2 className="text-2xl font-bold text-center mb-2" style={{ color: modalHeaderColor }}>
        {t.offer.title}
      </h2>

      {offerable.length === 0 ? (
        <p className="text-center text-gray-700">{t.offer.emptyBag}</p>
      ) : (
        <>
          <div className="flex items-center gap-3" style={{ color: modalHeaderColor }}>
            <label className="w-20 font-medium text-right" htmlFor="offer-item">{t.offer.item}</label>
            <select
              id="offer-item"
              value={selectedKey}
              onChange={(e) => {
                setSelectedKey(e.target.value);
                setQuantity('1');
              }}
              className="flex-1 p-1.5 outline-none"
            >
              {offerable.map((entry) => (
                <option key={entryKey(entry)} value={entryKey(entry)}>
                  {t.offer.entry(itemLabel(t, entry.name), entry.count)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3" style={{ color: modalHeaderColor }}>
            <label className="w-20 font-medium text-right" htmlFor="offer-quantity">{t.offer.quantity}</label>
            <input
              id="offer-quantity"
              type="number"
              inputMode="numeric"
              min={1}
              max={selected?.count}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="flex-1 p-1.5 outline-none"
            />
          </div>

          {error && <p className="text-red-600 text-xs text-center -mt-2">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="header-icon-button inline-block self-center px-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? t.offer.submitting : t.offer.submit}
          </button>
        </>
      )}
    </form>
  );
};

export default OfferForm;
