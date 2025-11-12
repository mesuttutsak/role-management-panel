import { useEffect, useRef, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { TableSurface, Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "../../../../../core/ui/Table";
import { Spinner } from "../../../../../core/ui/Spinner";
import { Surface } from "../../../../../core/ui/Surface";
import { StringFilterInput } from "./StringFilterInput";
import { classNames } from "../../../../../core/utils/general";
import styles from "./PaginatedTable.module.css";

const DEFAULT_CLASSNAMES = {
  tableSurface: styles.tableSurface,
  filterRow: styles.filterRow,
  actionCell: styles.actionCell,
  emptyStateCell: styles.emptyStateCell,
  paginationSurface: styles.paginationSurface,
  pageSizeSelect: styles.pageSizeSelect,
  paginationButtonGroup: styles.paginationButtonGroup,
  paginationButton: styles.paginationButton,
  pageInputWrap: styles.pageInputWrap,
  pageInput: styles.pageInput,
  paginationTotal: styles.paginationTotal,
  totalSpinner: styles.totalSpinner,
};

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10];

const renderFilterControl = ({
  column,
  filters,
  onFilterChange,
}) => {
  const filterConfig = column?.filter;
  if (!filterConfig || typeof onFilterChange !== "function") {
    return null;
  }

  const filterKey = filterConfig.filterKey ?? column.accessorKey;
  const commonProps = {
    filterKey,
    value: filters?.[filterKey] ?? "",
    placeholder: filterConfig.placeholder,
    onChange: onFilterChange,
    disabled: filterConfig.disabled,
    ...(filterConfig.props || {}),
  };

  switch (filterConfig.type) {
    case "string":
      return <StringFilterInput {...commonProps} />;
    case "select": {
      const options = Array.isArray(filterConfig.options)
        ? filterConfig.options
        : [];
      return (
        <select
          value={commonProps.value}
          onChange={(event) => onFilterChange(filterKey, event.target.value)}
          disabled={commonProps.disabled}
          className={styles.filterSelect}
        >
          {options.map((option) => (
            <option
              key={option.value ?? option.label ?? ""}
              value={option.value ?? ""}
            >
              {option.label ?? option.value ?? ""}
            </option>
          ))}
        </select>
      );
    }
    default:
      return null;
  }
};

export function PaginatedTable({
  columns,
  data,
  status = "idle",
  filters = {},
  onFilterChange,
  loadingMessage,
  emptyMessage,
  page,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  totalCount,
  totalLoading,
  hasMore = false,
  onPrev,
  onNext,
  onPageSizeChange,
  onDirectPageChange,
  className = {},
}) {
  const resolvedClassNames = { ...DEFAULT_CLASSNAMES, ...className };
  const tableSurfaceRef = useRef(null);
  const [headElevated, setHeadElevated] = useState(false);
  const fallbackLoadingMessage = loadingMessage ?? "Records are loading...";
  const fallbackEmptyMessage = emptyMessage ?? "No records found";

  useEffect(() => {
    const node = tableSurfaceRef.current;
    if (!node) {
      return;
    }

    const handleScroll = () => {
      setHeadElevated(node.scrollTop > 0);
    };

    handleScroll();
    node.addEventListener("scroll", handleScroll);
    return () => node.removeEventListener("scroll", handleScroll);
  }, []);

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    columnResizeMode: "onChange",
  });

  const columnCount = table.getAllColumns().length;
  const headerGroups = table.getHeaderGroups();
  const hasFilters = headerGroups.some((group) =>
    group.headers.some((header) => header.column.columnDef?.filter)
  );

  const isInitialLoading = status === "loading" && (data || []).length === 0;
  const isEmpty = !isInitialLoading && (data || []).length === 0;
  const canGoPrev = page > 1 && status !== "loading";
  const canGoNext = hasMore && status !== "loading";
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 1;
  const safeTotalCount = Number.isFinite(totalCount) ? Math.max(totalCount, 0) : 0;
  const totalPages = Math.max(1, Math.ceil(Math.max(safeTotalCount, 1) / safePageSize));

  const renderFilterRow = () => {
    if (!hasFilters || headerGroups.length === 0) {
      return null;
    }

    const firstGroupHeaders = headerGroups[0].headers;
    return (
      <TableRow className={resolvedClassNames.filterRow}>
        {firstGroupHeaders.map((header) => (
          <TableHeaderCell key={`filter_${header.id}`}>
            {renderFilterControl({
              column: header.column.columnDef,
              filters,
              onFilterChange,
            })}
          </TableHeaderCell>
        ))}
      </TableRow>
    );
  };

  return (
    <>
      <TableSurface
        ref={tableSurfaceRef}
        className={classNames([
          resolvedClassNames.tableSurface,
          headElevated ? styles.tableSurfaceShadow : null,
        ])}
      >
        <Table>
          <TableHead>
            {headerGroups.map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHeaderCell key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHeaderCell>
                ))}
              </TableRow>
            ))}
            {renderFilterRow()}
          </TableHead>
          <TableBody>
            {isInitialLoading ? (
              <TableRow>
                <TableCell colSpan={columnCount} className={resolvedClassNames.emptyStateCell}>
                  <Spinner message={fallbackLoadingMessage} />
                </TableCell>
                <TableCell colSpan={columnCount}></TableCell>
                <TableCell colSpan={columnCount}></TableCell>
                <TableCell colSpan={columnCount}></TableCell>
                <TableCell colSpan={columnCount} className={resolvedClassNames.actionCell}></TableCell>
              </TableRow>
            ) : isEmpty ? (
              <TableRow>
                <TableCell colSpan={columnCount} className={resolvedClassNames.emptyStateCell}>
                  {fallbackEmptyMessage}
                </TableCell>
                <TableCell colSpan={columnCount}></TableCell>
                <TableCell colSpan={columnCount}></TableCell>
                <TableCell colSpan={columnCount}></TableCell>
                <TableCell colSpan={columnCount} className={resolvedClassNames.actionCell}></TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      className={
                        index === row.getVisibleCells().length - 1
                          ? resolvedClassNames.actionCell
                          : undefined
                      }
                      key={cell.id}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableSurface>

      <Surface fullWidth className={resolvedClassNames.paginationSurface}>
        <select
          className={resolvedClassNames.pageSizeSelect}
          value={pageSize}
          onChange={(event) => {
            const nextSize = Number(event.target.value);
            if (!Number.isNaN(nextSize) && typeof onPageSizeChange === "function") {
              onPageSizeChange(nextSize);
            }
          }}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <div className={resolvedClassNames.paginationButtonGroup}>
          <button
            type="button"
            onClick={onPrev}
            disabled={!canGoPrev}
            className={resolvedClassNames.paginationButton}
          >
            {"<"}
          </button>
          <div className={resolvedClassNames.pageInputWrap}>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={page}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (!Number.isNaN(next) && typeof onDirectPageChange === "function") {
                  const safePage = Math.min(Math.max(1, next), totalPages);
                  onDirectPageChange(safePage);
                }
              }}
              className={resolvedClassNames.pageInput}
            />
            <span className="text-slate-400">/</span>
            <span className="text-slate-400">{totalPages}</span>
          </div>
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            className={resolvedClassNames.paginationButton}
          >
            {">"}
          </button>
        </div>
        <span className={resolvedClassNames.paginationTotal}>
          {totalLoading ? (
            <span className={resolvedClassNames.totalSpinner} aria-live="polite" />
          ) : (
            totalCount
          )}
        </span>
      </Surface>
    </>
  );
}
