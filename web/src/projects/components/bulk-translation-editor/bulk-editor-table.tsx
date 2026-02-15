import { Box, Table, Text } from '@radix-ui/themes';
import { useIntl, FormattedMessage } from 'react-intl';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';

import type { BulkEditorRow } from '@/projects/hooks/use-bulk-editor';
import BulkEditorCell from './bulk-editor-cell';
import messages from './messages';

interface BulkEditorTableProps {
  rows: BulkEditorRow[];
  locales: string[];
  getCellValue: (row: BulkEditorRow, locale: string) => string;
  isCellDirty: (stringKey: string, locale: string) => boolean;
  onCellChange: (stringKey: string, locale: string, value: string) => void;
}

const columnHelper = createColumnHelper<BulkEditorRow>();

function buildColumns(
  locales: string[],
  keyHeaderLabel: string,
  getCellValue: BulkEditorTableProps['getCellValue'],
  isCellDirty: BulkEditorTableProps['isCellDirty'],
  onCellChange: BulkEditorTableProps['onCellChange'],
): ColumnDef<BulkEditorRow, string>[] {
  const keyColumn = columnHelper.accessor('stringKey', {
    header: () => keyHeaderLabel,
    cell: info => (
      <Text size="2" weight="medium" style={{ wordBreak: 'break-all' }}>
        {info.getValue()}
      </Text>
    ),
  });

  const localeColumns = locales.map(locale =>
    columnHelper.display({
      id: locale,
      header: () => locale,
      cell: ({ row }) => (
        <BulkEditorCell
          value={getCellValue(row.original, locale)}
          isDirty={isCellDirty(row.original.stringKey, locale)}
          onChange={newValue => onCellChange(row.original.stringKey, locale, newValue)}
        />
      ),
    }),
  );

  return [keyColumn, ...localeColumns] as ColumnDef<BulkEditorRow, string>[];
}

function BulkEditorTable({ rows, locales, getCellValue, isCellDirty, onCellChange }: BulkEditorTableProps) {
  const intl = useIntl();
  const columns = buildColumns(
    locales,
    intl.formatMessage(messages.columnKey),
    getCellValue,
    isCellDirty,
    onCellChange,
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.stringKey,
  });

  if (rows.length === 0) {
    return (
      <Box py="6" style={{ textAlign: 'center' }}>
        <Text size="3" color="gray">
          <FormattedMessage {...messages.emptyTableMessage} />
        </Text>
      </Box>
    );
  }

  return (
    <Box style={{ overflowX: 'auto' }}>
      <Table.Root variant="surface" role="grid">
        <Table.Header>
          {table.getHeaderGroups().map(headerGroup => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <Table.ColumnHeaderCell
                  key={header.id}
                  style={{ minWidth: header.id === 'stringKey' ? '200px' : '250px' }}
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map(row => (
            <Table.Row key={row.id}>
              {row.getVisibleCells().map(cell => (
                <Table.Cell
                  key={cell.id}
                  style={{
                    padding: cell.column.id === 'stringKey' ? undefined : '0',
                    verticalAlign: 'middle',
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}

export default BulkEditorTable;
