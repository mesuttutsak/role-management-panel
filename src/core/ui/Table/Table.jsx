import { classNames } from "../../utils/general";
import styles from "./Table.module.css";

const mergeClasses = (...values) => values.filter(Boolean).join(" ");

export const TableSurface = ({ children, className }) => (
  <div className={classNames([styles.surface, className])}>
    {children}
  </div>
);

export const Table = ({ children }) => (
  <table className={styles.table}>{children}</table>
);

export const TableHead = ({ children }) => (
  <thead className={styles.head} style={{ height: '50px' }}>{children}</thead>
);

export const TableBody = ({ children }) => (
  <tbody className={styles.body}>{children}</tbody>
);

export const TableRow = ({ children, className }) => (
  <tr className={mergeClasses(styles.row, className)}>{children}</tr>
);

export const TableCell = ({ children, className }) => (
  <td className={mergeClasses(styles.cell, className)}>{children}</td>
);

export const TableHeaderCell = ({ children, className }) => (
  <th scope="col" className={mergeClasses(styles.headerCell, className)}>
    {children}
  </th>
);
