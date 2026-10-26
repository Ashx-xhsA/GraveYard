/**
 * English UI strings. Every other locale must provide the same shape
 * (`Messages`), so a missing translation fails the type check.
 *
 * Sentences containing numbers or names are functions, because word order
 * and plural rules differ between languages.
 */
export const en = {
  grave: {
    thingsRestHere: (n: number) => (n === 1 ? '1 thing rests here' : `${n} things rest here`),
    nothingYet: 'Nothing rests here yet.',
    messageCount: (n: number) => (n === 1 ? '1 message' : `${n} messages`),
    offered: (user: string, quantity: number, item: string) => `${user} left ${quantity} × ${item} here.`,
    said: (user: string, content: string) => `${user} said: "${content}"`,
    deletedUser: '[deleted user]',
    invalidDate: 'Invalid Date',
    loginToInteract: 'Log in to leave something here',
  },
  pagination: {
    previous: '< previous',
    next: 'next >',
  },
  offer: {
    button: 'Offer',
    title: 'Leave something here',
    item: 'What',
    quantity: 'How many',
    entry: (item: string, count: number) => `${item} (×${count})`,
    submit: 'Offer',
    submitting: 'Offering…',
    emptyBag: 'Your bag is empty.',
    success: (quantity: number, item: string) => `Offered ${quantity} × ${item}.`,
  },
  message: {
    button: 'Leave a message',
    title: 'Leave a message',
    placeholder: 'Write something…',
    submit: 'Send',
    submitting: 'Sending…',
    success: 'Your message has been left.',
  },
  photo: {
    label: 'Photo',
    choose: 'Choose a photo',
    remove: 'Remove',
    hint: 'JPEG, PNG or WebP, up to 10 MB',
    uploading: (percent: number) => `Uploading ${percent}%`,
    creating: 'Creating…',
    uploadFailed: 'The photo could not be uploaded. Please try again.',
  },
  common: {
    cancel: 'Cancel',
    dismiss: 'Dismiss',
  },
  /** Display names for flower keys stored in the database. */
  flowers: {
    orchid: 'Orchid',
  } as Record<string, string>,
  /** Keyed by the `code` field of API error responses. */
  errors: {
    INVALID_OFFERING: 'That offering is not valid.',
    INSUFFICIENT_QUANTITY: 'You do not have that many.',
    GRAVE_NOT_FOUND: 'This grave no longer exists.',
    EMPTY_MESSAGE: 'The message cannot be empty.',
    UNSUPPORTED_FILE_TYPE: 'Please choose a JPEG, PNG or WebP image.',
    FILE_TOO_LARGE: 'The photo must be 10 MB or smaller.',
    INVALID_UPLOAD: 'That file cannot be uploaded.',
    UPLOAD_NOT_FOUND: 'The upload expired. Please choose the photo again.',
    UPLOAD_FORBIDDEN: 'That upload cannot be used.',
    INVALID_IMAGE: 'That file is not a valid image.',
    generic: 'Something went wrong. Please try again.',
  } as Record<string, string> & { generic: string },
};

export type Messages = typeof en;
