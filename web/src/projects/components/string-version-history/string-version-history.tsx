import { Box, Text, Heading, Card, Badge, Flex } from '@radix-ui/themes';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { FormattedMessage, useIntl, FormattedDate } from 'react-intl';

import type { LocaleVersionHistory, DraftInfo, VersionHistoryItem } from '@/generated/api-client/src';
import useStringVersions from '@/projects/hooks/use-string-versions';
import messages from './messages';

import './string-version-history.css';

interface StringVersionHistoryProps {
  projectId: string;
  stringKey: string;
}

function DraftSection({ draft }: { draft: DraftInfo | null }) {
  const intl = useIntl();

  if (!draft) {
    return (
      <Box className="string-version-history-version string-version-history-draft">
        <Flex justify="between" align="center" mb="2">
          <Badge color="amber">
            <FormattedMessage {...messages.draftLabel} />
          </Badge>
        </Flex>
        <Text size="2" color="gray" as="p">
          <FormattedMessage {...messages.noDraft} />
        </Text>
      </Box>
    );
  }

  return (
    <Box className="string-version-history-version string-version-history-draft">
      <Flex justify="between" align="center" mb="2">
        <Badge color="amber">
          <FormattedMessage {...messages.draftLabel} />
        </Badge>
        <Text size="1" color="gray">
          <FormattedMessage
            {...messages.updatedAt}
            values={{
              date: (
                <FormattedDate
                  value={draft.updatedAt}
                  year="numeric"
                  month="short"
                  day="numeric"
                  hour="2-digit"
                  minute="2-digit"
                />
              ),
            }}
          />
          {draft.updatedBy.name && (
            <>
              {' '}
              <FormattedMessage {...messages.by} values={{ name: draft.updatedBy.name }} />
            </>
          )}
        </Text>
      </Flex>
      <Text
        size="2"
        as="p"
        className="string-version-history-value"
        aria-label={intl.formatMessage(messages.draftLabel)}
      >
        {draft.value}
      </Text>
    </Box>
  );
}

function VersionItem({ item }: { item: VersionHistoryItem }) {
  const intl = useIntl();

  return (
    <Box className="string-version-history-version">
      <Flex justify="between" align="center" mb="2">
        <Flex gap="2" align="center">
          <Badge color="green">
            <FormattedMessage {...messages.versionLabel} values={{ version: item.version }} />
          </Badge>
          <Badge color="gray" variant="soft">
            <FormattedMessage {...messages.publishedLabel} />
          </Badge>
        </Flex>
        <Text size="1" color="gray">
          <FormattedMessage
            {...messages.createdAt}
            values={{
              date: (
                <FormattedDate
                  value={item.createdAt}
                  year="numeric"
                  month="short"
                  day="numeric"
                  hour="2-digit"
                  minute="2-digit"
                />
              ),
            }}
          />
          {item.createdBy.name && (
            <>
              {' '}
              <FormattedMessage {...messages.by} values={{ name: item.createdBy.name }} />
            </>
          )}
        </Text>
      </Flex>
      <Text
        size="2"
        as="p"
        className="string-version-history-value"
        aria-label={intl.formatMessage(messages.versionLabel, { version: item.version })}
      >
        {item.value}
      </Text>
    </Box>
  );
}

function LocaleSection({ localeHistory }: { localeHistory: LocaleVersionHistory }) {
  const intl = useIntl();
  const { locale, draft, versions } = localeHistory;

  return (
    <Accordion.Item value={locale} className="string-version-history-accordion-item">
      <Accordion.Header>
        <Accordion.Trigger
          className="string-version-history-accordion-trigger"
          aria-label={intl.formatMessage(messages.expandLocale, { locale })}
        >
          <Flex justify="between" align="center" width="100%">
            <Text weight="medium" size="3">
              <FormattedMessage {...messages.localeHeader} values={{ locale }} />
            </Text>
            <ChevronDownIcon className="string-version-history-chevron" aria-hidden />
          </Flex>
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="string-version-history-accordion-content">
        <Flex direction="column" gap="3" pt="3">
          <DraftSection draft={draft} />
          {versions.length > 0 ? (
            versions.map(item => <VersionItem key={item.version} item={item} />)
          ) : (
            <Text size="2" color="gray" as="p">
              <FormattedMessage {...messages.noVersionsForLocale} />
            </Text>
          )}
        </Flex>
      </Accordion.Content>
    </Accordion.Item>
  );
}

function StringVersionHistory({ projectId, stringKey }: StringVersionHistoryProps) {
  const { versionHistory, isLoading, isError } = useStringVersions({
    projectId,
    stringKey,
  });

  if (isLoading) {
    return (
      <Box className="string-version-history">
        <Text>
          <FormattedMessage {...messages.loading} />
        </Text>
      </Box>
    );
  }

  if (isError || !versionHistory) {
    return (
      <Box className="string-version-history">
        <Text color="red">
          <FormattedMessage {...messages.errorLoading} />
        </Text>
      </Box>
    );
  }

  const { locales } = versionHistory;

  return (
    <Card className="string-version-history">
      <Heading as="h3" size="4" mb="4">
        <FormattedMessage {...messages.title} />: <code>{stringKey}</code>
      </Heading>

      {locales.length === 0 ? (
        <Text color="gray">
          <FormattedMessage {...messages.noVersions} />
        </Text>
      ) : (
        <Flex direction="column" gap="2">
          <Accordion.Root type="multiple">
            {locales.map(localeHistory => (
              <LocaleSection key={localeHistory.locale} localeHistory={localeHistory} />
            ))}
          </Accordion.Root>
        </Flex>
      )}
    </Card>
  );
}

export default StringVersionHistory;
