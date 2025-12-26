export const toCSV = (headers: string[], rows: string[][]): string => {
    const escape = (value: string) =>
        `"${value.replace(/"/g, '""')}"`;

    const headerLine = headers.map(escape).join(',');
    const dataLines = rows.map(row =>
        row.map(v => escape(v)).join(',')
    );

    return [headerLine, ...dataLines].join('\n');
};
