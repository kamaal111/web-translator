import React from 'react';
import { Box, Text } from '@radix-ui/themes';
import { FormattedMessage, useIntl } from 'react-intl';
import toast from 'react-hot-toast';

import useProject from '@/projects/hooks/use-project';
import useStrings from '@/projects/hooks/use-strings';
import useBulkEditor, { transformStringsToBulkEditorRows } from '@/projects/hooks/use-bulk-editor';
import ProjectError from '@/projects/components/project-error/project-error';
import BulkEditorHeader from './bulk-editor-header';
import BulkEditorTable from './bulk-editor-table';
import messages from './messages';

interface BulkEditorPageProps {
  projectId: string;
}

export function BulkEditorPage({ projectId }: BulkEditorPageProps) {
  const intl = useIntl();
  const { project, isLoading: isProjectLoading, isError: isProjectError, is4xxError } = useProject(projectId);
  const { strings, isLoading: isStringsLoading, isError: isStringsError } = useStrings(projectId);

  const { isDirty, dirtyCount, updateCell, handleSave, isSaving, getCellValue, isCellDirty } = useBulkEditor({
    projectId,
    onSaveSuccess: () => {
      toast.success(intl.formatMessage(messages.saveSuccess));
    },
    onSaveError: () => {
      toast.error(intl.formatMessage(messages.saveError));
    },
  });

  React.useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const rows = React.useMemo(() => transformStringsToBulkEditorRows(strings), [strings]);
  const locales = project?.enabledLocales ?? [];

  const isLoading = isProjectLoading || isStringsLoading;

  if (isLoading) {
    return (
      <Box px="6" py="5">
        <Text>
          <FormattedMessage {...messages.loadingStrings} />
        </Text>
      </Box>
    );
  }

  if (isProjectError || isStringsError || project == null) {
    return <ProjectError is4xxError={is4xxError} />;
  }

  return (
    <Box px="6" py="5">
      <BulkEditorHeader
        projectId={projectId}
        projectName={project.name}
        isDirty={isDirty}
        dirtyCount={dirtyCount}
        isSaving={isSaving}
        onSave={handleSave}
      />

      <BulkEditorTable
        rows={rows}
        locales={locales}
        getCellValue={getCellValue}
        isCellDirty={isCellDirty}
        onCellChange={updateCell}
      />
    </Box>
  );
}
