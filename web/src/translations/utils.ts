import type { IntlShape, MessageDescriptor } from 'react-intl';

export function formatMessage<Message extends string | MessageDescriptor | undefined>(
  intl: IntlShape,
  message: Message,
): Message extends undefined ? null : string {
  type Return = Message extends undefined ? null : string;
  if (message == null) return null as Return;

  return (typeof message === 'string' ? message : intl.formatMessage(message)) as Return;
}
