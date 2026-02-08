import { Box, Text, Heading, Card, Flex, Badge, Button } from '@radix-ui/themes';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { useState } from 'react';

import type { StringResponse } from '@/generated/api-client/src';
import useStrings from '@/projects/hooks/use-strings';
import StringVersionHistory from '@/projects/components/string-version-history/string-version-history';
import messages from './messages';

import './strings-list.css';

interface StringsListProps {
  projectId: string;
}

function StringsListItem({ item, projectId }: { item: StringResponse; projectId: string }) {
  const intl = useIntl();
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  return (
    <Accordion.Item value={item.key} className="strings-list-accordion-item">
      <Accordion.Header>
        <Accordion.Trigger
          className="strings-list-accordion-trigger"
          aria-label={intl.formatMessage(messages.expandString, { key: item.key })}
        >
          <Flex justify="between" align="center" width="100%">
            <Flex gap="2" align="center">
              <Text weight="medium" size="3">
                <code>{item.key}</code>
              </Text>
              {item.context ? (
                <Badge variant="soft" color="gray" size="1">
                  {item.context}
                </Badge>
              ) : null}
            </Flex>
            <ChevronDownIcon className="strings-list-chevron" aria-hidden />
          </Flex>
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="strings-list-accordion-content">
        <Box pt="3">
          <Flex direction="column" gap="2" mb="4">
            {Object.entries(item.translations).length === 0 ? (
              <Text size="2" color="gray">
                <FormattedMessage {...messages.noTranslations} />
              </Text>
            ) : (
              Object.entries(item.translations).map(([locale, value]) => (
                <Box key={locale} className="string-translation-item">
                  <Flex justify="between" align="start" gap="2">
                    <Text weight="bold" size="2" style={{ minWidth: '60px' }}>
                      {locale}:
                    </Text>
                    <Text size="2" style={{ flex: 1 }}>
                      {value}
                    </Text>
                  </Flex>
                </Box>
              ))
            )}
          </Flex>

          {!showVersionHistory ? (
            <Button
              size="1"
              variant="soft"
              onClick={() => setShowVersionHistory(true)}
              aria-label={intl.formatMessage(messages.showVersionHistory)}
            >
              <FormattedMessage {...messages.showVersionHistory} />
            </Button>
          ) : (
            <Box mt="3">
              <StringVersionHistory projectId={projectId} stringKey={item.key} />
            </Box>
          )}
        </Box>
      </Accordion.Content>
    </Accordion.Item>
  );
}

function StringsList({ projectId }: StringsListProps) {
  const { strings, isLoading, isError } = useStrings(projectId);

  if (isLoading) {
    return (
      <Box className="strings-list">
        <Text>
          <FormattedMessage {...messages.loading} />
        </Text>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className="strings-list">
        <Text color="red">
          <FormattedMessage {...messages.errorLoading} />
        </Text>
      </Box>
    );
  }

  return (
    <Card className="strings-list">
      <Heading as="h2" size="5" mb="4">
        <FormattedMessage {...messages.title} />
      </Heading>

      {strings.length === 0 ? (
        <Text color="gray">
          <FormattedMessage {...messages.noStrings} />
        </Text>
      ) : (
        <Accordion.Root type="multiple">
          <Flex direction="column" gap="2">
            {strings.map(item => (
              <StringsListItem key={item.id} item={item} projectId={projectId} />
            ))}
          </Flex>
        </Accordion.Root>
      )}
    </Card>
  );
}

export default StringsList;
