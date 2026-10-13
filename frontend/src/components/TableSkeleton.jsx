// Generic premium skeleton for admin data tables — renders placeholder <tr>/<td>
// rows matching the real table's column count, so the loading state keeps the
// exact layout (no layout shift once real rows replace it).
export default function TableSkeleton({ rows = 6, columns = 5, firstColNarrow = true }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: columns }).map((_, c) => (
            <td key={c}>
              <div
                className="skeleton"
                style={{
                  height: 13,
                  width: firstColNarrow && c === 0 ? '24px' : c === columns - 1 ? '60%' : `${55 + ((r + c) % 3) * 12}%`,
                  borderRadius: 4,
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
