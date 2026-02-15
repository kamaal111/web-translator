import { Box, Text, Heading, Card, Badge, Flex, Button } from '@radix-ui/themes';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { FormattedMessage, useIntl, FormattedDate } from 'react-intl';
import { useState, useMemo } from 'react';
import { diffWords } from 'diff';

import type { LocaleVersionHistory, DraftInfo, VersionHistoryItem } from '@/generated/api-client/src';
import useStringVersions from '@/projects/hooks/use-string-versions';
import DraftEditor from '@/projects/components/draft-editor/draft-editor';
import VersionHistorySkeleton from './version-history-skeleton';
import messages from './messages';

import './string-version-history.css';

interface StringVersionHistoryProps {
  projectId: string;
  stringKey: string;
}

function StringVersionHistory({ projectId, stringKey }: StringVersionHistoryProps) {
  const { versionHistory, isLoading, isError } = useStringVersions({
    projectId,
    stringKey,
  });

  if (isLoading) {
    return <VersionHistorySkeleton />;
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
              <LocaleSection
                key={localeHistory.locale}
                localeHistory={localeHistory}
                projectId={projectId}
                stringKey={stringKey}
              />
            ))}
          </Accordion.Root>
        </Flex>
      )}
    </Card>
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

function LocaleSection({
  localeHistory,
  projectId,
  stringKey,
}: {
  localeHistory: LocaleVersionHistory;
  projectId: string;
  stringKey: string;
}) {
  const intl = useIntl();
  const { locale, draft, versions } = localeHistory;
  const [isComparing, setIsComparing] = useState(false);

  const latestVersion = versions.length > 0 ? versions[0] : null;
  const canCompare = Boolean(draft) && Boolean(latestVersion);

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
          {canCompare && !isComparing && (
            <Flex justify="end">
              <Button
                size="1"
                variant="soft"
                onClick={() => setIsComparing(true)}
                aria-label={intl.formatMessage(messages.compareVersions)}
              >
                <FormattedMessage {...messages.compare} />
              </Button>
            </Flex>
          )}
          {isComparing && draft && latestVersion && (
            <InlineDiffComparison
              draftValue={draft.value}
              publishedValue={latestVersion.value}
              publishedVersion={latestVersion.version}
              onClose={() => setIsComparing(false)}
            />
          )}
          <DraftSection draft={draft} projectId={projectId} stringKey={stringKey} locale={locale} />
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

interface DiffSegment {
  type: 'unchanged' | 'addition' | 'deletion';
  value: string;
}

function computeDiff(oldValue: string, newValue: string): DiffSegment[] {
  return diffWords(oldValue, newValue).map(part => {
    if (part.added) return { type: 'addition' as const, value: part.value };
    if (part.removed) return { type: 'deletion' as const, value: part.value };
    return { type: 'unchanged' as const, value: part.value };
  });
}

function InlineDiffComparison({
  draftValue,
  publishedValue,
  publishedVersion,
  onClose,
}: {
  draftValue: string;
  publishedValue: string;
  publishedVersion: number;
  onClose: () => void;
}) {
  const intl = useIntl();
  const diff = useMemo(() => computeDiff(publishedValue, draftValue), [publishedValue, draftValue]);

  return (
    <Card>
      <Flex justify="between" align="center" mb="3">
        <Heading as="h4" size="3">
          <FormattedMessage {...messages.diffLabel} />
        </Heading>
        <Button size="1" variant="ghost" onClick={onClose} aria-label={intl.formatMessage(messages.closeComparison)}>
          <FormattedMessage {...messages.close} />
        </Button>
      </Flex>

      <Text size="1" color="gray" as="p" mb="2">
        <FormattedMessage {...messages.versionLabel} values={{ version: publishedVersion }} /> →{' '}
        <FormattedMessage {...messages.draftLabel} />
      </Text>

      <Box className="version-comparison-diff">
        {diff.map((segment, index) => (
          <span key={`${segment.type}-${index}`} className={`version-comparison-segment ${segment.type}`}>
            {segment.value}
          </span>
        ))}
      </Box>
    </Card>
  );
}

function DraftSection({
  draft,
  projectId,
  stringKey,
  locale,
}: {
  draft: DraftInfo | null;
  projectId: string;
  stringKey: string;
  locale: string;
}) {
  const intl = useIntl();
  const [isEditing, setIsEditing] = useState(false);

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

  if (isEditing) {
    return (
      <Box className="string-version-history-version string-version-history-draft">
        <Flex justify="between" align="center" mb="2">
          <Badge color="amber">
            <FormattedMessage {...messages.draftLabel} />
          </Badge>
        </Flex>
        <DraftEditor
          projectId={projectId}
          stringKey={stringKey}
          locale={locale}
          initialValue={draft.value}
          updatedAt={draft.updatedAt.toISOString()}
          onSave={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </Box>
    );
  }

  return (
    <Box className="string-version-history-version string-version-history-draft">
      <Flex justify="between" align="center" mb="2">
        <Badge color="amber">
          <FormattedMessage {...messages.draftLabel} />
        </Badge>
        <Flex gap="2" align="center">
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
          <Button
            size="1"
            variant="soft"
            onClick={() => setIsEditing(true)}
            aria-label={intl.formatMessage(messages.editDraft)}
          >
            <FormattedMessage {...messages.edit} />
          </Button>
        </Flex>
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

export default StringVersionHistory;
