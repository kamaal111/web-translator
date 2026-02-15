import { Box, Card, Flex, Skeleton } from '@radix-ui/themes';

function VersionHistorySkeleton() {
  return (
    <Card className="string-version-history">
      <Skeleton height="32px" width="300px" mb="4" />

      <Flex direction="column" gap="2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Box key={i} className="string-version-history-accordion-item">
            <Flex justify="between" align="center" p="3">
              <Skeleton height="24px" width="100px" />
              <Skeleton height="20px" width="60px" />
            </Flex>
          </Box>
        ))}
      </Flex>
    </Card>
  );
}

export default VersionHistorySkeleton;
