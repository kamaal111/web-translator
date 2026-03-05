import { lazy, Suspense } from 'react';
import { useParams } from 'react-router';
import { Spinner } from '@radix-ui/themes';

const BulkEditorPage = lazy(() =>
  import('@/projects/components/bulk-translation-editor/bulk-editor-page').then(m => ({
    default: m.BulkEditorPage,
  })),
);

function BulkEditor() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return null;
  }

  return (
    <Suspense fallback={<Spinner size="3" />}>
      <BulkEditorPage projectId={id} />
    </Suspense>
  );
}

export default BulkEditor;
